import { useTranslation } from 'react-i18next';

export function useAppTranslation() {
  const { t } = useTranslation();
  return { t };
}
