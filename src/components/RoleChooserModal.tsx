import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Building2, ArrowRight, UserSearch } from 'lucide-react';

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

export default function RoleChooserModal({ isOpen, onClose, mode }: RoleChooserModalProps) {
  const navigate = useNavigate();

  const go = (role: 'candidate' | 'employer' | 'recruiter') => {
    onClose();
    navigate(paths[role][mode]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-[var(--navy)]/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-[var(--navy)] hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-extrabold text-[var(--navy)] text-center" style={{ fontFamily: 'var(--font-display)' }}>
              How would you like to join?
            </h2>
            <p className="text-sm text-[var(--charcoal)] text-center mt-1.5 mb-7">
              Tell us who you are, and we'll take you to the right place.
            </p>

            <div className="grid gap-4">
              <motion.button
                onClick={() => go('candidate')}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 hover:border-[var(--orange)] hover:bg-orange-50/40 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--orange)]/10 text-[var(--orange)] flex items-center justify-center flex-shrink-0">
                  <Users size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--navy)]">I'm a Job Seeker</p>
                  <p className="text-xs text-[var(--charcoal)]">Find verified jobs and get placed fast</p>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-[var(--orange)] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.button>

              <motion.button
                onClick={() => go('employer')}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 hover:border-[var(--green)] hover:bg-emerald-50/40 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--green)]/10 text-[var(--green)] flex items-center justify-center flex-shrink-0">
                  <Building2 size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--navy)]">I'm an Employer</p>
                  <p className="text-xs text-[var(--charcoal)]">Post jobs and hire pre-screened talent</p>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-[var(--green)] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.button>

              <motion.button
                onClick={() => go('recruiter')}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 hover:border-[#7655D9] hover:bg-purple-50/40 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-[#7655D9]/10 text-[#7655D9] flex items-center justify-center flex-shrink-0">
                  <UserSearch size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--navy)]">I'm a Recruiter</p>
                  <p className="text-xs text-[var(--charcoal)]">Refer candidates and grow your network</p>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-[#7655D9] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
