import { supabase } from './client';

// Client side of the forgot-password flow. The real work happens in api/password-reset.ts.

export type ResetRole = 'candidate' | 'employer' | 'recruiter';

const PENDING_KEY = 'rh.pendingPasswordReset';

/** True when someone just signed in through "Forgot password" and still has to choose a new one */
export const isPasswordResetPending = (): boolean => {
  try { return sessionStorage.getItem(PENDING_KEY) === '1'; } catch { return false; }
};
export const setPasswordResetPending = (on: boolean) => {
  try { on ? sessionStorage.setItem(PENDING_KEY, '1') : sessionStorage.removeItem(PENDING_KEY); } catch { /* private mode */ }
};

async function call(body: Record<string, unknown>): Promise<{ ok: boolean; message: string; data: any }> {
  try {
    const res = await fetch('/api/password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) return { ok: true, message: data.message || '', data };
    if (!data) return { ok: false, message: 'Password reset is not available right now. Please try again shortly.', data: null };
    return { ok: false, message: data.message || 'Something went wrong. Please try again.', data };
  } catch {
    return { ok: false, message: 'No internet connection. Check your network and try again.', data: null };
  }
}

export async function sendResetCode(phone: string, role: ResetRole) {
  const r = await call({ action: 'send', phone, role });
  return { ok: r.ok, message: r.message, resendIn: Number(r.data?.resendIn ?? r.data?.retryAfter ?? 45) };
}

/** Checks the code and, if it is right, signs the person in. */
export async function verifyResetCodeAndSignIn(phone: string, role: ResetRole, otp: string): Promise<{ ok: boolean; message: string }> {
  const r = await call({ action: 'verify', phone, role, otp });
  if (!r.ok) return { ok: false, message: r.message };

  // Mark the reset as pending BEFORE the session exists, so the new-password box is
  // waiting by the time the dashboard opens.
  setPasswordResetPending(true);
  const { error } = await supabase.auth.verifyOtp({ token_hash: r.data.tokenHash, type: 'magiclink' });
  if (error) {
    setPasswordResetPending(false);
    return { ok: false, message: 'Could not sign you in. Please ask for a new code.' };
  }
  return { ok: true, message: '' };
}

export async function setNewPassword(password: string): Promise<{ ok: boolean; message: string }> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes('same') && m.includes('password')) return { ok: false, message: 'Choose a password you have not used before.' };
    if (m.includes('at least')) return { ok: false, message: 'Your password needs at least 6 characters.' };
    if (m.includes('session') || m.includes('not authenticated')) return { ok: false, message: 'Your session expired. Please use Forgot password again.' };
    return { ok: false, message: error.message };
  }
  setPasswordResetPending(false);
  return { ok: true, message: '' };
}
