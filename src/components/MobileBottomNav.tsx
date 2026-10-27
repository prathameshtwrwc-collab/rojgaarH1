import { ReactNode, useEffect } from 'react';
import { haptic } from '../lib/haptics';

export interface BottomNavItem {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  /** Small count bubble on the icon (e.g. saved jobs, unread notifications). */
  badge?: number;
  /** The main call to action: drawn as a raised round button and never shown as "current". */
  accent?: boolean;
}

/**
 * Phone-only tab bar for the dashboards. Hidden from tablet width up (see mobile-app.css).
 * The active tab gets a pill that slides between slots, and the whole bar tucks away while
 * the on-screen keyboard is open so it never covers what is being typed.
 */
export function MobileBottomNav({ items, activeKey }: { items: BottomNavItem[]; activeKey: string | null }) {
  const activeIndex = items.findIndex(i => i.key === activeKey && !i.accent);

  useEffect(() => {
    const isTextField = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      el.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]):not([type=file]), textarea, select, [contenteditable="true"]');
    const onFocusIn = (e: FocusEvent) => {
      if (isTextField(e.target)) document.documentElement.classList.add('kb-open');
    };
    const onFocusOut = () => {
      window.setTimeout(() => {
        if (!isTextField(document.activeElement)) document.documentElement.classList.remove('kb-open');
      }, 80);
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.documentElement.classList.remove('kb-open');
    };
  }, []);

  return (
    <nav className="m-nav" aria-label="Main navigation">
      <div className="m-nav__inner" style={{ ['--n' as string]: items.length }}>
        {activeIndex >= 0 && (
          <span className="m-nav__pill" style={{ transform: `translateX(${activeIndex * 100}%)` }} aria-hidden="true" />
        )}
        {items.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={item.key}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              className={`m-nav__item${isActive ? ' is-active' : ''}${item.accent ? ' is-accent' : ''}`}
              onClick={() => {
                haptic('select');
                item.onSelect();
              }}
            >
              <span className="m-nav__icon">
                {item.icon}
                {item.badge ? <span className="m-nav__badge">{item.badge > 9 ? '9+' : item.badge}</span> : null}
              </span>
              <span className="m-nav__label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
