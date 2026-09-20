import { Link } from 'react-router-dom';
import {
  Building2, FileText, Users, CheckCircle, Zap,
  ArrowRight, TrendingUp, Award, Star, HardHat, Factory,
  Truck, Stethoscope, Wheat, ShieldCheck, HeartHandshake, Rocket
} from 'lucide-react';
import { Button } from '../components/ui';
import { useAppTranslation } from '../hooks/useAppTranslation';

function EmployerInfo() {
  const { t } = useAppTranslation();
  const whyChooseUs = [
    { title: t('employerInfo.why1Title'), desc: t('employerInfo.why1Desc'), icon: <ShieldCheck size={28} className="text-orange-600" />, bg: 'bg-orange-50 border-orange-100' },
    { title: t('employerInfo.why2Title'), desc: t('employerInfo.why2Desc'), icon: <Zap size={28} className="text-amber-600" />, bg: 'bg-amber-50 border-amber-100' },
    { title: t('employerInfo.why3Title'), desc: t('employerInfo.why3Desc'), icon: <Award size={28} className="text-slate-700" />, bg: 'bg-slate-50 border-slate-100' },
    { title: t('employerInfo.why4Title'), desc: t('employerInfo.why4Desc'), icon: <FileText size={28} className="text-green-600" />, bg: 'bg-green-50 border-green-100' },
    { title: t('employerInfo.why5Title'), desc: t('employerInfo.why5Desc'), icon: <Users size={28} className="text-purple-600" />, bg: 'bg-purple-50 border-purple-100' },
    { title: t('employerInfo.why6Title'), desc: t('employerInfo.why6Desc'), icon: <HeartHandshake size={28} className="text-orange-600" />, bg: 'bg-orange-50 border-orange-100' },
  ];

  const hiringSteps = [
    { step: '01', title: t('employerInfo.step1Title'), desc: t('employerInfo.step1Desc'), icon: <Building2 size={30} className="text-orange-600" />, iconBg: 'bg-orange-50 border-orange-200' },
    { step: '02', title: t('employerInfo.step2Title'), desc: t('employerInfo.step2Desc'), icon: <FileText size={30} className="text-slate-700" />, iconBg: 'bg-slate-50 border-slate-100' },
    { step: '03', title: t('employerInfo.step3Title'), desc: t('employerInfo.step3Desc'), icon: <CheckCircle size={30} className="text-green-600" />, iconBg: 'bg-green-50 border-green-100' },
  ];

  const employerBenefits = [
    { title: t('employerInfo.adv1Title'), desc: t('employerInfo.adv1Desc'), icon: <Zap size={22} className="text-teal-600" /> },
    { title: t('employerInfo.adv2Title'), desc: t('employerInfo.adv2Desc'), icon: <Award size={22} className="text-emerald-600" /> },
    { title: t('employerInfo.adv3Title'), desc: t('employerInfo.adv3Desc'), icon: <ShieldCheck size={22} className="text-[var(--orange)]" /> },
    { title: t('employerInfo.adv4Title'), desc: t('employerInfo.adv4Desc'), icon: <Users size={22} className="text-purple-600" /> },
    { title: t('employerInfo.adv5Title'), desc: t('employerInfo.adv5Desc'), icon: <TrendingUp size={22} className="text-amber-600" /> },
    { title: t('employerInfo.adv6Title'), desc: t('employerInfo.adv6Desc'), icon: <CheckCircle size={22} className="text-rose-500" /> },
  ];

  const industries = [
    { title: t('employerInfo.industry1'), icon: <Factory size={24} className="text-teal-600" />, roles: t('employerInfo.industry1Roles') },
    { title: t('employerInfo.industry2'), icon: <HardHat size={24} className="text-amber-600" />, roles: t('employerInfo.industry2Roles') },
    { title: t('employerInfo.industry3'), icon: <Truck size={24} className="text-[var(--orange)]" />, roles: t('employerInfo.industry3Roles') },
    { title: t('employerInfo.industry4'), icon: <Stethoscope size={24} className="text-emerald-600" />, roles: t('employerInfo.industry4Roles') },
    { title: t('employerInfo.industry5'), icon: <Wheat size={24} className="text-green-600" />, roles: t('employerInfo.industry5Roles') },
    { title: t('employerInfo.industry6'), icon: <Building2 size={24} className="text-purple-600" />, roles: t('employerInfo.industry6Roles') },
    { title: t('employerInfo.industry7'), icon: <Users size={24} className="text-orange-600" />, roles: t('employerInfo.industry7Roles') },
    { title: t('employerInfo.industry8'), icon: <FileText size={24} className="text-rose-500" />, roles: t('employerInfo.industry8Roles') },
  ];

  const employerTestimonials = [
    {
      quote: 'We needed 15 CNC machine operators for our plant in Pune on short notice. RojgaarHai delivered pre-screened candidates within 4 days. All 15 were verified and ready to join.',
      name: 'Sanjay Mehta',
      designation: 'HR Manager',
      company: 'Bharat Manufacturing Co.',
      rating: 5,
      avatar: 'SM'
    },
    {
      quote: 'Finding qualified B.Sc Nursing staff for our Hyderabad hospital was difficult until we used RojgaarHai. The candidates were well-trained and pre-screened.',
      name: 'Dr. K. Rao',
      designation: 'Medical Director',
      company: 'Metro Hospital Group',
      rating: 5,
      avatar: 'KR'
    },
    {
      quote: 'RojgaarHai connected us with field supervisors and agriculture officers across Nashik. Simple pricing and fast candidate turnaround made a huge difference.',
      name: 'Anita Deshmukh',
      designation: 'Director',
      company: 'Greenfield Agro Pvt Ltd',
      rating: 5,
      avatar: 'AD'
    },
    {
      quote: 'Our steel works plant in Manesar regularly hires welders and electricians. RojgaarHai handles sourcing, verification, and logistics seamlessly.',
      name: 'Kapil Sharma',
      designation: 'Plant Head',
      company: 'Northern Steel Works',
      rating: 5,
      avatar: 'KS'
    }
  ];

  return (
    <div className="bg-[var(--bg-warm)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      
      {/* ═══════════════════════════════════════════════════════
          SECTION 1: HERO SECTION
          ═══════════════════════════════════════════════════════ */}
      <section
        className="employer-info-hero relative bg-[var(--bg-warm)] bg-no-repeat bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/assets/foremployers/foremployers.png')", aspectRatio: '1825 / 862' }}
      >
        <div className="employer-info-hero-inner relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="employer-info-hero-content w-[62%] sm:w-[54%] lg:w-[46%] py-16 sm:py-0">

            <p className="employer-info-hero-eyebrow text-[13px] sm:text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--navy)]">
              {t('employerInfo.heroEyebrow').split(' ')[0]} <span className="text-[var(--purple)]">{t('employerInfo.heroEyebrow').split(' ').slice(1).join(' ')}</span>
            </p>

            <h1 className="employer-info-hero-heading mt-3">
              <span className="employer-info-hero-heading-1 block font-extrabold leading-[0.95] tracking-tight text-[var(--navy)] text-4xl sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>
                {t('employerInfo.heroTitle1')}
              </span>
              <span className="employer-info-hero-heading-2 relative inline-block mt-3 sm:mt-4 leading-none text-[var(--purple)] text-5xl sm:text-6xl lg:text-7xl" style={{ fontFamily: 'var(--font-hand)' }}>
                {t('employerInfo.heroTitle2')}
                <svg className="absolute left-0 -bottom-3 w-[92%]" viewBox="0 0 200 14" fill="none" aria-hidden="true">
                  <path d="M3 7C40 2 90 1 140 5C160 6.5 180 9 197 6" stroke="var(--purple)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="employer-info-hero-desc mt-6 text-base sm:text-lg text-[var(--charcoal)] leading-relaxed max-w-md">
              {t('employerInfo.heroDesc')}
            </p>

            {/* Feature icons row */}
            <div className="employer-info-hero-icons mt-8 grid grid-cols-4 gap-3 max-w-sm">
              {[
                { label: t('employerInfo.feature1'), sub: t('employerInfo.feature1Sub'), icon: <Users size={22} className="text-[var(--green)]" />, bg: 'rgba(13,96,74,0.1)' },
                { label: t('employerInfo.feature2'), sub: t('employerInfo.feature2Sub'), icon: <ShieldCheck size={22} className="text-[var(--purple)]" />, bg: 'rgba(118,85,217,0.1)' },
                { label: t('employerInfo.feature3'), sub: t('employerInfo.feature3Sub'), icon: <Rocket size={22} className="text-[var(--orange)]" />, bg: 'rgba(241,90,36,0.1)' },
                { label: t('employerInfo.feature4'), sub: t('employerInfo.feature4Sub'), icon: <TrendingUp size={22} className="text-[var(--green)]" />, bg: 'rgba(13,96,74,0.1)' },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center text-center gap-1.5">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: f.bg }}>
                    {f.icon}
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-[var(--navy)] leading-tight">
                    {f.label}<br />{f.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="employer-info-hero-actions mt-9 flex flex-wrap gap-3.5">
              <Link to="/register/employer">
                <Button size="lg" className="bg-[var(--purple)] text-white hover:bg-[#6647c2] font-bold shadow-lg hover:-translate-y-0.5 transition-all">
                  {t('employerInfo.cta1')} <ArrowRight size={18} className="ml-1" />
                </Button>
              </Link>
              <Link to="/jobs">
                <span className="inline-flex items-center justify-center gap-2 h-[50px] px-7 bg-transparent border-2 border-[var(--purple)] text-[var(--purple)] font-bold rounded-xl transition-all text-base cursor-pointer hover:bg-[var(--purple)]/5">
                  {t('employerInfo.cta2')} <ArrowRight size={18} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: WHY CHOOSE ROJGAARHAI
          ═══════════════════════════════════════════════════════ */}
      <section id="why-choose-us" className="py-20 bg-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy)] tracking-tight">
              {t('employerInfo.whyChooseUsTitle')}
            </h2>
            <p className="mt-3 text-base text-[var(--charcoal)] leading-relaxed">
              {t('employerInfo.whyChooseUsSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group"
              >
                <div className={`p-3.5 rounded-2xl border w-fit mb-5 transition-transform group-hover:scale-110 ${card.bg}`}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-[var(--navy)] mb-2">{card.title}</h3>
                <p className="text-sm text-[var(--charcoal)] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 bg-[var(--bg-warm)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy)] tracking-tight">
              {t('employerInfo.howItWorksTitle')}
            </h2>
            <p className="mt-3 text-base text-[var(--charcoal)]">
              {t('employerInfo.howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {hiringSteps.map((s, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 text-center relative flex flex-col items-center p-6 hover:-translate-y-1 transition-transform"
              >
                <div className={`w-16 h-16 rounded-2xl ${s.iconBg} flex items-center justify-center mb-5 shadow-inner`}>
                  {s.icon}
                </div>
                <span className="text-xs font-extrabold text-[var(--orange)] uppercase tracking-widest mb-2">
                  STEP {s.step}
                </span>
                <h3 className="text-xl font-bold text-[var(--navy)] mb-3">{s.title}</h3>
                <p className="text-sm text-[var(--charcoal)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/register/employer">
              <Button size="lg" className="bg-[var(--orange)] text-white hover:bg-[#d94d1a] font-extrabold shadow-xl">
                {t('employerInfo.getStartedNow')} <ArrowRight size={18} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4: BENEFITS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy)] tracking-tight">
              {t('employerInfo.advantagesTitle')}
            </h2>
            <p className="mt-3 text-base text-[var(--charcoal)]">
              {t('employerInfo.advantagesSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {employerBenefits.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all">
                <div className="p-2.5 bg-white rounded-xl w-fit mb-3 border border-slate-200">
                  {b.icon}
                </div>
                <h4 className="font-bold text-[var(--navy)] text-base mb-1.5">{b.title}</h4>
                <p className="text-sm text-[var(--charcoal)] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5: INDUSTRIES WE SERVE
          ═══════════════════════════════════════════════════════ */}
      <section id="industries" className="py-20 bg-[var(--bg-warm)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy)] tracking-tight">
              {t('employerInfo.industriesTitle')}
            </h2>
            <p className="mt-3 text-base text-[var(--charcoal)]">
              {t('employerInfo.industriesSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((ind, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-3 bg-slate-50 rounded-2xl w-fit mb-4">
                  {ind.icon}
                </div>
                <h4 className="font-bold text-[var(--navy)] text-base mb-1">{ind.title}</h4>
                <p className="text-xs text-[var(--charcoal)] leading-relaxed font-medium">{ind.roles}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6: EMPLOYER TESTIMONIALS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy)] tracking-tight">
              {t('employerInfo.testimonialsTitle')}
            </h2>
            <p className="mt-3 text-base text-[var(--charcoal)]">
              {t('employerInfo.testimonialsSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {employerTestimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} className="fill-amber-400" />)}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--charcoal)] italic leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <div className="w-10 h-10 bg-[var(--orange)] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                    {t.avatar}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[var(--navy)]">{t.name}</h5>
                    <p className="text-[11px] text-[var(--charcoal)] font-medium">{t.designation} • {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 7: FINAL CTA BANNER
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-r from-[#101A36] to-[#071A36] relative overflow-hidden text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('employerInfo.finalCtaTitle')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-teal-100 max-w-xl mx-auto leading-relaxed">
            {t('employerInfo.finalCtaSubtitle')}
          </p>
          <div className="mt-8">
            <Link to="/register/employer">
              <Button size="lg" className="bg-[var(--orange)] text-white hover:bg-[#d94d1a] font-extrabold shadow-2xl hover:-translate-y-0.5 transition-all text-base px-8 py-4">
                {t('employerInfo.finalCtaButton')} <ArrowRight size={18} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default EmployerInfo;
