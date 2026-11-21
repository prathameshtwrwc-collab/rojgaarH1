// Forgot password by SMS code, server-side.
//
//   POST { action: 'send',   phone, role }        -> texts a 6-digit code
//   POST { action: 'verify', phone, role, otp }   -> checks it and returns a one-time sign-in token
//
// Why a server function: the code must be checked somewhere the person cannot tamper with, and
// signing someone in without their password needs the Supabase service-role key, which must
// never ship in the browser. Codes are stored hashed, expire in 10 minutes, allow 5 wrong
// guesses, and sending is rate limited per number.
//
// Needs these Vercel environment variables (also in .env for `npm run dev`):
//   SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY,
//   HANU_OTP_API_KEY, HANU_OTP_TEMPLATE_ID
// and the table from supabase/password-reset.sql.

import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_GAP_MS = 45 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;
const ROLES = ['candidate', 'employer', 'recruiter'];

const send = (res: any, status: number, body: Record<string, unknown>) => res.status(status).json(body);

const hashCode = (phone: string, otp: string, secret: string) =>
  createHash('sha256').update(`${phone}:${otp}:${secret}`).digest('hex');

async function sendSms(phone: string, otp: string): Promise<{ ok: boolean; message?: string }> {
  const apiKey = process.env.HANU_OTP_API_KEY;
  const templateId = process.env.HANU_OTP_TEMPLATE_ID;
  if (!apiKey || !templateId) return { ok: false, message: 'SMS service is not configured. Please contact support.' };

  const params = new URLSearchParams({ number: phone, OTP: otp, apikey: apiKey, templatesid: templateId });
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`https://api.hanuotp.in/sms-otp.php?${params.toString()}`, { signal: controller.signal });
    clearTimeout(timer);
    const text = await response.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch { /* plain-text reply */ }
    const ok = response.ok && (data?.status === 'success' || data?.type === 'success' || /success/i.test(text));
    return ok ? { ok: true } : { ok: false, message: data?.message || data?.error || 'Could not send the SMS. Please try again.' };
  } catch (err: any) {
    return { ok: false, message: err?.name === 'AbortError' ? 'The SMS service took too long. Please try again.' : 'Could not reach the SMS service. Please try again.' };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { success: false, message: 'Method not allowed' });

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('password-reset: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    return send(res, 500, { success: false, message: 'Password reset is not set up yet. Please contact support.' });
  }

  let body: any = {};
  try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); } catch { /* handled below */ }

  const action = String(body.action || '');
  const phone = String(body.phone || '').replace(/^\+?91/, '').replace(/\D/g, '');
  const role = String(body.role || '');
  if (!/^[6-9]\d{9}$/.test(phone)) return send(res, 400, { success: false, message: 'Enter a valid 10-digit mobile number.' });
  if (!ROLES.includes(role)) return send(res, 400, { success: false, message: 'Unknown account type.' });

  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // Phone numbers are stored as typed, so match the plain and +91 forms
  const { data: profiles, error: profileErr } = await db
    .from('profiles')
    .select('id, role, phone')
    .in('phone', [phone, `+91${phone}`, `91${phone}`])
    .eq('role', role)
    .limit(2);
  if (profileErr) {
    console.error('password-reset profile lookup:', profileErr);
    return send(res, 500, { success: false, message: 'Something went wrong. Please try again.' });
  }
  const profile = profiles?.[0];

  if (action === 'send') {
    if (!profile) return send(res, 404, { success: false, message: 'No account found with this mobile number. Check the number or sign up.' });

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recent } = await db
      .from('password_reset_otps')
      .select('created_at')
      .eq('phone', phone)
      .gte('created_at', since)
      .order('created_at', { ascending: false });
    if (recent && recent.length >= MAX_SENDS_PER_HOUR) {
      return send(res, 429, { success: false, message: 'Too many codes requested. Please try again in an hour.' });
    }
    if (recent?.[0]) {
      const wait = RESEND_GAP_MS - (Date.now() - new Date(recent[0].created_at).getTime());
      if (wait > 0) return send(res, 429, { success: false, retryAfter: Math.ceil(wait / 1000), message: `Please wait ${Math.ceil(wait / 1000)} seconds before asking for another code.` });
    }

    const otp = String(randomInt(100000, 1000000));
    const { error: insertErr } = await db.from('password_reset_otps').insert({
      user_id: profile.id,
      phone,
      role,
      code_hash: hashCode(phone, otp, serviceKey),
      expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
    });
    if (insertErr) {
      console.error('password-reset insert:', insertErr);
      return send(res, 500, { success: false, message: 'Password reset is not set up yet. Please contact support.' });
    }

    const sms = await sendSms(phone, otp);
    if (!sms.ok) {
      await db.from('password_reset_otps').delete().eq('phone', phone).eq('code_hash', hashCode(phone, otp, serviceKey));
      return send(res, 502, { success: false, message: sms.message });
    }
    return send(res, 200, { success: true, message: 'Code sent', resendIn: RESEND_GAP_MS / 1000 });
  }

  if (action === 'verify') {
    const otp = String(body.otp || '').replace(/\D/g, '');
    if (otp.length !== 6) return send(res, 400, { success: false, message: 'Enter the 6-digit code.' });
    if (!profile) return send(res, 400, { success: false, message: 'That code is not right or has expired.' });

    // Only the newest unused code counts
    const { data: rows } = await db
      .from('password_reset_otps')
      .select('id, code_hash, attempts, expires_at')
      .eq('user_id', profile.id)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1);
    const row = rows?.[0];
    if (!row || new Date(row.expires_at).getTime() < Date.now()) {
      return send(res, 400, { success: false, message: 'That code has expired. Ask for a new one.' });
    }
    if (row.attempts >= MAX_ATTEMPTS) {
      return send(res, 429, { success: false, message: 'Too many wrong tries. Ask for a new code.' });
    }

    const given = Buffer.from(hashCode(phone, otp, serviceKey));
    const stored = Buffer.from(row.code_hash);
    const match = given.length === stored.length && timingSafeEqual(given, stored);
    if (!match) {
      await db.from('password_reset_otps').update({ attempts: row.attempts + 1 }).eq('id', row.id);
      const left = MAX_ATTEMPTS - row.attempts - 1;
      return send(res, 400, { success: false, message: left > 0 ? `That code is not right. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong tries. Ask for a new code.' });
    }

    // Burn the code first so it can never be used twice
    const { data: burned } = await db.from('password_reset_otps').update({ used: true }).eq('id', row.id).eq('used', false).select('id');
    if (!burned || burned.length === 0) return send(res, 400, { success: false, message: 'That code was already used. Ask for a new one.' });

    const { data: userData, error: userErr } = await db.auth.admin.getUserById(profile.id);
    const email = userData?.user?.email;
    if (userErr || !email) return send(res, 500, { success: false, message: 'Could not find the sign-in email for this account. Please contact support.' });

    const { data: link, error: linkErr } = await db.auth.admin.generateLink({ type: 'magiclink', email });
    const tokenHash = link?.properties?.hashed_token;
    if (linkErr || !tokenHash) {
      console.error('password-reset generateLink:', linkErr);
      return send(res, 500, { success: false, message: 'Could not sign you in. Please try again.' });
    }
    return send(res, 200, { success: true, tokenHash });
  }

  return send(res, 400, { success: false, message: 'Unknown request.' });
}
