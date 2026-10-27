let locks = 0;
let saved = '';

/**
 * Stops the page behind a modal from scrolling. Counted, so overlapping or nested modals can
 * never leave the page stuck unscrollable (each one restoring a stale "hidden" would).
 * Returns the release function.
 */
export function lockBodyScroll() {
  if (locks === 0) {
    saved = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  locks += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) document.body.style.overflow = saved === 'hidden' ? '' : saved;
  };
}
