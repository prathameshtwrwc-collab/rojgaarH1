import { useEffect } from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import './../i18n';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useAppTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng') || localStorage.getItem('language') || 'en';
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return <>{children}</>;
}
