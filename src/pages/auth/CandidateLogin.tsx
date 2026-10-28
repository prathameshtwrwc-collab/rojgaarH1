import { useState, useEffect, useRef } from 'react';
import PageLoader from '../../components/PageLoader';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';
import { signIn, signInWithPhone } from '../../lib/supabase/auth';
import { useAuth } from '../../context/AuthContext';
import AuthSwitcher from '../../components/AuthSwitcher';
import { AuthField, PasswordField, AuthError, AuthSubmit } from '../../components/AuthFields';
import { friendlyAuthError, isValidEmail, isValidIndianMobile, normalizeIndianPhone, postLoginPath } from '../../lib/authHelpers';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { haptic } from '../../lib/haptics';

type LoginMethod = 'phone' | 'email';
const METHOD_KEY = 'rh.candidateLoginMethod';

function readMethod(): LoginMethod {
  try {
    return localStorage.getItem(METHOD_KEY) === 'email' ? 'email' : 'phone';
  } catch {
    return 'phone';
  }
}

export default function CandidateLogin() {
  const { t } = useAppTranslation();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(readMethod);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState<{ id?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const idRef = useRef<HTMLInputElement>(null);

  const { user, loading: authLoading, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  useEffect(() => {
    if (!authLoading && user) navigate(postLoginPath(user.role, from || '/dashboard/candidate'), { replace: true });
  }, [user, authLoading, navigate, from]);

  const switchMethod = (m: LoginMethod) => {
    if (m === loginMethod) return;
    haptic('select');
    setLoginMethod(m);
    setError('');
    setFieldError({});
    try { localStorage.setItem(METHOD_KEY, m); } catch { /* private mode */ }
    // Put the cursor straight into the new field
    setTimeout(() => idRef.current?.focus(), 60);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { id?: string; password?: string } = {};
    if (loginMethod === 'phone') {
      if (!phone) errs.id = 'Enter your mobile number';
      else if (!isValidIndianMobile(phone)) errs.id = 'Enter a valid 10-digit mobile number';
    } else {
      if (!email.trim()) errs.id = 'Enter your email address';
      else if (!isValidEmail(email)) errs.id = 'This email address does not look right';
    }
    if (!password) errs.password = 'Enter your password';
    setFieldError(errs);
    if (errs.id || errs.password) {
      haptic('warn');
      return;
    }

    setError('');
    setLoading(true);
    try {
      if (loginMethod === 'phone') await signInWithPhone(phone, password);
      else await signIn({ email: email.trim().toLowerCase(), password });
      haptic('success');
      await refresh();
    } catch (err) {
      haptic('error');
      setError(friendlyAuthError(err, 'Sign in failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <PageLoader />;

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center bg-[var(--bg-warm)] px-4 py-8">
      <div className="w-full max-w-[460px]">
        <div className="auth-card bg-white rounded-2xl shadow-lg p-8">
          <AuthSwitcher active="login" role="candidate" />
          <div className="text-center mb-6">
            <h1 className="auth-title text-3xl font-extrabold text-[var(--navy)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {t('auth.candidateLogin')}
            </h1>
            <p className="text-sm text-[var(--charcoal)]">{t('auth.welcomeBack')}</p>
          </div>

          {/* Phone or email, with a thumb that slides between them */}
          <div role="tablist" aria-label="Sign in with" className="relative grid grid-cols-2 bg-slate-100 rounded-full p-1 mb-6">
            <span
              aria-hidden
              className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ transform: loginMethod === 'email' ? 'translateX(100%)' : 'translateX(0)' }}
            />
            {(['phone', 'email'] as const).map(m => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={loginMethod === m}
                onClick={() => switchMethod(m)}
                className={`relative z-10 flex items-center justify-center gap-2 h-10 rounded-full text-sm font-bold transition-colors ${
                  loginMethod === m ? 'text-[var(--navy)]' : 'text-[var(--charcoal)] hover:text-[var(--navy)]'
                }`}
              >
                {m === 'phone' ? <Phone size={15} /> : <Mail size={15} />}
                {m === 'phone' ? t('auth.phoneLogin') : t('auth.email')}
              </button>
            ))}
          </div>

          <AuthError message={error} />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div key={loginMethod} className="auth-swap">
              {loginMethod === 'phone' ? (
                <AuthField
                  ref={idRef}
                  label="Mobile number"
                  prefix="+91"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  enterKeyHint="next"
                  value={phone}
                  onChange={e => { setPhone(normalizeIndianPhone(e.target.value)); setFieldError(f => ({ ...f, id: undefined })); }}
                  placeholder="98765 43210"
                  error={fieldError.id}
                  maxLength={14}
                />
              ) : (
                <AuthField
                  ref={idRef}
                  label="Email address"
                  icon={<Mail size={17} />}
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="next"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setFieldError(f => ({ ...f, id: undefined })); }}
                  placeholder="you@example.com"
                  error={fieldError.id}
                />
              )}
            </div>

            <PasswordField
              label="Password"
              autoComplete="current-password"
              enterKeyHint="go"
              value={password}
              onChange={e => { setPassword(e.target.value); setFieldError(f => ({ ...f, password: undefined })); }}
              placeholder="Your password"
              error={fieldError.password}
            />

            <div className="flex justify-end -mt-1">
              <Link to="/contact" className="text-[12.5px] font-bold text-[var(--charcoal)] hover:text-[var(--orange)] py-1">
                Forgot password?
              </Link>
            </div>

            <AuthSubmit loading={loading} loadingText={t('auth.signingIn')}>
              {t('auth.signIn')}
            </AuthSubmit>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--charcoal)]">
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/register/job-seeker" className="text-[var(--orange)] font-bold hover:underline">
                {t('auth.signUp')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
