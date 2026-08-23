import { motion } from 'framer-motion';

export default function PageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-warm)]">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-14 h-14">
          <motion.span
            className="absolute inset-0 rounded-full border-[3px] border-[var(--orange)]/15"
          />
          <motion.span
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[var(--orange)]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-[13px] rounded-full bg-[var(--navy)]"
            animate={{ scale: [1, 0.82, 1] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          />
        </div>
        <motion.p
          className="text-sm font-semibold text-[var(--charcoal)] tracking-wide"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          {label}
        </motion.p>
      </div>
    </div>
  );
}
