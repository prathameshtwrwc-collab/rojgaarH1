import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { scrollToY } from '../hooks/useSmoothScroll';

const positions = new Map<string, number>();

export default function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevKey = useRef(location.key);

  // Continuously track scroll position for the current entry.
  useEffect(() => {
    const key = location.key;
    const onScroll = () => positions.set(key, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.key]);

  // On navigation: restore on back/forward, jump to top on a fresh navigation.
  useEffect(() => {
    if (prevKey.current === location.key) return;
    prevKey.current = location.key;

    if (navigationType === 'POP' && positions.has(location.key)) {
      scrollToY(positions.get(location.key)!);
    } else {
      scrollToY(0);
    }
  }, [location.key, navigationType]);

  return null;
}
