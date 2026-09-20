import { Link } from 'react-router-dom';
import { UserCheck, Search, Briefcase, MapPin, Shield, Clock, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { FAQItem, Button } from '../components/ui';
import { useAppTranslation } from '../hooks/useAppTranslation';

function JobSeekerInfo() {
  const { t } = useAppTranslation();
  const steps = [
    { step: '01', icon: <UserCheck size={28} />, title: t('jobSeekerInfo.step1Title'), desc: t('jobSeekerInfo.step1Desc') },
    { step: '02', icon: <Search size={28} />, title: t('jobSeekerInfo.step2Title'), desc: t('jobSeekerInfo.step2Desc') },
    { step: '03', icon: <Briefcase size={28} />, title: t('jobSeekerInfo.step3Title'), desc: t('jobSeekerInfo.step3Desc') },
  ];
  const benefits = [
    { icon: <CheckCircle size={22} className="text-[var(--green)]" />, title: t('jobSeekerInfo.benefit1Title'), desc: t('jobSeekerInfo.benefit1Desc') },
    { icon: <Shield size={22} className="text-[var(--navy)]" />, title: t('jobSeekerInfo.benefit2Title'), desc: t('jobSeekerInfo.benefit2Desc') },
    { icon: <MapPin size={22} className="text-[var(--orange)]" />, title: t('jobSeekerInfo.benefit3Title'), desc: t('jobSeekerInfo.benefit3Desc') },
    { icon: <Clock size={22} className="text-[var(--purple)]" />, title: t('jobSeekerInfo.benefit4Title'), desc: t('jobSeekerInfo.benefit4Desc') },
    { icon: <Heart size={22} className="text-[var(--orange)]" />, title: t('jobSeekerInfo.benefit5Title'), desc: t('jobSeekerInfo.benefit5Desc') },
    { icon: <Briefcase size={22} className="text-[var(--green)]" />, title: t('jobSeekerInfo.benefit6Title'), desc: t('jobSeekerInfo.benefit6Desc') },
  ];
  const formFields = ['Full Name', 'Phone Number', 'Email Address', 'Date of Birth', 'Current Location', 'Gender', 'Highest Qualification', 'Key Skills', 'Experience (Years)', 'Preferred Job Type', 'Expected Salary', 'Willingness to Relocate'];
  return (
    <div className="bg-[var(--bg-warm)] transition-colors duration-300">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#101A36] to-[#071A36] py-20 sm:py-24 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-sm font-semibold mb-8">
            <UserCheck size={14} /> {t('jobSeekerInfo.heroEyebrow')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            {t('jobSeekerInfo.heroTitle')}
          </h1>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
            {t('jobSeekerInfo.heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register/job-seeker">
              <Button size="lg" className="bg-white text-[var(--navy)] hover:bg-[var(--bg-warm)] shadow-xl hover:-translate-y-0.5 transition-all">
                {t('jobSeekerInfo.registerNow')} <ArrowRight size={18} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy)] tracking-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              {t('jobSeekerInfo.howToGetStarted')}
            </h2>
            <p className="text-base text-[var(--charcoal)] max-w-2xl mx-auto">{t('jobSeekerInfo.howToGetStartedSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[rgba(241,90,36,0.1)] text-[var(--orange)] border border-[rgba(241,90,36,0.2)] rounded-2xl mb-5 shadow-sm mx-auto">
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-[var(--orange)] uppercase tracking-wider mb-2">STEP {s.step}</div>
                <h3 className="text-lg font-bold text-[var(--navy)] mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--charcoal)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 sm:py-24 bg-[var(--bg-warm)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy)] tracking-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              {t('jobSeekerInfo.whyJoin')}
            </h2>
            <p className="text-base text-[var(--charcoal)] max-w-2xl mx-auto">{t('jobSeekerInfo.whyJoinSubtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map(b => (
              <div key={b.title} className="bg-white rounded-2xl border border-slate-200 p-5 flex gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex-shrink-0 mt-0.5">{b.icon}</div>
                <div>
                  <h4 className="font-bold text-[var(--navy)] text-base mb-1">{b.title}</h4>
                  <p className="text-sm text-[var(--charcoal)] leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Form Preview */}
      <section className="py-16 sm:py-20 bg-white transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center mb-3 tracking-tight text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
            {t('jobSeekerInfo.formTitle')}
          </h2>
          <p className="text-center text-[var(--charcoal)] text-sm sm:text-base mb-10">
            {t('jobSeekerInfo.formSubtitle')}
          </p>
          <div className="bg-[var(--bg-warm)] rounded-2xl border border-slate-200 p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {formFields.map((field, i) => (
                <div key={i} className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center gap-3 transition-colors">
                  <CheckCircle size={18} className="text-[var(--green)] flex-shrink-0" />
                  <span className="text-sm font-semibold text-[var(--navy)]">{field}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--charcoal)] mt-5 text-center font-medium">
              {t('jobSeekerInfo.formOptionalNote')}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-[var(--bg-warm)] transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center mb-10 tracking-tight text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
            {t('jobSeekerInfo.faqTitle')}
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200">
            <FAQItem question={t('jobSeekerInfo.faq1Question')} answer={t('jobSeekerInfo.faq1Answer')} />
            <FAQItem question={t('jobSeekerInfo.faq2Question')} answer={t('jobSeekerInfo.faq2Answer')} />
            <FAQItem question={t('jobSeekerInfo.faq3Question')} answer={t('jobSeekerInfo.faq3Answer')} />
            <FAQItem question={t('jobSeekerInfo.faq4Question')} answer={t('jobSeekerInfo.faq4Answer')} />
            <FAQItem question={t('jobSeekerInfo.faq5Question')} answer={t('jobSeekerInfo.faq5Answer')} />
            <FAQItem question={t('jobSeekerInfo.faq6Question')} answer={t('jobSeekerInfo.faq6Answer')} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-[var(--navy)] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {t('jobSeekerInfo.ctaTitle')}
          </h2>
          <p className="text-base sm:text-lg text-white/80 mb-8">
            {t('jobSeekerInfo.ctaSubtitle')}
          </p>
          <Link to="/register/job-seeker">
            <Button size="lg" className="bg-[var(--orange)] text-white hover:bg-[#d94d1a] shadow-xl hover:-translate-y-0.5 transition-all">
              {t('jobSeekerInfo.ctaButton')} <ArrowRight size={18} className="ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default JobSeekerInfo;
