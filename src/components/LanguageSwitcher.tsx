import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
];

export default function LanguageSwitcher() {
  const { i18n } = useAppTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  const currentLang = languages.find(l => i18n.language.startsWith(l.code)) || languages[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-[var(--navy)]"
      >
        <Globe size={16} />
        <span>{currentLang.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl flex items-center gap-2 ${
                i18n.language.startsWith(lang.code) ? 'text-[var(--orange)] font-semibold' : 'text-[var(--charcoal)]'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
