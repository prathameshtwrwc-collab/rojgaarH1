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

export async function signUp(payload: SignupPayload) {
  const { email, password, fullName, phone, role } = payload;

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
    throw error;
  }

  if (!data.user) {
    throw new Error('Signup failed: no user returned');
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
    });

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
    });

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
      .from('otp_verifications')
      .insert({
        phone,
        otp,
        expires_at: expiresAt,
        verified: false,
      });

    if (dbError) {
      console.error('Error storing OTP:', dbError);
      return { success: false, message: 'Failed to generate OTP' };
    }

    // Send SMS
    const smsResult = await sendOtpSms(phone, otp);

    if (!smsResult.success) {
      // Clean up stored OTP if SMS failed
      await supabase
        .from('otp_verifications')
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
      .from('otp_verifications')
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
    const { error: updateError } = await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', data.id);

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
  });

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
