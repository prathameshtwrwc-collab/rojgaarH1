import { useEffect, useState } from 'react';

/**
 * Keeps something mounted for a moment after `isOpen` turns false, so an exit
 * animation can play before it disappears. Returns `state` for a data-state attribute
 * that CSS keyframes key off ("open" plays the enter animation, "closed" the exit one).
 */
export function useMountTransition(isOpen: boolean, exitMs = 240) {
  const [lingering, setLingering] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setLingering(true);
      return;
    }
    // People who ask for reduced motion get no exit animation, so don't wait for one.
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const id = window.setTimeout(() => setLingering(false), reduced ? 0 : exitMs);
    return () => window.clearTimeout(id);
  }, [isOpen, exitMs]);

  return { mounted: isOpen || lingering, state: (isOpen ? 'open' : 'closed') as 'open' | 'closed' };
}
