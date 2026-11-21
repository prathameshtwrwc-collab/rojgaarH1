import { useEffect, useRef, useState } from 'react';
import { KeyRound, MessageSquareText, ShieldCheck } from 'lucide-react';
import { Modal } from './ui';
import { AuthField, AuthError, AuthSubmit } from './AuthFields';
import { useAuth } from '../context/AuthContext';
import { isValidIndianMobile, normalizeIndianPhone } from '../lib/authHelpers';
import { sendResetCode, verifyResetCodeAndSignIn, type ResetRole } from '../lib/supabase/passwordReset';
import { haptic } from '../lib/haptics';

// Forgot password: mobile number -> 6-digit code by SMS -> signed in, where a
// "set new password" box opens on the dashboard (see ResetPasswordModal).

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  role,
  initialPhone = '',
}: {
  isOpen: boolean;
  onClose: () => void;
  role: ResetRole;
  initialPhone?: string;
}) {
  const { refresh } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const lastTried = useRef('');

  // Fresh start every time it opens
  useEffect(() => {
    if (!isOpen) return;
    setStep('phone');
    setPhone(normalizeIndianPhone(initialPhone));
    setOtp('');
    setError('');
    setFieldError('');
    setBusy(false);
    setCountdown(0);
    lastTried.current = '';
    const id = setTimeout(() => phoneRef.current?.focus(), 320);
    return () => clearTimeout(id);
  }, [isOpen, initialPhone]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (busy) return;
    if (!phone) { setFieldError('Enter your mobile number'); haptic('warn'); return; }
    if (!isValidIndianMobile(phone)) { setFieldError('Enter a valid 10-digit mobile number'); haptic('warn'); return; }
    setFieldError('');
    setError('');
    setBusy(true);
    const r = await sendResetCode(phone, role);
    setBusy(false);
    if (!r.ok) {
      haptic('error');
      setError(r.message);
      // Asked too soon: still let them type the code they already have
      if (r.resendIn > 0 && /wait/i.test(r.message)) { setStep('code'); setCountdown(r.resendIn); }
      return;
    }
    haptic('success');
    setStep('code');
    setOtp('');
    lastTried.current = '';
    setCountdown(r.resendIn || 45);
    setTimeout(() => otpRef.current?.focus(), 120);
  };

  const verify = async (code = otp) => {
    if (busy || code.length !== 6) return;
    setError('');
    setBusy(true);
    const r = await verifyResetCodeAndSignIn(phone, role, code);
    if (!r.ok) {
      setBusy(false);
      haptic('error');
      setError(r.message);
      setOtp('');
      lastTried.current = '';
      otpRef.current?.focus();
      return;
    }
    haptic('success');
    // The new session makes the login page forward to the dashboard by itself
    await refresh();
    setBusy(false);
    onClose();
  };

  // Check by itself once all six digits are in (typed, pasted or autofilled)
  useEffect(() => {
    if (step === 'code' && otp.length === 6 && !busy && lastTried.current !== otp) {
      lastTried.current = otp;
      verify(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, step, busy]);

  return (
    <Modal isOpen={isOpen} onClose={() => { if (!busy) onClose(); }} title="Forgot password" size="sm">
      <div className="flex flex-col items-center text-center mb-5">
        <span className="w-14 h-14 rounded-2xl bg-[var(--orange)]/10 text-[var(--orange)] flex items-center justify-center mb-3">
          {step === 'phone' ? <KeyRound size={26} /> : <MessageSquareText size={26} />}
        </span>
        <p className="text-[13.5px] text-[var(--charcoal)] leading-relaxed max-w-[320px]" aria-live="polite">
          {step === 'phone'
            ? 'Enter the mobile number on your account. We will text you a 6-digit code and sign you in, so you can choose a new password.'
            : `We sent a 6-digit code to +91 ${phone}. Enter it below.`}
        </p>
      </div>

      <AuthError message={error} />

      {step === 'phone' ? (
        <form onSubmit={sendCode} className="space-y-4 auth-swap" noValidate>
          <AuthField
            ref={phoneRef}
            label="Mobile number"
            prefix="+91"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            enterKeyHint="send"
            value={phone}
            onChange={e => { setPhone(normalizeIndianPhone(e.target.value)); setFieldError(''); }}
            placeholder="98765 43210"
            error={fieldError}
            maxLength={14}
          />
          <AuthSubmit loading={busy} loadingText="Sending code…">Send code</AuthSubmit>
        </form>
      ) : (
        <form onSubmit={e => { e.preventDefault(); verify(); }} className="space-y-4 auth-swap" noValidate>
          <input
            ref={otpRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="6-digit code"
            value={otp}
            disabled={busy}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            placeholder="••••••"
            className="auth-input w-full h-[56px] rounded-xl border border-slate-200 bg-white text-[var(--navy)] text-[22px] font-bold text-center tracking-[0.55em] focus:outline-none focus:ring-4 focus:ring-[var(--orange)]/15 focus:border-[var(--orange)] disabled:bg-slate-50 transition-[border-color,box-shadow]"
          />
          <AuthSubmit loading={busy} loadingText="Checking…" disabled={otp.length !== 6} tone="navy">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={18} /> Verify &amp; sign in
            </span>
          </AuthSubmit>
          <div className="flex items-center justify-between text-xs min-h-[28px]">
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); setError(''); setCountdown(0); setTimeout(() => phoneRef.current?.focus(), 80); }}
              disabled={busy}
              className="font-bold text-[var(--navy)] hover:underline py-1 disabled:opacity-50"
            >
              Change number
            </button>
            {countdown > 0 ? (
              <span className="text-slate-500 tabular-nums">Resend code in {countdown}s</span>
            ) : (
              <button type="button" onClick={() => sendCode()} disabled={busy} className="font-bold text-[var(--orange)] hover:underline py-1 disabled:opacity-50">
                Resend code
              </button>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}
