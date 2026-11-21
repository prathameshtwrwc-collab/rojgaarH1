import { useEffect, useRef, useState } from 'react';
import { PartyPopper, ShieldCheck } from 'lucide-react';
import { Modal } from './ui';
import { PasswordField, AuthError, AuthSubmit } from './AuthFields';
import { useAuth } from '../context/AuthContext';
import { isPasswordResetPending, setNewPassword, setPasswordResetPending } from '../lib/supabase/passwordReset';
import { haptic } from '../lib/haptics';

// Opens on top of the dashboard right after someone signs in through "Forgot password",
// and asks for a new password twice. Mounted once in App, so every role gets it.

export default function ResetPasswordModal() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ pw?: string; confirm?: string }>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Open once a session exists and a reset is waiting; close if the person signs out
  useEffect(() => {
    if (loading) return;
    if (user && isPasswordResetPending()) {
      setOpen(true);
    } else if (!user) {
      setOpen(false);
      setDone(false);
    }
  }, [user, loading]);

  useEffect(() => {
    if (!open || done) return;
    const id = setTimeout(() => formRef.current?.querySelector('input')?.focus(), 380);
    return () => clearTimeout(id);
  }, [open, done]);

  const close = () => {
    if (busy) return;
    // Leaving without choosing: they stay signed in, and can change the password later
    setPasswordResetPending(false);
    setOpen(false);
    setPw('');
    setConfirm('');
    setError('');
    setErrors({});
    setDone(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const errs: { pw?: string; confirm?: string } = {};
    if (!pw) errs.pw = 'Enter a new password';
    else if (pw.length < 6) errs.pw = 'Use at least 6 characters';
    if (!confirm) errs.confirm = 'Type the new password again';
    else if (pw && confirm !== pw) errs.confirm = 'The two passwords do not match';
    setErrors(errs);
    if (errs.pw || errs.confirm) { haptic('warn'); return; }

    setError('');
    setBusy(true);
    const r = await setNewPassword(pw);
    setBusy(false);
    if (!r.ok) { haptic('error'); setError(r.message); return; }
    haptic('success');
    setDone(true);
    setPw('');
    setConfirm('');
  };

  return (
    <Modal isOpen={open} onClose={close} title={done ? 'Password updated' : 'Set a new password'} size="sm">
      {done ? (
        <div className="flex flex-col items-center text-center py-2 auth-swap">
          <span className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
            <PartyPopper size={30} />
          </span>
          <p className="text-[15px] font-bold text-[var(--navy)] mb-1">All set. Your password is changed.</p>
          <p className="text-[13px] text-[var(--charcoal)] mb-5 max-w-[300px]">Use your new password the next time you sign in.</p>
          <button
            type="button"
            onClick={close}
            className="w-full h-[50px] rounded-full bg-[var(--orange)] text-white text-[15px] font-bold active:scale-[0.98] transition shadow-[0_10px_24px_-12px_rgba(232,93,31,0.75)]"
          >
            Continue to dashboard
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 mb-5 p-3.5 rounded-xl bg-green-50 border border-green-200">
            <ShieldCheck size={20} className="text-green-600 flex-shrink-0 mt-px" />
            <p className="text-[13px] text-green-800 leading-relaxed">
              Your mobile number is verified{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}. Choose a new password for your account.
            </p>
          </div>

          <AuthError message={error} />

          <form ref={formRef} onSubmit={submit} className="space-y-4" noValidate>
            <PasswordField
              label="New password"
              autoComplete="new-password"
              enterKeyHint="next"
              showStrength
              value={pw}
              onChange={e => { setPw(e.target.value); setErrors(x => ({ ...x, pw: undefined })); }}
              placeholder="At least 6 characters"
              error={errors.pw}
            />
            <PasswordField
              label="Confirm new password"
              autoComplete="new-password"
              enterKeyHint="go"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setErrors(x => ({ ...x, confirm: undefined })); }}
              placeholder="Type it again"
              error={errors.confirm}
            />
            <AuthSubmit loading={busy} loadingText="Saving…">Save new password</AuthSubmit>
            <button type="button" onClick={close} disabled={busy} className="w-full text-[12.5px] font-bold text-slate-500 hover:text-[var(--navy)] py-1 disabled:opacity-50">
              Do this later
            </button>
          </form>
        </>
      )}
    </Modal>
  );
}
