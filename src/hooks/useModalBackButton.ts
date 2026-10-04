import { useEffect, useRef } from 'react';

/**
 * Makes the phone's (or browser's) back button close an open modal, instead of
 * navigating away from the page underneath it.
 *
 * Without this, a modal is invisible to browser history: pressing back while a
 * multi-step form's payment modal is open, for example, doesn't undo the modal — it
 * undoes the actual last navigation, so the whole page is left and the filled-in form
 * is lost.
 *
 * How it works: opening the modal pushes one extra history entry. Pressing back pops
 * just that entry (a `popstate` event), which this hook catches to close the modal —
 * the browser never reaches the entry for the page before it. Closing the modal any
 * other way (a Cancel button, tapping the overlay, a successful submit) consumes that
 * same pushed entry with `history.back()`, so the next real back-press still goes
 * where it should, instead of landing on a leftover empty entry.
 */
export function useModalBackButton(isOpen: boolean, onClose: () => void) {
  const pushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ rhModal: true }, '');
    pushedRef.current = true;

    const handlePopState = () => {
      pushedRef.current = false;
      onCloseRef.current();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (pushedRef.current) {
        pushedRef.current = false;
        window.history.back();
      }
    };
  }, [isOpen]);
}
