import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthSuccessLine } from './AuthFields';
import { normalizeIndianPhone } from '../lib/authHelpers';
import { useAppTranslation } from '../hooks/useAppTranslation';

// Phone number + SMS code step shared by all three sign-up screens.
// It only draws the UI; the screen keeps the state and does the network calls.
export default function PhoneVerifyBox({
  phone,
  onPhoneChange,
  otp,
  onOtpChange,
  otpSent,
  verified,
  countdown,
  loading,
  onSend,
  onVerify,
  onEditNumber,
  onReset,
}: {
  phone: string;
  onPhoneChange: (v: string) => void;
  otp: string;
  onOtpChange: (v: string) => void;
  otpSent: boolean;
  verified: boolean;
  countdown: number;
  loading: boolean;
  onSend: () => void;
  onVerify: () => void;
  onEditNumber: () => void;
  onReset: () => void;
}) {
  const { t } = useAppTranslation();
  const otpRef = useRef<HTMLInputElement>(null);

  // Jump to the code box as soon as the SMS is on its way
  useEffect(() => {
    if (otpSent && !verified) {
      const id = setTimeout(() => otpRef.current?.focus(), 80);
      return () => clearTimeout(id);
    }
  }, [otpSent, verified]);

  // Verify by itself once all six digits are in (typed, pasted or autofilled)
  const lastAuto = useRef('');
  useEffect(() => {
    if (otpSent && !verified && !loading && otp.length === 6 && lastAuto.current !== otp) {
      lastAuto.current = otp;
      onVerify();
    }
  }, [otp, otpSent, verified, loading, onVerify]);

  const field =
    'auth-input w-full h-[48px] rounded-xl border border-slate-200 bg-white text-[var(--navy)] focus:outline-none focus:ring-4 focus:ring-[var(--orange)]/15 focus:border-[var(--orange)] disabled:bg-slate-100 disabled:text-slate-500 transition-[border-color,box-shadow]';

  return (
    <div className={`auth-otp rounded-2xl border p-4 transition-colors duration-300 ${verified ? 'bg-green-50/70 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
      {verified ? (
        <AuthSuccessLine
          action={<button type="button" onClick={onReset} className="text-xs font-bold text-[var(--navy)] underline underline-offset-2 py-1">Change</button>}
        >
          {t('auth.phoneVerified')} · +91 {phone}
        </AuthSuccessLine>
      ) : (
        <>
          <p className="text-[13px] font-bold text-[var(--navy)] mb-0.5">{t('auth.verifyPhone')}</p>
          <p className="text-[12px] text-slate-500 mb-3" aria-live="polite">
            {otpSent ? `Enter the 6-digit code sent to +91 ${phone}` : 'We will text you a 6-digit code.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:flex-1">
              <span className="absolute left-0 top-0 bottom-0 w-[52px] flex items-center justify-center text-[14px] font-bold text-[var(--navy)] border-r border-slate-200 pointer-events-none">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                aria-label="Mobile number"
                value={phone}
                onChange={e => onPhoneChange(normalizeIndianPhone(e.target.value))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (phone.length === 10 && !otpSent) onSend(); } }}
                disabled={otpSent}
                className={`${field} pl-[62px] pr-4 text-[15px] sm:text-sm tracking-wide`}
                placeholder="98765 43210"
              />
            </div>
            {!otpSent ? (
              <button
                type="button"
                onClick={onSend}
                disabled={loading || phone.length !== 10}
                className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap h-[48px] px-5 inline-flex items-center justify-center gap-2 bg-[var(--orange)] text-white text-sm font-bold rounded-full active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? t('auth.sendingOtp') : t('auth.sendOtp')}
              </button>
            ) : (
              <button
                type="button"
                onClick={onEditNumber}
                className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap h-[48px] px-5 bg-white border border-slate-300 text-[var(--navy)] text-sm font-bold rounded-full hover:bg-slate-50 active:scale-[0.97] transition-all"
              >
                Change number
              </button>
            )}
          </div>

          {otpSent && (
            <div className="auth-swap mt-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  ref={otpRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label="6-digit code"
                  value={otp}
                  onChange={e => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (otp.length === 6) onVerify(); } }}
                  maxLength={6}
                  className={`${field} sm:flex-1 px-4 text-[18px] font-bold text-center tracking-[0.55em]`}
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={onVerify}
                  disabled={loading || otp.length !== 6}
                  className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap h-[48px] px-5 inline-flex items-center justify-center gap-2 bg-[var(--navy)] text-white text-sm font-bold rounded-full active:scale-[0.97] transition-all disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? t('auth.verifying') : t('auth.verifyOtp')}
                </button>
              </div>
              <div className="mt-2.5 min-h-[20px]" aria-live="polite">
                {countdown > 0 ? (
                  <p className="text-xs text-slate-500 tabular-nums">{t('auth.resendCode', { count: countdown })}</p>
                ) : (
                  <button
                    type="button"
                    onClick={onSend}
                    disabled={loading}
                    className="text-xs font-bold text-[var(--orange)] hover:underline disabled:opacity-50 py-1"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
