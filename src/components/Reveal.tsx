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
  const mobileY = 10;
  const effectiveDelay = isMobile ? 0 : delay;
  const effectiveY = reduceMotion ? 0 : isMobile ? mobileY : y ?? 16;
  const transition = isMobile
    ? { duration: 0.38, delay: effectiveDelay, ease: [0.22, 1, 0.36, 1] as const }
    : { duration: 0.6, delay: effectiveDelay, ease: [0.16, 1, 0.3, 1] as const };

  const dynamicVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: effectiveY, 
      scale: 0.98,
      filter: 'blur(4px)',
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: 'blur(0px)',
      transition,
    },
  };

  return (
    <motion.div
      className={className}
      style={{ willChange: 'transform, opacity, filter' }}
      variants={dynamicVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: isMobile ? 0.15 : 0.25 }}
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({ children, className, gap = 0.1 }: { children: ReactNode; className?: string; gap?: number }) {
  const { isMobile } = useMobileReveal();
  const effectiveGap = isMobile ? 0.05 : gap;
  return (
    <motion.div
      className={className}
      style={{ willChange: 'transform, opacity' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: isMobile ? 0.1 : 0.2 }}
      variants={{ 
        visible: { 
          transition: { 
            staggerChildren: effectiveGap,
            delayChildren: 0.1,
          } 
        } 
      }}
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
        hidden: { 
          opacity: 0, 
          y: isMobile ? 8 : 24, 
          scale: 0.97,
          filter: 'blur(3px)',
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: isMobile
            ? { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
