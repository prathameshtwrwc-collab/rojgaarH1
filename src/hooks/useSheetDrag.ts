import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { haptic } from '../lib/haptics';

/**
 * Swipe-down-to-dismiss for bottom sheets on phones.
 *
 * The finger moves the sheet's *wrapper* (not the panel) so this never fights the panel's CSS
 * enter/exit keyframes. Release past a distance or with enough speed closes the sheet;
 * anything less springs back. Does nothing at tablet/desktop widths, where the same markup
 * is a centred dialog.
 */
export function useSheetDrag(onDismiss: () => void, isOpen: boolean) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const backdropRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startY: 0, dy: 0, startT: 0 });

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (window.innerWidth >= 768 || !wrapRef.current) return;
    // Buttons and fields inside the header keep working normally.
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
    drag.current = { active: true, startY: e.clientY, dy: 0, startT: performance.now() };
    e.currentTarget.setPointerCapture(e.pointerId);
    // Only promoted to its own layer while a finger is on it, so fixed elements inside a resting sheet behave normally.
    wrapRef.current.style.willChange = 'transform';
    wrapRef.current.style.transition = 'none';
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    const wrap = wrapRef.current;
    if (!d.active || !wrap) return;
    d.dy = Math.max(0, e.clientY - d.startY); // sheets only travel downward
    wrap.style.transform = `translateY(${d.dy}px)`;
    if (backdropRef.current) {
      backdropRef.current.style.opacity = String(Math.max(0.15, 1 - d.dy / (wrap.offsetHeight * 0.95)));
    }
  };

  const finish = () => {
    const d = drag.current;
    const wrap = wrapRef.current;
    if (!d.active || !wrap) return;
    d.active = false;
    const velocity = d.dy / Math.max(performance.now() - d.startT, 1); // px per ms
    const dismiss = d.dy > 110 || (velocity > 0.55 && d.dy > 30);

    if (dismiss) {
      haptic('tap');
      wrap.style.transition = 'transform 230ms cubic-bezier(0.4, 0, 1, 1)';
      wrap.style.transform = 'translateY(105%)';
      if (backdropRef.current) {
        // Stops the backdrop's own fade-out keyframes from flashing it back to full opacity.
        backdropRef.current.style.animation = 'none';
        backdropRef.current.style.transition = 'opacity 200ms ease-in';
        backdropRef.current.style.opacity = '0';
      }
      window.setTimeout(onDismiss, 140);
      // Some modals refuse to close while busy (e.g. a payment is submitting). If the parent
      // did not actually close it, bring the sheet back instead of leaving it invisible.
      window.setTimeout(() => {
        const w = wrapRef.current;
        if (!isOpenRef.current || !w) return;
        w.style.transition = 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)';
        w.style.transform = 'translateY(0)';
        if (backdropRef.current) {
          backdropRef.current.style.animation = '';
          backdropRef.current.style.transition = '';
          backdropRef.current.style.opacity = '';
        }
        window.setTimeout(() => {
          if (wrapRef.current) {
            wrapRef.current.style.transition = '';
            wrapRef.current.style.transform = '';
            wrapRef.current.style.willChange = '';
          }
        }, 320);
      }, 520);
    } else {
      wrap.style.transition = 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)';
      wrap.style.transform = 'translateY(0)';
      if (backdropRef.current) backdropRef.current.style.opacity = '';
      window.setTimeout(() => {
        if (wrapRef.current) {
          wrapRef.current.style.transition = '';
          wrapRef.current.style.transform = '';
          wrapRef.current.style.willChange = '';
        }
      }, 320);
    }
  };

  return {
    wrapRef,
    backdropRef,
    handlers: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish },
  };
}
