import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthSwitcherProps {
  active: 'login' | 'signup';
  role: 'candidate' | 'employer';
}

const routes = {
  candidate: { login: '/login/candidate', signup: '/register/job-seeker' },
  employer: { login: '/login/employer', signup: '/register/employer' },
};

export default function AuthSwitcher({ active, role }: AuthSwitcherProps) {
  const navigate = useNavigate();
  const target = routes[role];

  return (
    <motion.div
      className="relative flex bg-slate-100 rounded-full p-1 mb-7"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-out"
        style={{ transform: active === 'signup' ? 'translateX(calc(100% + 8px))' : 'translateX(0)' }}
      />
      {(['login', 'signup'] as const).map(tab => (
        <button
          key={tab}
          type="button"
          onClick={() => tab !== active && navigate(target[tab])}
          className="relative flex-1 h-10 text-sm font-bold rounded-full z-10 transition-colors duration-200"
          style={{ color: active === tab ? 'var(--navy)' : 'var(--charcoal)' }}
        >
          {tab === 'login' ? 'Sign In' : 'Sign Up'}
        </button>
      ))}
    </motion.div>
  );
}
