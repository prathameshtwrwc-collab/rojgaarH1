import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { signIn } from '../lib/supabase/auth';
import { AuthField, PasswordField, AuthError, AuthSubmit } from './AuthFields';
import { friendlyAuthError, isValidEmail } from '../lib/authHelpers';
import { haptic } from '../lib/haptics';

// Email + password sign-in used by the employer, recruiter and admin screens
export default function EmailLoginForm({
  onSignedIn,
  placeholder = 'you@example.com',
  submitLabel = 'Sign In',
  tone = 'orange',
  externalError,
  showForgot = true,
}: {
  onSignedIn: () => Promise<void> | void;
  placeholder?: string;
  submitLabel?: string;
  tone?: 'orange' | 'navy';
  externalError?: string;
  showForgot?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = 'Enter your email address';
    else if (!isValidEmail(email)) errs.email = 'This email address does not look right';
    if (!password) errs.password = 'Enter your password';
    setFieldError(errs);
    if (errs.email || errs.password) {
      haptic('warn');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn({ email: email.trim().toLowerCase(), password });
      haptic('success');
      await onSignedIn();
    } catch (err) {
      haptic('error');
      setError(friendlyAuthError(err, 'Sign in failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthError message={error || externalError || ''} />
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField
          label="Email address"
          icon={<Mail size={17} />}
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="next"
          value={email}
          onChange={e => { setEmail(e.target.value); setFieldError(f => ({ ...f, email: undefined })); }}
          placeholder={placeholder}
          error={fieldError.email}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          enterKeyHint="go"
          value={password}
          onChange={e => { setPassword(e.target.value); setFieldError(f => ({ ...f, password: undefined })); }}
          placeholder="Your password"
          error={fieldError.password}
        />
        {showForgot && (
          <div className="flex justify-end -mt-1">
            <Link to="/contact" className="text-[12.5px] font-bold text-[var(--charcoal)] hover:text-[var(--orange)] py-1">
              Forgot password?
            </Link>
          </div>
        )}
        <AuthSubmit loading={loading} loadingText="Signing in…" tone={tone}>
          {submitLabel}
        </AuthSubmit>
      </form>
    </>
  );
}
