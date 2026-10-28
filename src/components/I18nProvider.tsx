import { useEffect } from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import './../i18n';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useAppTranslation();

  useEffect(() => {
    let saved = 'en';
    try {
      saved = localStorage.getItem('i18nextLng') || localStorage.getItem('language') || 'en';
    } catch { /* storage blocked */ }
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  }, [i18n]);

  // Tell the browser which language the page is in, so screen readers pronounce
  // Hindi and Marathi correctly and phones don't offer to "translate from English"
  useEffect(() => {
    const apply = (lng: string) => {
      document.documentElement.lang = (lng || 'en').split('-')[0];
    };
    apply(i18n.language);
    i18n.on('languageChanged', apply);
    return () => { i18n.off('languageChanged', apply); };
  }, [i18n]);

  return <>{children}</>;
}
