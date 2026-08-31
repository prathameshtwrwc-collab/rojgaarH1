// SMS Service for SMSLocal.in
// Documentation: https://app.smslocal.in/api/smsapi?key=Account key&route=Route&sender=Sender id&number=Number(s)&sms=Message&templateid=DLT_Templateid

const SMS_API_KEY = '77ea51970317a132650e3ca5f9f1938d';
const SMS_ENDPOINT = 'https://app.smslocal.in/api/smsapi';

export interface SmsConfig {
  route?: string;
  sender?: string;
  templateid?: string;
}

export interface SendSmsParams {
  phone: string;
  message: string;
  config?: SmsConfig;
}

/**
 * Send SMS via SMSLocal.in API
 * @param params - SMS parameters
 * @returns Response from SMS API
 */
export async function sendSms(params: SendSmsParams): Promise<{ success: boolean; message: string }> {
  const { phone, message, config } = params;

  const queryParams = new URLSearchParams({
    key: SMS_API_KEY,
    route: config?.route || '6', // Default route (Transactional)
    sender: config?.sender || 'ROJGAH', // Default sender ID
    number: phone,
    message: message,
    templateid: config?.templateid || '', // DLT template ID if required
  });

  const url = `${SMS_ENDPOINT}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      return { success: true, message: 'SMS sent successfully' };
    } else {
      console.error('SMS API Error:', data);
      return { success: false, message: data.message || 'Failed to send SMS' };
    }
  } catch (error) {
    console.error('SMS Send Error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Send OTP SMS
 * @param phone - Phone number
 * @param otp - OTP code
 * @returns Response from SMS API
 */
export async function sendOtpSms(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
  const message = `Your Rojgaar Hai verification code is: ${otp}. This code expires in 5 minutes. Do not share it with anyone.`;

  return sendSms({
    phone,
    message,
    config: {
      route: '6',
      sender: 'ROJGAH',
    },
  });
}

/**
 * Generate a 6-digit OTP
 * @returns 6-digit OTP string
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
