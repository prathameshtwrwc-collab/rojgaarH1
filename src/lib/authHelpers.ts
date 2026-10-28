// Small helpers shared by every sign-in and sign-up screen

export type AppRole = 'candidate' | 'employer' | 'recruiter' | 'superadmin' | string;

/** Where each kind of account lives once signed in */
export function roleHome(role: AppRole | undefined | null): string {
  switch (role) {
    case 'superadmin': return '/admin';
    case 'employer': return '/dashboard/employer';
    case 'recruiter': return '/dashboard/recruiter';
    default: return '/dashboard/candidate';
  }
}

/**
 * Pick where to send someone after they sign in. The page they came from wins,
 * but only when it is a page their account can open, otherwise they would bounce
 * between the login screen and a protected page forever.
 */
export function postLoginPath(role: AppRole | undefined | null, from?: string | null): string {
  const home = roleHome(role);
  if (!from || !from.startsWith('/') || from.startsWith('//')) return home;
  if (from.startsWith('/login') || from.startsWith('/register') || from === '/admin/login') return home;
  if (from.startsWith('/admin') || from.startsWith('/employer/') || from.startsWith('/recruiter/')) {
    return role === 'superadmin' ? from : home;
  }
  if (from.startsWith('/dashboard/')) {
    return from.startsWith(home) ? from : home;
  }
  return from;
}

/** Keep only digits and drop a leading +91 / 0 so people can paste numbers however they like */
export function normalizeIndianPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export const isValidIndianMobile = (phone: string) => /^[6-9]\d{9}$/.test(phone);
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

/** Turn Supabase / network errors into sentences a job seeker can act on */
export function friendlyAuthError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const raw = (err instanceof Error ? err.message : (err as { message?: string })?.message) || '';
  const m = raw.toLowerCase();
  if (!raw) return fallback;
  if (m.includes('invalid login credentials')) return 'That password does not match this account. Check it and try again.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox for the link we sent.';
  if (m.includes('no account found')) return 'We could not find an account with this phone number. Check the number or sign up.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'No internet connection. Check your network and try again.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a minute and try again.';
  if (m.includes('already registered') || m.includes('already exists')) return raw.endsWith('.') ? raw : `${raw}.`;
  if (m.includes('password should be at least')) return 'Your password needs at least 6 characters.';
  return raw;
}

/** 0 to 4, used for the password strength meter on sign-up screens */
export function passwordStrength(pw: string): { score: number; label: string } {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  else if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score = Math.max(score, Math.min(score + 0.5, 4));
  const s = Math.max(1, Math.min(4, Math.round(score)));
  if (pw.length < 6) return { score: 1, label: 'Too short' };
  return { score: s, label: ['', 'Weak', 'Okay', 'Good', 'Strong'][s] };
}
