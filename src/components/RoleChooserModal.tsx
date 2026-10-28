import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Building2, ArrowRight, UserSearch } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import { haptic } from '../lib/haptics';
import { lockBodyScroll } from '../lib/scrollLock';

interface RoleChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signup' | 'login';
}

const paths = {
  candidate: { signup: '/register/job-seeker', login: '/login/candidate' },
  employer: { signup: '/register/employer', login: '/login/employer' },
  recruiter: { signup: '/register/recruiter', login: '/login/recruiter' },
};

const roles = [
  {
    key: 'candidate' as const,
    icon: Users,
    tint: 'var(--orange)',
    hover: 'hover:border-[var(--orange)] hover:bg-orange-50/40',
    title: { signup: "I'm a Job Seeker", login: 'Job Seeker' },
    body: { signup: 'Find verified jobs and get placed fast', login: 'Sign in with your phone number or email' },
  },
  {
    key: 'employer' as const,
    icon: Building2,
    tint: 'var(--green)',
    hover: 'hover:border-[var(--green)] hover:bg-emerald-50/40',
    title: { signup: "I'm an Employer", login: 'Employer' },
    body: { signup: 'Post jobs and hire pre-screened talent', login: 'Manage your jobs and applicants' },
  },
  {
    key: 'recruiter' as const,
    icon: UserSearch,
    tint: '#7655D9',
    hover: 'hover:border-[#7655D9] hover:bg-purple-50/40',
    title: { signup: "I'm a Recruiter", login: 'Recruiter' },
    body: { signup: 'Refer candidates and grow your network', login: 'See your network and referrals' },
  },
];

export default function RoleChooserModal({ isOpen, onClose, mode: initialMode }: RoleChooserModalProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  // The footer link flips between "join" and "sign in" without closing the sheet
  const [mode, setMode] = useState(initialMode);
  useEffect(() => { if (isOpen) setMode(initialMode); }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) return;
    const release = lockBodyScroll();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { release(); window.removeEventListener('keydown', onKey); };
  }, [isOpen, onClose]);

  const go = (role: 'candidate' | 'employer' | 'recruiter') => {
    haptic('select');
    onClose();
    navigate(paths[role][mode]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="ui-modal-overlay fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-[var(--navy)]/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-chooser-title"
            className="ui-modal-panel relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-8"
            initial={isMobile ? { y: '100%' } : { opacity: 0, y: 24, scale: 0.96 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={isMobile ? { type: 'spring', stiffness: 380, damping: 38, mass: 0.9 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {isMobile && <div className="mx-auto -mt-2 mb-4 w-10 h-1.5 rounded-full bg-slate-200" aria-hidden />}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-[var(--navy)] hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <h2 id="role-chooser-title" className="text-2xl font-extrabold text-[var(--navy)] text-center pr-6 pl-6" style={{ fontFamily: 'var(--font-display)' }}>
                  {mode === 'login' ? 'Sign in as' : 'How would you like to join?'}
                </h2>
                <p className="text-sm text-[var(--charcoal)] text-center mt-1.5 mb-6">
                  {mode === 'login' ? 'Pick your account type to continue.' : "Tell us who you are, and we'll take you to the right place."}
                </p>

                <div className="grid gap-3">
                  {roles.map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <motion.button
                        key={r.key}
                        type="button"
                        onClick={() => go(r.key)}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 + i * 0.05, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ ['--tint' as string]: r.tint }}
                        className={`group flex items-center gap-4 p-4 min-h-[76px] rounded-2xl border-2 border-slate-200 transition-colors text-left ${r.hover}`}
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${r.tint} 10%, transparent)`, color: r.tint }}>
                          <Icon size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[var(--navy)]">{r.title[mode]}</p>
                          <p className="text-xs text-[var(--charcoal)]">{r.body[mode]}</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-300 group-hover:text-[var(--tint)] group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <p className="text-center text-sm text-[var(--charcoal)] mt-6">
              {mode === 'login' ? 'New to Rojgaar Hai? ' : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { haptic('select'); setMode(m => (m === 'login' ? 'signup' : 'login')); }}
                className="font-bold text-[var(--orange)] hover:underline"
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
