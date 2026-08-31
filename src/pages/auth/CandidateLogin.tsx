import { useState, useEffect } from 'react';
import PageLoader from '../../components/PageLoader';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { signIn, checkPhoneExists, sendOtp, verifyOtp, signInWithPhone } from '../../lib/supabase/auth';
import { useAuth } from '../../context/AuthContext';
import AuthSwitcher from '../../components/AuthSwitcher';

type LoginMethod = 'phone' | 'email';
type PhoneStep = 'phone' | 'otp' | 'password';

export default function CandidateLogin() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('phone');

  // Phone state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  // Email state
  const [email, setEmail] = useState('');

  // Common state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { user, loading: authLoading, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard/candidate';

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'employer') {
        navigate('/dashboard/employer', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, authLoading, navigate, from]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Check if phone exists
      const { exists } = await checkPhoneExists(phone);
      if (!exists) {
        setError('No candidate account found with this phone number');
        setLoading(false);
        return;
      }

      // Send OTP
      const result = await sendOtp(phone);
      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setPhoneStep('otp');
      setCountdown(30); // 30 second cooldown before resend
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await verifyOtp(phone, otp);
      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setOtpVerified(true);
      setPhoneStep('password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signInWithPhone(phone, password);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn({ email, password });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const resetPhoneFlow = () => {
    setPhoneStep('phone');
    setPhone('');
    setOtp('');
    setPassword('');
    setOtpSent(false);
    setOtpVerified(false);
    setError('');
  };

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-warm)] px-4 py-8">
      <div className="w-full max-w-[460px]">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <AuthSwitcher active="login" role="candidate" />
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-[var(--navy)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Candidate Login
            </h1>
            <p className="text-sm text-[var(--charcoal)]">
              Welcome back! Please sign in to your account.
            </p>
          </div>

          {/* Login Method Switcher */}
          <div className="flex bg-slate-100 rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all ${
                loginMethod === 'phone'
                  ? 'bg-white text-[var(--navy)] shadow-sm'
                  : 'text-[var(--charcoal)] hover:text-[var(--navy)]'
              }`}
            >
              <Phone size={16} />
              Phone
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all ${
                loginMethod === 'email'
                  ? 'bg-white text-[var(--navy)] shadow-sm'
                  : 'text-[var(--charcoal)] hover:text-[var(--navy)]'
              }`}
            >
              <Mail size={16} />
              Email
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Phone Login Flow */}
          {loginMethod === 'phone' && (
            <>
              {phoneStep === 'phone' && (
                <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                        placeholder="9876543210"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">
                      We&apos;ll send you a verification code
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[50px] bg-[var(--orange)] text-white font-bold rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending OTP...' : 'Send Verification Code'}
                  </button>
                </form>
              )}

              {phoneStep === 'otp' && (
                <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                      Enter Verification Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                      placeholder="••••••"
                    />
                    <p className="text-xs text-slate-500 mt-1.5 text-center">
                      Enter the 6-digit code sent to {phone}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full h-[50px] bg-[var(--orange)] text-white font-bold rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <span className="text-xs text-slate-500">
                        Resend code in {countdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-xs text-[var(--orange)] font-semibold hover:underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={resetPhoneFlow}
                    className="w-full text-xs text-slate-500 hover:text-[var(--navy)]"
                  >
                    ← Change phone number
                  </button>
                </form>
              )}

              {phoneStep === 'password' && (
                <form onSubmit={handlePhoneLogin} className="space-y-5">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-700">Phone verified successfully</span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                        placeholder="••••••••"
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[50px] bg-[var(--orange)] text-white font-bold rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={resetPhoneFlow}
                    className="w-full text-xs text-slate-500 hover:text-[var(--navy)]"
                  >
                    ← Start over
                  </button>
                </form>
              )}
            </>
          )}

          {/* Email Login Flow */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] bg-[var(--orange)] text-white font-bold rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--charcoal)]">
              Don&apos;t have an account?{' '}
              <Link to="/register/job-seeker" className="text-[var(--orange)] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
