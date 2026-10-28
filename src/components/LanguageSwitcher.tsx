import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { haptic } from '../lib/haptics';

// Each language shown in its own script, with a letter badge instead of a country flag
const languages = [
  { code: 'en', name: 'English', badge: 'A' },
  { code: 'hi', name: 'हिन्दी', badge: 'अ' },
  { code: 'mr', name: 'मराठी', badge: 'म' },
];

export default function LanguageSwitcher() {
  const { i18n } = useAppTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const changeLanguage = (code: string) => {
    haptic('select');
    i18n.changeLanguage(code);
    setOpen(false);
  };

  const currentLang = languages.find(l => i18n.language.startsWith(l.code)) || languages[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${currentLang.name}`}
        className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition text-sm font-semibold text-[var(--navy)]"
      >
        <Globe size={15} />
        <span lang={currentLang.code}>{currentLang.name}</span>
        <ChevronDown size={13} className={`hidden sm:block opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="listbox" aria-label="Choose language" className="ecm-pop absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-[0_18px_40px_-16px_rgba(16,26,54,0.32)] border border-slate-200 p-1.5 z-50">
          {languages.map(lang => {
            const active = i18n.language.startsWith(lang.code);
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={active}
                lang={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full text-left px-2.5 h-11 rounded-xl text-sm flex items-center gap-2.5 transition-colors ${
                  active ? 'bg-[var(--orange)]/[0.07] text-[var(--orange)] font-bold' : 'text-[var(--navy)] font-medium hover:bg-slate-50'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-extrabold flex-shrink-0 ${active ? 'bg-[var(--orange)] text-white' : 'bg-slate-100 text-[var(--navy)]'}`}>
                  {lang.badge}
                </span>
                <span className="flex-1">{lang.name}</span>
                {active && <Check size={15} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
