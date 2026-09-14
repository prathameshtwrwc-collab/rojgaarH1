import { useState, useEffect } from 'react';
import PageLoader from '../../components/PageLoader';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { signUp, sendOtp, verifyOtp } from '../../lib/supabase/auth';
import { createRecruiter } from '../../lib/supabase/data';
import { useAuth } from '../../context/AuthContext';
import AuthSwitcher from '../../components/AuthSwitcher';

export default function RecruiterSignup() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
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
      if (user.role === 'superadmin') navigate('/admin', { replace: true });
      else if (user.role === 'employer') navigate('/dashboard/employer', { replace: true });
      else if (user.role === 'candidate') navigate('/dashboard/candidate', { replace: true });
      else navigate('/dashboard/recruiter', { replace: true });
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
      setError('Please enter a valid phone number');
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
      const result = await verifyOtp(otpPhone, otp);
      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setOtpVerified(true);
      setFormData({ ...formData, phone: otpPhone });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpVerified) {
      setError('Please verify your phone number first');
      return;
    }

    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const authUser = await signUp({
        email: formData.email, password: formData.password,
        fullName: formData.fullName, phone: formData.phone, role: 'recruiter',
      });
      await createRecruiter(authUser.id, { fullName: formData.fullName, phone: formData.phone });
      navigate('/dashboard/recruiter', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <PageLoader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-warm)] px-4 py-12">
      <div className="w-full max-w-[460px]">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Link to="/" className="inline-flex items-center text-sm text-[var(--charcoal)] hover:text-[var(--navy)] mb-6">
            <ArrowLeft size={16} className="mr-2" /> Back to home
          </Link>

          <AuthSwitcher active="signup" role="recruiter" />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[var(--navy)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Join as a Recruiter
            </h1>
            <p className="text-sm text-[var(--charcoal)]">
              Refer candidates and earn — your account needs a quick approval from our team before it goes live.
            </p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          {/* Phone Verification */}
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="text-sm font-bold text-[var(--navy)] mb-3">Verify Phone Number</h3>
            {!otpVerified ? (
              <>
                <div className="flex gap-2 mb-3">
                  <input
                    type="tel"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                    placeholder="9876543210"
                  />
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="flex-shrink-0 whitespace-nowrap px-5 py-2.5 bg-[var(--orange)] text-white text-sm font-bold rounded-full hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                  ) : (
                    <span className="flex-shrink-0 whitespace-nowrap px-5 py-2.5 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                      Sent
                    </span>
                  )}
                </div>
                {otpSent && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                      placeholder="••••••"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length !== 6}
                      className="flex-shrink-0 whitespace-nowrap px-5 py-2.5 bg-[var(--navy)] text-white text-sm font-bold rounded-full hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                )}
                {countdown > 0 && (
                  <p className="text-xs text-slate-500 mt-2">Resend code in {countdown}s</p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-sm font-semibold">Phone verified successfully</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent" placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent" placeholder="Re-enter your password" />
            </div>
            <button type="submit" disabled={loading || !otpVerified}
              className="w-full h-[50px] bg-[var(--orange)] text-white font-bold rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating account...' : 'Create Recruiter Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--charcoal)]">
              Already have an account?{' '}
              <Link to="/login/recruiter" className="text-[var(--orange)] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
