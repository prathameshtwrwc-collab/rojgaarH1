import { supabase } from './client';

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
