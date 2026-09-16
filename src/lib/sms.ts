// SMS Service for HanuOTP
// Endpoint: https://api.hanuotp.in/sms-otp.php?number=mobile_number&OTP=otp&apikey=apikey&templatesid=default

const HANU_API_KEY = 'bc6aa8f3afb502ddfa3bdbcf4c6c357f';
const HANU_ENDPOINT = import.meta.env.DEV ? '/api/hanuotp' : 'https://api.hanuotp.in/sms-otp.php';

export interface SendOtpResult {
  success: boolean;
  message: string;
  otp?: string;
}

/**
 * Send OTP SMS via HanuOTP API
 * @param phone - 10-digit Indian phone number (starting with 6,7,8,9)
 * @returns Response with OTP (if auto-generated) and status
 */
export async function sendOtpSms(phone: string): Promise<SendOtpResult> {
  // HanuOTP expects raw 10-digit Indian number (no country code)
  const formattedPhone = phone.replace(/^\+?91/, '').replace(/\D/g, '');

  const params = new URLSearchParams({
    number: formattedPhone,
    OTP: '', // Leave empty for auto-generated OTP
    apikey: HANU_API_KEY,
    templatesid: 'default',
  });

  const url = `${HANU_ENDPOINT}?${params.toString()}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    console.log('HanuOTP Response:', data);

    // HanuOTP returns status: "success" on success
    if (data.status === 'success' || data.type === 'success') {
      return {
        success: true,
        message: data.message || 'OTP sent successfully',
        otp: data.otp || data.OTP || undefined,
      };
    } else {
      return {
        success: false,
        message: data.message || data.error || 'Failed to send OTP',
      };
    }
  } catch (error) {
    console.error('HanuOTP Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Send custom OTP via HanuOTP (if you want to use your own OTP)
 * @param phone - Phone number
 * @param otp - Custom OTP code
 * @returns Response from API
 */
export async function sendCustomOtpSms(phone: string, otp: string): Promise<SendOtpResult> {
  // HanuOTP expects raw 10-digit Indian number (no country code)
  const formattedPhone = phone.replace(/^\+?91/, '').replace(/\D/g, '');

  const params = new URLSearchParams({
    number: formattedPhone,
    OTP: otp,
    apikey: HANU_API_KEY,
    templatesid: 'default',
  });

  const url = `${HANU_ENDPOINT}?${params.toString()}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    if (data.status === 'success' || data.type === 'success') {
      return { success: true, message: 'OTP sent successfully' };
    } else {
      return { success: false, message: data.message || data.error || 'Failed to send OTP' };
    }
  } catch (error) {
    console.error('HanuOTP Error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Generate a 6-digit OTP (for use with sendCustomOtpSms)
 * @returns 6-digit OTP string
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
