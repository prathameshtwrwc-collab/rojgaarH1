import { supabase } from './client';
import { sendCustomOtpSms, generateOtp } from '../sms';

export type UserRole = 'superadmin' | 'employer' | 'candidate' | 'recruiter';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Phone numbers aren't unique in Supabase Auth, so this is checked ourselves.
export async function phoneExists(phone: string): Promise<boolean> {
  if (!phone) return false;
  const { data } = await (supabase as any).rpc('phone_number_exists', { check_phone: phone });
  return Boolean(data);
}

// Email lives on auth.users, not public.profiles, so this goes through a SECURITY
// DEFINER RPC to check it ahead of time (e.g. before sending an OTP).
export async function emailExists(email: string): Promise<boolean> {
  if (!email) return false;
  const { data } = await (supabase as any).rpc('email_exists', { check_email: email });
  return Boolean(data);
}

export async function signUp(payload: SignupPayload) {
  const { email, password, fullName, phone, role } = payload;

  if (phone && (await phoneExists(phone))) {
    throw new Error('An account with this phone number already exists. Please sign in instead.');
  }
  if (email && (await emailExists(email))) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName,
        phone,
      },
    },
  });

  if (error) {
    if (/already registered|already exists|user_already_exists/i.test(error.message)) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }
    throw error;
  }

  if (!data.user) {
    throw new Error('Signup failed: no user returned');
  }

  // When Supabase is set to require email confirmation, signing up with an email that is
  // already registered still "succeeds" with an empty identities array, rather than an
  // error, so the signup flow can't be used to discover existing accounts. Treat that the
  // same as the explicit error above.
  if (data.user.identities && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }

  return data.user;
}

export async function signIn(payload: LoginPayload) {
  const { email, password } = payload;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  let role: UserRole = 'candidate';

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if ((profile as any)?.role) {
      role = (profile as any).role as UserRole;
    } else {
      role = (data.user.user_metadata?.role as UserRole) || 'candidate';
    }
  } catch (err) {
    console.error('Error fetching profile for role:', err);
    role = (data.user.user_metadata?.role as UserRole) || 'candidate';
  }

  return {
    id: data.user.id,
    email: data.user.email || '',
    role,
    fullName: data.user.user_metadata?.full_name || '',
    phone: data.user.user_metadata?.phone || data.user.phone || '',
  };
}

export async function updateProfile(updates: { fullName?: string; phone?: string }) {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      full_name: updates.fullName,
      phone: updates.phone,
    },
  });

  if (error) {
    throw error;
  }

  return data.user;
}

// ============================================================
// OTP Verification Functions
// ============================================================

/**
 * Check if a phone number exists in the candidates/profiles table
 * Uses SECURITY DEFINER function to bypass RLS
 */
export async function checkPhoneExists(phone: string): Promise<{ exists: boolean; email?: string }> {
  try {
    const { data, error } = await supabase.rpc('check_phone_exists', {
      check_phone: phone,
      check_role: 'candidate',
    } as any);

    if (error) {
      console.error('Error checking phone:', error);
      return { exists: false };
    }

    if (!data) {
      return { exists: false };
    }

    // Get email separately
    const { data: emailData, error: emailError } = await supabase.rpc('get_email_by_phone', {
      check_phone: phone,
    } as any);

    return { exists: true, email: emailError ? undefined : emailData || undefined };
  } catch (err) {
    console.error('Error checking phone:', err);
    return { exists: false };
  }
}

/**
 * Send OTP to phone number
 * Stores OTP in database and sends SMS
 */
export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  try {
    // Generate 6-digit OTP
    const otp = generateOtp();

    // Set expiry to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Store OTP in database
    const { error: dbError } = await supabase
      .from('otp_verifications' as any)
      .insert({
        phone,
        otp,
        expires_at: expiresAt,
        verified: false,
      } as any);

    if (dbError) {
      console.error('Error storing OTP:', dbError);
      return { success: false, message: 'Failed to generate OTP' };
    }

    // Send SMS
    const smsResult = await sendCustomOtpSms(phone, otp);

    if (!smsResult.success) {
      // Clean up stored OTP if SMS failed
      await supabase
        .from('otp_verifications' as any)
        .delete()
        .eq('phone', phone)
        .eq('otp', otp);

      return { success: false, message: smsResult.message };
    }

    return { success: true, message: 'OTP sent successfully' };
  } catch (err) {
    console.error('Send OTP Error:', err);
    return { success: false, message: err instanceof Error ? err.message : 'Failed to send OTP' };
  }
}

/**
 * Verify OTP code
 */
export async function verifyOtp(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase
      .from('otp_verifications' as any)
      .select('*')
      .eq('phone', phone)
      .eq('otp', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { success: false, message: 'Invalid or expired OTP' };
    }

    // Mark OTP as verified
    const { error: updateError } = await (supabase as any)
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', (data as any).id);

    if (updateError) {
      console.error('Error updating OTP:', updateError);
      return { success: false, message: 'Verification failed' };
    }

    return { success: true, message: 'OTP verified successfully' };
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return { success: false, message: 'Verification failed' };
  }
}

/**
 * Sign in with phone and password (after OTP verification)
 */
export async function signInWithPhone(phone: string, password: string) {
  // Get email using RPC function (bypasses RLS)
  const { data: emailData, error: profileError } = await supabase.rpc('get_email_by_phone', {
    check_phone: phone,
  } as any);

  if (profileError || !emailData) {
    throw new Error('No account found with this phone number');
  }

  // Sign in with email and password
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailData,
    password,
  });

  if (error) {
    throw error;
  }

  return data.user;
}
