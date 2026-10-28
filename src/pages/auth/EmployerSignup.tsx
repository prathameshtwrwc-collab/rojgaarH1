import { useState, useEffect } from 'react';
import PageLoader from '../../components/PageLoader';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, ChevronDown, Mail, User } from 'lucide-react';
import { AuthField, PasswordField, AuthError, AuthSubmit } from '../../components/AuthFields';
import PhoneVerifyBox from '../../components/PhoneVerifyBox';
import { friendlyAuthError, isValidEmail, isValidIndianMobile, roleHome } from '../../lib/authHelpers';
import { haptic } from '../../lib/haptics';
import { signUp, sendOtp, verifyOtp, phoneExists, emailExists } from '../../lib/supabase/auth';
import { createEmployer } from '../../lib/supabase/data';
import { getSectorsList } from '../../constants/sectors';
import { useAuth } from '../../context/AuthContext';
import AuthSwitcher from '../../components/AuthSwitcher';
import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function EmployerSignup() {
  const { t } = useAppTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    industry: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [loading, setLoading] = useState(false);

  const [otpPhone, setOtpPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) navigate(roleHome(user.role), { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // Changing the number means verifying the new one from the start
  const resetPhone = () => {
    setOtpVerified(false);
    setOtpSent(false);
    setOtp('');
    setFormData(prev => ({ ...prev, phone: '' }));
  };

  const handleSendOtp = async () => {
    if (!isValidIndianMobile(otpPhone)) {
      setError(t('auth.enterValidPhone'));
      haptic('warn');
      return;
    }
    if (!isValidEmail(formData.email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Enter your email address first, we check it is not already in use' }));
      haptic('warn');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const [phoneTaken, emailTaken] = await Promise.all([
        phoneExists(otpPhone),
        emailExists(formData.email.trim().toLowerCase()),
      ]);
      if (phoneTaken || emailTaken) {
        setError(
          phoneTaken && emailTaken
            ? 'An account already exists with this phone number and email. Please sign in instead.'
            : phoneTaken
            ? 'An account with this phone number already exists. Please sign in instead.'
            : 'An account with this email already exists. Please sign in instead.'
        );
        return;
      }

      const result = await sendOtp(otpPhone);
      if (!result.success) {
        setError(result.message);
        return;
      }

      setOtpSent(true);
      setCountdown(30);
      haptic('success');
    } catch (err) {
      setError(friendlyAuthError(err, t('auth.sendOtpError')));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError(t('auth.enterValidOtp'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await verifyOtp(otpPhone, otp);
      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setOtpVerified(true);
      haptic('success');
      setFormData(prev => ({ ...prev, phone: otpPhone }));
    } catch (err) {
      setError(friendlyAuthError(err, t('auth.verifyOtpError')));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errs: typeof fieldErrors = {};
    if (formData.fullName.trim().length < 2) errs.fullName = 'Enter your full name';
    if (!isValidEmail(formData.email)) errs.email = 'Enter a valid email address';
    if (!formData.companyName.trim()) errs.companyName = 'Enter your company name';
    if (!formData.industry) errs.industry = 'Pick the closest industry';
    if (!formData.city.trim()) errs.city = 'Enter a city';
    if (!formData.state.trim()) errs.state = 'Enter a state';
    if (formData.password.length < 6) errs.password = t('auth.passwordMinLength');
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = t('auth.passwordsDoNotMatch');
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      haptic('warn');
      // Bring the first problem into view on small screens
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }

    if (!otpVerified) {
      setError(t('auth.verifyPhoneFirst'));
      return;
    }

    setLoading(true);

    try {
      const authUser = await signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        fullName: formData.fullName.trim().replace(/\s+/g, ' '),
        phone: formData.phone,
        role: 'employer',
      });
      await createEmployer(authUser.id, {
        companyName: formData.companyName.trim(),
        industry: formData.industry,
        city: formData.city.trim(),
        state: formData.state.trim(),
        contactName: formData.fullName.trim(),
        contactEmail: formData.email.trim().toLowerCase(),
        contactPhone: formData.phone,
      });
      haptic('success');
      navigate('/dashboard/employer', { replace: true });
    } catch (err) {
      haptic('error');
      setError(friendlyAuthError(err, t('auth.signupFailed')));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <PageLoader />
    );
  }

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center bg-[var(--bg-warm)] px-4 py-12">
      <div className="w-full max-w-[460px]">
        <div className="auth-card bg-white rounded-2xl shadow-lg p-8">
          <Link to="/" className="auth-back inline-flex items-center text-sm font-semibold text-[var(--charcoal)] hover:text-[var(--navy)] mb-6">
            <ArrowLeft size={16} className="mr-2" />
            Back to home
          </Link>

          <AuthSwitcher active="signup" role="employer" />

          <div className="text-center mb-8">
            <h1 className="auth-title text-3xl font-extrabold text-[var(--navy)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {t('auth.registerEmployer')}
            </h1>
            <p className="text-sm text-[var(--charcoal)]">
              {t('auth.employerSignupSubtitle')}
            </p>
          </div>

          <AuthError message={error} />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p className="auth-step-label">Your details</p>
            <AuthField
              label={t('auth.fullName')}
              icon={<User size={17} />}
              name="fullName"
              autoComplete="name"
              autoCapitalize="words"
              enterKeyHint="next"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Person who will manage hiring"
              error={fieldErrors.fullName}
              maxLength={80}
            />
            <AuthField
              label={t('auth.email')}
              icon={<Mail size={17} />}
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              value={formData.email}
              onChange={handleChange}
              placeholder="company@example.com"
              error={fieldErrors.email}
            />

            <PhoneVerifyBox
              phone={otpPhone}
              onPhoneChange={setOtpPhone}
              otp={otp}
              onOtpChange={setOtp}
              otpSent={otpSent}
              verified={otpVerified}
              countdown={countdown}
              loading={loading}
              onSend={handleSendOtp}
              onVerify={handleVerifyOtp}
              onEditNumber={() => { setOtpSent(false); setOtp(''); setCountdown(0); setError(''); }}
              onReset={resetPhone}
            />

            <div className="pt-2">
              <p className="auth-step-label">Company details</p>
              <p className="text-xs text-[var(--charcoal)] -mt-1">So your dashboard is ready to go, no extra setup step.</p>
            </div>

            <AuthField
              label="Company name"
              icon={<Building2 size={17} />}
              name="companyName"
              autoComplete="organization"
              autoCapitalize="words"
              enterKeyHint="next"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Acme Manufacturing Pvt Ltd"
              error={fieldErrors.companyName}
              maxLength={120}
            />

            <div className="auth-field">
              <label htmlFor="emp-industry" className="block text-[13px] font-bold text-[var(--navy)] mb-1.5">Industry / sector</label>
              <div className="relative">
                <select
                  id="emp-industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  aria-invalid={fieldErrors.industry ? true : undefined}
                  className={`auth-input w-full h-[50px] pl-4 pr-10 rounded-xl border bg-white text-[15px] sm:text-sm appearance-none focus:outline-none focus:ring-4 focus:ring-[var(--orange)]/15 focus:border-[var(--orange)] ${
                    fieldErrors.industry ? 'border-red-300' : 'border-slate-200'
                  } ${formData.industry ? 'text-[var(--navy)]' : 'text-slate-400'}`}
                >
                  <option value="">Select industry</option>
                  {getSectorsList().map(sector => <option key={sector} value={sector}>{sector}</option>)}
                </select>
                <ChevronDown size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {fieldErrors.industry && <p className="auth-field__error mt-1.5 text-[12.5px] font-semibold text-red-600">{fieldErrors.industry}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AuthField
                label="City"
                name="city"
                autoComplete="address-level2"
                autoCapitalize="words"
                enterKeyHint="next"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Pune"
                error={fieldErrors.city}
              />
              <AuthField
                label="State"
                name="state"
                autoComplete="address-level1"
                autoCapitalize="words"
                enterKeyHint="next"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Maharashtra"
                error={fieldErrors.state}
              />
            </div>

            <PasswordField
              label={t('auth.password')}
              name="password"
              autoComplete="new-password"
              enterKeyHint="next"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              error={fieldErrors.password}
              showStrength
            />
            <PasswordField
              label={t('auth.confirmPassword')}
              name="confirmPassword"
              autoComplete="new-password"
              enterKeyHint="done"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t('auth.confirmPassword')}
              error={
                fieldErrors.confirmPassword ||
                (formData.confirmPassword && formData.password && !formData.password.startsWith(formData.confirmPassword)
                  ? t('auth.passwordsDoNotMatch')
                  : undefined)
              }
            />

            <AuthSubmit loading={loading && otpVerified} disabled={!otpVerified || loading} loadingText={t('auth.creatingAccount')}>
              {t('auth.createAccount')}
            </AuthSubmit>
            {!otpVerified && (
              <p className="text-center text-[12px] text-slate-500 -mt-1">Verify your phone number above to continue.</p>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--charcoal)]">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login/employer" className="text-[var(--orange)] font-semibold hover:underline">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
