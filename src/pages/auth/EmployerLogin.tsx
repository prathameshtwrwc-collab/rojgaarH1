import { useEffect } from 'react';
import PageLoader from '../../components/PageLoader';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthSwitcher from '../../components/AuthSwitcher';
import EmailLoginForm from '../../components/EmailLoginForm';
import { postLoginPath } from '../../lib/authHelpers';

export default function EmployerLogin() {
  const { user, loading: authLoading, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  useEffect(() => {
    if (!authLoading && user) navigate(postLoginPath(user.role, from || '/dashboard/employer'), { replace: true });
  }, [user, authLoading, navigate, from]);

  if (authLoading) return <PageLoader />;

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center bg-[var(--bg-warm)] px-4 py-8">
      <div className="w-full max-w-[460px]">
        <div className="auth-card bg-white rounded-2xl shadow-lg p-8">
          <AuthSwitcher active="login" role="employer" />
          <div className="text-center mb-7">
            <h1 className="auth-title text-3xl font-extrabold text-[var(--navy)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Employer Login
            </h1>
            <p className="text-sm text-[var(--charcoal)]">Welcome back. Sign in to manage your jobs and applicants.</p>
          </div>

          <EmailLoginForm onSignedIn={() => refresh()} placeholder="company@example.com" />

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--charcoal)]">
              Don't have an account?{' '}
              <Link to="/register/employer" className="text-[var(--orange)] font-bold hover:underline">
                Register company
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
