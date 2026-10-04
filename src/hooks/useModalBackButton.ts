import { useEffect, useRef } from 'react';

// Tracked globally, not per hook instance: how many modals are currently open across
// the whole app, whether we've pushed the one extra history entry for them, and which
// modal's close function the back button should call.
//
// One shared entry (instead of one push/pop per modal) matters because closing one
// modal and opening another in the same update — a plan-selection modal handing off to
// its payment modal, for example — must not pop-then-immediately-push: `history.back()`
// only fires its `popstate` event on a later tick, so a `pushState` that happens right
// after it, in the same update, ends up receiving that stale `popstate` and closes the
// modal that was just opened. Deferring the "should we actually pop now" check lets a
// same-tick close-then-open cancel itself out, since by the time the check runs, the
// handed-off-to modal has already put the layer count back above zero.
let openCount = 0;
let historyPushed = false;
let activeCloser: (() => void) | null = null;

function schedulePop() {
  setTimeout(() => {
    if (openCount === 0 && historyPushed) {
      historyPushed = false;
      window.history.back();
    }
  }, 0);
}

function handlePopState() {
  if (!historyPushed) return;
  historyPushed = false;
  openCount = Math.max(0, openCount - 1);
  const close = activeCloser;
  activeCloser = null;
  close?.();
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', handlePopState);
}

/**
 * Makes the phone's (or browser's) back button close an open modal, instead of
 * navigating away from the page underneath it.
 *
 * Without this, a modal is invisible to browser history: pressing back while a
 * multi-step form's payment modal is open, for example, doesn't undo the modal — it
 * undoes the actual last navigation, so the whole page is left and the filled-in form
 * is lost.
 */
export function useModalBackButton(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  // A stable identity for this modal instance's closer, so it can be told apart from
  // (and matched back up with) other modals across renders and across the module-level
  // state above.
  const closeThisRef = useRef(() => onCloseRef.current());

  useEffect(() => {
    if (!isOpen) return;

    openCount += 1;
    activeCloser = closeThisRef.current;
    if (!historyPushed) {
      window.history.pushState({ rhModal: true }, '');
      historyPushed = true;
    }

    return () => {
      openCount = Math.max(0, openCount - 1);
      if (activeCloser === closeThisRef.current) activeCloser = null;
      schedulePop();
    };
  }, [isOpen]);
}
