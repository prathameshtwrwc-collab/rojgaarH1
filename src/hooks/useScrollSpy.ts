import { useEffect, useState } from 'react';

/**
 * Tells which on-page section is currently being read, for highlighting the matching tab
 * in the bottom navigation. Returns `home` while the page is near the top (or before any
 * listed section has reached the upper part of the screen).
 */
export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState('home');
  const key = ids.join('|');

  useEffect(() => {
    let frame = 0;
    const compute = () => {
      frame = 0;
      const line = window.innerHeight * 0.38;
      let current = 'home';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(prev => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
    // `key` is the stable identity of the id list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
