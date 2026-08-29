import { ReactNode, useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'section';
}

function useMobileReveal() {
  const [state, setState] = useState({ isMobile: false, reduceMotion: false });

  useEffect(() => {
    const mobileMq = window.matchMedia('(max-width: 767px)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setState({ isMobile: mobileMq.matches, reduceMotion: motionMq.matches });
    update();
    mobileMq.addEventListener('change', update);
    motionMq.addEventListener('change', update);
    return () => {
      mobileMq.removeEventListener('change', update);
      motionMq.removeEventListener('change', update);
    };
  }, []);

  return state;
}

export default function Reveal({ children, className, delay = 0, y }: RevealProps) {
  const { isMobile, reduceMotion } = useMobileReveal();
  const mobileY = 6;
  const effectiveDelay = isMobile ? 0 : delay;
  const effectiveY = reduceMotion ? 0 : isMobile ? mobileY : y ?? 14;
  const transition = isMobile
    ? { duration: 0.32, delay: effectiveDelay, ease: [0.22, 1, 0.36, 1] as const }
    : { duration: 0.4, delay: effectiveDelay, ease: 'easeOut' as const };

  const dynamicVariants: Variants = {
    hidden: { opacity: 0, y: effectiveY },
    visible: { opacity: 1, y: 0, transition },
  };

  return (
    <motion.div
      className={className}
      style={{ willChange: 'transform, opacity' }}
      variants={dynamicVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: isMobile ? 0.1 : 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({ children, className, gap = 0.08 }: { children: ReactNode; className?: string; gap?: number }) {
  const { isMobile } = useMobileReveal();
  const effectiveGap = isMobile ? 0 : gap;
  return (
    <motion.div
      className={className}
      style={{ willChange: 'transform, opacity' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: isMobile ? 0.1 : 0.2 }}
      variants={{ visible: { transition: { staggerChildren: effectiveGap } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const { isMobile } = useMobileReveal();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: isMobile ? 6 : 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: isMobile
            ? { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
