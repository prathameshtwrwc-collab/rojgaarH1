import { useAppTranslation } from '../hooks/useAppTranslation';

const sectionsKeys = [
  { titleKey: 'terms.section1Title', bodyKey: 'terms.section1Body' },
  { titleKey: 'terms.section2Title', bodyKey: 'terms.section2Body' },
  { titleKey: 'terms.section3Title', bodyKey: 'terms.section3Body' },
  { titleKey: 'terms.section4Title', bodyKey: 'terms.section4Body' },
  { titleKey: 'terms.section5Title', bodyKey: 'terms.section5Body' },
  { titleKey: 'terms.section6Title', bodyKey: 'terms.section6Body' },
  { titleKey: 'terms.section7Title', bodyKey: 'terms.section7Body' },
  { titleKey: 'terms.section8Title', bodyKey: 'terms.section8Body' },
  { titleKey: 'terms.section9Title', bodyKey: 'terms.section9Body' },
];

export default function Terms() {
  const { t } = useAppTranslation();
  return (
    <div>
      <section className="page-header-landing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="page-header-landing__title">{t('terms.title')}</h1>
          <p className="page-header-landing__subtitle mx-auto mt-4">{t('terms.lastUpdated')}</p>
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
