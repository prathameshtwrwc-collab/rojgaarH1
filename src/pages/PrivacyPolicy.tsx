import { useAppTranslation } from '../hooks/useAppTranslation';

const sectionsKeys = [
  { titleKey: 'privacyPolicy.section1Title', bodyKey: 'privacyPolicy.section1Body' },
  { titleKey: 'privacyPolicy.section2Title', bodyKey: 'privacyPolicy.section2Body' },
  { titleKey: 'privacyPolicy.section3Title', bodyKey: 'privacyPolicy.section3Body' },
  { titleKey: 'privacyPolicy.section4Title', bodyKey: 'privacyPolicy.section4Body' },
  { titleKey: 'privacyPolicy.section5Title', bodyKey: 'privacyPolicy.section5Body' },
  { titleKey: 'privacyPolicy.section6Title', bodyKey: 'privacyPolicy.section6Body' },
  { titleKey: 'privacyPolicy.section7Title', bodyKey: 'privacyPolicy.section7Body' },
];

export default function PrivacyPolicy() {
  const { t } = useAppTranslation();
  return (
    <div>
      <section className="page-header-landing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="page-header-landing__title">{t('privacyPolicy.title')}</h1>
          <p className="page-header-landing__subtitle mx-auto mt-4">{t('privacyPolicy.lastUpdated')}</p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {sectionsKeys.map(s => (
            <div key={s.titleKey}>
              <h2 className="text-lg font-bold text-[var(--navy)] mb-2">{t(s.titleKey)}</h2>
              <p className="text-sm text-[var(--charcoal)] leading-relaxed">{t(s.bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
