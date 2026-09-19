import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './../i18n';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  return <>{children}</>;
}
