import { useState, useEffect } from 'react';
import PageLoader from '../../components/PageLoader';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

  const [otpPhone, setOtpPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'candidate') {
        navigate('/dashboard/candidate', { replace: true });
      } else {
        navigate('/dashboard/employer', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Changing the number means verifying the new one from the start
  const resetPhone = () => {
    setOtpVerified(false);
    setOtpSent(false);
    setOtp('');
    setFormData(prev => ({ ...prev, phone: '' }));
  };

  const handleSendOtp = async () => {
    if (!otpPhone || otpPhone.length < 10) {
      setError(t('auth.enterValidPhone'));
      return;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter your email address first.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const [phoneTaken, emailTaken] = await Promise.all([
        phoneExists(otpPhone),
        emailExists(formData.email),
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

    if (!formData.companyName.trim() || !formData.industry || !formData.city.trim() || !formData.state.trim()) {
      setError('Please fill in your company details.');
      return;
    }

    setLoading(true);

    try {
      const authUser = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: 'employer',
      });
      await createEmployer(authUser.id, {
        companyName: formData.companyName.trim(),
        industry: formData.industry,
        city: formData.city.trim(),
        state: formData.state.trim(),
        contactName: formData.fullName,
        contactEmail: formData.email,
        contactPhone: formData.phone,
      });
      navigate('/dashboard/employer', { replace: true });
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

          <AuthSwitcher active="signup" role="employer" />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[var(--navy)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {t('auth.registerEmployer')}
            </h1>
            <p className="text-sm text-[var(--charcoal)]">
              {t('auth.employerSignupSubtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-5 mb-6">
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
          </div>

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
                    disabled={otpSent}
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
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
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtp(''); setCountdown(0); setError(''); }}
                      className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap px-5 py-2.5 bg-white border border-slate-300 text-[var(--navy)] text-sm font-bold rounded-full hover:bg-slate-50 transition-all"
                    >
                      Change Number
                    </button>
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
                {otpSent && (
                  <div className="mt-2">
                    {countdown > 0 ? (
                      <p className="text-xs text-slate-500">{t('auth.resendCode', { count: countdown })}</p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="text-xs font-bold text-[var(--orange)] hover:underline disabled:opacity-50"
                      >
                        {loading ? t('auth.sendingOtp') : 'Resend OTP'}
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-sm font-semibold">{t('auth.phoneVerified')} · {otpPhone}</span>
                <button type="button" onClick={resetPhone} className="ml-auto text-xs font-bold text-[var(--navy)] underline underline-offset-2">Change</button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="pt-1">
              <h3 className="text-sm font-bold text-[var(--navy)] mb-1">Company Details</h3>
              <p className="text-xs text-[var(--charcoal)] mb-3">So your dashboard is ready to go, no extra setup step.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                placeholder="e.g. Acme Manufacturing Pvt Ltd"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">Industry / Sector</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent bg-white"
              >
                <option value="">Select industry</option>
                {getSectorsList().map(sector => <option key={sector} value={sector}>{sector}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[var(--navy)] mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                  placeholder="e.g. Pune"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--navy)] mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                  placeholder="e.g. Maharashtra"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                placeholder={t('auth.password')}
              />
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
