import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { haptic } from '../lib/haptics';

interface AuthSwitcherProps {
  active: 'login' | 'signup';
  role: 'candidate' | 'employer' | 'recruiter';
}

const routes = {
  candidate: { login: '/login/candidate', signup: '/register/job-seeker' },
  employer: { login: '/login/employer', signup: '/register/employer' },
  recruiter: { login: '/login/recruiter', signup: '/register/recruiter' },
};

export default function AuthSwitcher({ active, role }: AuthSwitcherProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const target = routes[role];

  // Keep ?ref= / ?recruiter= codes and the "come back to this job" state when switching tabs
  const go = (tab: 'login' | 'signup') => {
    if (tab === active) return;
    haptic('select');
    navigate({ pathname: target[tab], search: location.search }, { state: location.state, replace: true });
  };

  return (
    <motion.div
      role="tablist"
      aria-label="Sign in or create an account"
      className="relative grid grid-cols-2 bg-slate-100 rounded-full p-1 mb-7"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: active === 'signup' ? 'translateX(100%)' : 'translateX(0)' }}
      />
      {(['login', 'signup'] as const).map(tab => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          onClick={() => go(tab)}
          className="relative h-10 text-sm font-bold rounded-full z-10 transition-colors duration-200"
          style={{ color: active === tab ? 'var(--navy)' : 'var(--charcoal)' }}
        >
          {tab === 'login' ? 'Sign In' : 'Sign Up'}
        </button>
      ))}
    </motion.div>
  );
}
