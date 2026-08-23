import { useState, useEffect } from 'react';
import PageLoader from '../../components/PageLoader';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from '../../lib/supabase/auth';
import { useAuth } from '../../context/AuthContext';
import AuthSwitcher from '../../components/AuthSwitcher';

export default function RecruiterLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, loading: authLoading, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard/recruiter';

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'superadmin') navigate('/admin', { replace: true });
      else if (user.role === 'employer') navigate('/dashboard/employer', { replace: true });
      else if (user.role === 'candidate') navigate('/dashboard/candidate', { replace: true });
      else navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
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

  if (authLoading) return <PageLoader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-warm)] px-4">
      <div className="w-full max-w-[460px]">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <AuthSwitcher active="login" role="recruiter" />
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[var(--navy)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Recruiter Login
            </h1>
            <p className="text-sm text-[var(--charcoal)]">Welcome back! Please sign in to your recruiter account.</p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--navy)] mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--charcoal)] hover:text-[var(--navy)]">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-[50px] bg-[var(--orange)] text-white font-bold rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--charcoal)]">
              Don't have an account?{' '}
              <Link to="/register/recruiter" className="text-[var(--orange)] font-semibold hover:underline">Join as a Recruiter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
