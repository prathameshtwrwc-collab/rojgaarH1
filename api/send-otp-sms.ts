// Sends an OTP SMS via HanuOTP, server-side.
//
// This exists because HanuOTP's API doesn't send CORS headers that let a browser read
// its response, and because the API key must never ship in the client bundle. The
// previous client-side implementation called HanuOTP directly with `mode: 'no-cors'` in
// production, which meant it could never see whether the SMS actually sent — it always
// reported success to the user, even when the request failed outright.
//
// Reads its credentials from the Vercel environment variables HANU_OTP_API_KEY and
// HANU_OTP_TEMPLATE_ID (also set in .env for local use via `vercel dev`). Nothing
// secret is hardcoded here.

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const phone = String(body.phone || '').replace(/^\+?91/, '').replace(/\D/g, '');
  const otp = String(body.otp || '').trim();

  if (!/^[6-9]\d{9}$/.test(phone)) {
    res.status(400).json({ success: false, message: 'Enter a valid 10-digit phone number.' });
    return;
  }
  if (!/^\d{4,8}$/.test(otp)) {
    res.status(400).json({ success: false, message: 'A valid OTP is required.' });
    return;
  }

  const apiKey = process.env.HANU_OTP_API_KEY;
  const templateId = process.env.HANU_OTP_TEMPLATE_ID;
  if (!apiKey || !templateId) {
    console.error('HanuOTP is not configured: set HANU_OTP_API_KEY and HANU_OTP_TEMPLATE_ID in Vercel.');
    res.status(500).json({ success: false, message: 'SMS service is not configured. Please contact support.' });
    return;
  }

  const params = new URLSearchParams({
    number: phone,
    OTP: otp,
    apikey: apiKey,
    templatesid: templateId,
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`https://api.hanuotp.in/sms-otp.php?${params.toString()}`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const text = await response.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch { /* HanuOTP sometimes replies with plain text */ }

    const ok = response.ok && (data?.status === 'success' || data?.type === 'success' || /success/i.test(text));
    if (ok) {
      res.status(200).json({ success: true, message: 'OTP sent successfully' });
      return;
    }

    console.error('HanuOTP send failed:', response.status, text);
    res.status(502).json({ success: false, message: data?.message || data?.error || 'Could not send the OTP SMS. Please try again.' });
  } catch (err: any) {
    console.error('HanuOTP request error:', err);
    const timedOut = err?.name === 'AbortError';
    res.status(502).json({
      success: false,
      message: timedOut ? 'The SMS service took too long to respond. Please try again.' : 'Could not reach the SMS service. Please try again.',
    });
  }
}
