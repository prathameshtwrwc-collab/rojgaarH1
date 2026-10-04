// SMS service for HanuOTP.
//
// Local dev (`npm run dev`): the Vite dev server proxies /api/hanuotp straight to
// HanuOTP (see vite.config.ts), running in Node, so CORS doesn't apply and the real
// response can be read here directly.
//
// Production: HanuOTP's API doesn't send CORS headers that allow reading its response
// from a browser, and the API key must never ship in the client bundle. So in
// production this calls our own serverless function at /api/send-otp-sms (see
// api/send-otp-sms.ts), which makes the real HanuOTP call server-side and returns a
// real, readable success or failure — not a blind "it probably worked".

const HANU_DEV_ENDPOINT = '/api/hanuotp';
const HANU_PROD_ENDPOINT = '/api/send-otp-sms';
// Used only for the local dev proxy above (from .env); production reads its own
// credentials server-side (see api/send-otp-sms.ts), so nothing secret ships here.
const HANU_DEV_API_KEY = import.meta.env.VITE_HANU_OTP_API_KEY || '';
const HANU_DEV_TEMPLATE_ID = import.meta.env.VITE_HANU_OTP_TEMPLATE_ID || '';

export interface SendOtpResult {
  success: boolean;
  message: string;
}

/**
 * Sends a given 6-digit OTP by SMS via HanuOTP, and reports whether it actually sent.
 * Never assumes success: a network failure, a bad API key or a HanuOTP-side error all
 * come back as `{ success: false, message }` with a reason the user can act on.
 */
export async function sendCustomOtpSms(phone: string, otp: string): Promise<SendOtpResult> {
  const formattedPhone = phone.replace(/^\+?91/, '').replace(/\D/g, '');

  if (!/^[6-9]\d{9}$/.test(formattedPhone)) {
    return { success: false, message: 'Enter a valid 10-digit phone number.' };
  }

  try {
    if (import.meta.env.DEV) {
      const params = new URLSearchParams({
        number: formattedPhone,
        OTP: otp,
        apikey: HANU_DEV_API_KEY,
        templatesid: HANU_DEV_TEMPLATE_ID,
      });
      const response = await fetch(`${HANU_DEV_ENDPOINT}?${params.toString()}`, { method: 'GET' });
      const data = await response.json().catch(() => null);
      if (response.ok && (data?.status === 'success' || data?.type === 'success')) {
        return { success: true, message: 'OTP sent successfully' };
      }
      return { success: false, message: data?.message || data?.error || 'Failed to send OTP. Please try again.' };
    }

    const response = await fetch(HANU_PROD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formattedPhone, otp }),
    });
    const data = await response.json().catch(() => null);
    if (response.ok && data?.success) {
      return { success: true, message: data.message || 'OTP sent successfully' };
    }
    return { success: false, message: data?.message || 'Failed to send OTP. Please try again.' };
  } catch (error) {
    console.error('HanuOTP Error:', error);
    return { success: false, message: 'Could not reach the SMS service. Check your connection and try again.' };
  }
}

/** Generates a 6-digit OTP, for use with sendCustomOtpSms. */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
