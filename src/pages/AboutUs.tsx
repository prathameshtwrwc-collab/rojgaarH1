import { Link } from 'react-router-dom';
import { Target, Users, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';

export default function AboutUs() {
  const { t } = useAppTranslation();
  const values = [
    { icon: <Target size={22} />, titleKey: 'aboutUs.values.peopleFirst', textKey: 'aboutUs.values.peopleFirstText' },
    { icon: <ShieldCheck size={22} />, titleKey: 'aboutUs.values.verifiedReliable', textKey: 'aboutUs.values.verifiedReliableText' },
    { icon: <Users size={22} />, titleKey: 'aboutUs.values.forEveryone', textKey: 'aboutUs.values.forEveryoneText' },
    { icon: <Heart size={22} />, titleKey: 'aboutUs.values.builtWithCare', textKey: 'aboutUs.values.builtWithCareText' },
    { icon: <Sparkles size={22} />, titleKey: 'aboutUs.values.rightMatch', textKey: 'aboutUs.values.rightMatchText' },
  ];
  return (
    <div>
      <section className="page-header-landing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="page-header-landing__title">{t('aboutUs.title')}</h1>
          <p className="page-header-landing__subtitle mx-auto mt-4">
            {t('aboutUs.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-14 space-y-6">
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            {t('aboutUs.p1')}
          </p>
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            {t('aboutUs.p2')}
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map(v => (
            <div key={v.titleKey} className="bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[rgba(241,90,36,0.1)] text-[var(--orange)] flex items-center justify-center mb-4">
                {v.icon}
              </div>
              <h3 className="font-bold text-lg text-[var(--navy)] mb-2">{t(v.titleKey)}</h3>
              <p className="text-sm text-[var(--charcoal)] leading-relaxed">{t(v.textKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-[#FAF7F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
              {t('aboutUs.purposeTitle')}
            </h2>
          </div>
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            {t('aboutUs.purposeP1')}
          </p>
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            {t('aboutUs.purposeP2')}
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
            {t('aboutUs.beliefTitle')}
          </h2>
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            {t('aboutUs.beliefP1')}
          </p>
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            {t('aboutUs.beliefP2')}
          </p>
          <p className="text-lg sm:text-xl font-bold text-[var(--navy)] mt-8">
            {t('aboutUs.beliefP3')}
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#FAF7F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--charcoal)] mb-6 text-base">{t('aboutUs.contactTitle')}</p>
          <Link to="/contact" className="inline-flex items-center justify-center h-[46px] px-8 bg-[var(--orange)] text-white text-sm font-bold rounded-full no-underline hover:shadow-lg transition-all">
            {t('aboutUs.contactButton')}
          </Link>
        </div>
      </section>
    </div>
  );
}
