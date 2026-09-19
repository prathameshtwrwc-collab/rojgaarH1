import { useState, useEffect } from 'react';
import PageLoader from '../../components/PageLoader';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { signUp, sendOtp, verifyOtp } from '../../lib/supabase/auth';
import { createCandidate, getEmployerByReferralCode, getRecruiterByReferralCode } from '../../lib/supabase/data';
import { useAuth } from '../../context/AuthContext';
import AuthSwitcher from '../../components/AuthSwitcher';
import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function CandidateSignup() {
  const { t } = useAppTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [otpPhone, setOtpPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  const recruiterCode = searchParams.get('recruiter');

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'employer') {
        navigate('/dashboard/employer', { replace: true });
      } else if (user.role === 'recruiter') {
        navigate('/dashboard/recruiter', { replace: true });
      } else {
        navigate('/dashboard/candidate', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!otpPhone || otpPhone.length < 10) {
      setError(t('auth.enterValidPhone'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await sendOtp(otpPhone);
      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setCountdown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.sendOtpError'));
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
      setFormData({ ...formData, phone: otpPhone });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.verifyOtpError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpVerified) {
      setError(t('auth.verifyPhoneFirst'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }

    setLoading(true);

    try {
      const authUser = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: 'candidate',
      });
      let referredBy: string | null = null;
      let referredByRecruiter: string | null = null;
      if (recruiterCode) {
        const referringRecruiter = await getRecruiterByReferralCode(recruiterCode);
        if (referringRecruiter) referredByRecruiter = referringRecruiter.id;
      } else if (refCode) {
        const referringEmployer = await getEmployerByReferralCode(refCode);
        if (referringEmployer) referredBy = referringEmployer.id;
      }
      await createCandidate(authUser.id, referredBy, recruiterCode || refCode || null, referredByRecruiter);
      navigate('/dashboard/candidate', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.signupFailed'));
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-warm)] px-4 py-12">
      <div className="w-full max-w-[460px]">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Link to="/" className="inline-flex items-center text-sm text-[var(--charcoal)] hover:text-[var(--navy)] mb-6">
            <ArrowLeft size={16} className="mr-2" />
            Back to home
          </Link>

          <AuthSwitcher active="signup" role="candidate" />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[var(--navy)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {t('auth.createCandidateAccount')}
            </h1>
            <p className="text-sm text-[var(--charcoal)]">
              {t('landing.heroSubtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Phone Verification */}
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="text-sm font-bold text-[var(--navy)] mb-3">{t('auth.verifyPhone')}</h3>
            {!otpVerified ? (
              <>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <input
                    type="tel"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                    placeholder="9876543210"
                  />
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap px-5 py-2.5 bg-[var(--orange)] text-white text-sm font-bold rounded-full hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? t('auth.sendingOtp') : t('auth.sendOtp')}
                    </button>
                  ) : (
                    <span className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap px-5 py-2.5 bg-green-100 text-green-700 text-sm font-bold rounded-full text-center">
                      {t('auth.otpSent')}
                    </span>
                  )}
                </div>
                {otpSent && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                      placeholder="••••••"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length !== 6}
                      className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap px-5 py-2.5 bg-[var(--navy)] text-white text-sm font-bold rounded-full hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? t('auth.verifying') : t('auth.verifyOtp')}
                    </button>
                  </div>
                )}
                {countdown > 0 && (
                  <p className="text-xs text-slate-500 mt-2">{t('auth.resendCode', { count: countdown })}</p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-sm font-semibold">{t('auth.phoneVerified')}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                {t('auth.fullName')}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                placeholder={t('auth.fullName')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                {t('auth.phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                  placeholder={t('auth.password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--charcoal)] hover:text-[var(--navy)]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                placeholder={t('auth.confirmPassword')}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !otpVerified}
              className="w-full h-[50px] bg-[var(--orange)] text-white font-bold rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--charcoal)]">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login/candidate" className="text-[var(--orange)] font-semibold hover:underline">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
