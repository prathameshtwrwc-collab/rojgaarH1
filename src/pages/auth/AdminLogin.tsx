import { useEffect, useState } from 'react';
import PageLoader from '../../components/PageLoader';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EmailLoginForm from '../../components/EmailLoginForm';
import { postLoginPath } from '../../lib/authHelpers';

export default function AdminLogin() {
  const [roleError, setRoleError] = useState('');
  const { user, loading: authLoading, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'superadmin') {
        navigate(postLoginPath('superadmin', from || '/admin'), { replace: true });
      } else {
        setRoleError(`This account is signed in as "${user.role}", not superadmin. Its Supabase profiles.role needs to be set to "superadmin".`);
      }
    }
  }, [user, authLoading, navigate, from]);

  if (authLoading) return <PageLoader />;

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center bg-[var(--bg-warm)] px-4 py-8">
      <div className="w-full max-w-[460px]">
        <div className="auth-card bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-7">
            <span className="inline-flex w-12 h-12 rounded-2xl bg-[var(--navy)] text-white items-center justify-center mb-4 shadow-[0_10px_24px_-12px_rgba(16,26,54,0.7)]">
              <ShieldCheck size={22} />
            </span>
            <h1 className="auth-title text-3xl font-extrabold text-[var(--navy)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Admin Login
            </h1>
            <p className="text-sm text-[var(--charcoal)]">Restricted access. Super admin only.</p>
          </div>

          <EmailLoginForm
            onSignedIn={() => { setRoleError(''); return refresh(); }}
            placeholder="admin@rojgaarhai.com"
            submitLabel="Sign In as Admin"
            tone="navy"
            externalError={roleError}
            showForgot={false}
          />
        </div>
      </div>
    </div>
  );
}
