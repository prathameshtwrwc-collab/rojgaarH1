import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { FAQItem } from '../components/ui';
import { useAppTranslation } from '../hooks/useAppTranslation';

function Contact() {
  const { t } = useAppTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  return (
    <div>
      {/* Hero */}
      <section className="page-header-landing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="page-header-landing__title">{t('contact.title')}</h1>
          <p className="page-header-landing__subtitle mx-auto mt-4">{t('contact.subtitle')}</p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* ═══ LEFT CONTACT CARDS ═══ */}
            <div className="space-y-4">
              {/* Phone Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-[rgba(241,90,36,0.1)] text-[var(--orange)] flex items-center justify-center flex-shrink-0">
                  <Phone size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--navy)]">{t('contact.phone')}</h3>
                  <p className="text-sm font-semibold text-[var(--charcoal)] mt-1">+91-1800-123-4567</p>
                  <p className="text-xs text-[var(--charcoal)] mt-1">Toll-free, Mon–Sat 9am–6pm</p>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-[rgba(16,26,54,0.08)] text-[var(--navy)] flex items-center justify-center flex-shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--navy)]">{t('contact.email')}</h3>
                  <p className="text-sm font-semibold text-[var(--charcoal)] mt-1">support@rojgaarhai.com</p>
                  <p className="text-xs text-[var(--charcoal)] mt-1">We respond within 24 hours</p>
                </div>
              </div>

              {/* Office Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-[rgba(13,96,74,0.1)] text-[var(--green)] flex items-center justify-center flex-shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--navy)]">{t('contact.address')}</h3>
                  <p className="text-sm font-semibold text-[var(--charcoal)] mt-1 leading-relaxed">42, Rajiv Gandhi Nagar<br />Jaipur, Rajasthan 302015</p>
                </div>
              </div>

              {/* Working Hours Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-[rgba(118,85,217,0.1)] text-[var(--purple)] flex items-center justify-center flex-shrink-0">
                  <Clock size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--navy)]">{t('contact.workingHours')}</h3>
                  <p className="text-sm font-semibold text-[var(--charcoal)] mt-1 leading-relaxed">Monday – Saturday<br />9:00 AM – 6:00 PM IST</p>
                </div>
              </div>
            </div>

            {/* ═══ CONTACT FORM CONTAINER ═══ */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-[var(--green)] text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <CheckCircle size={32} />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[var(--navy)]">{t('contact.success')}</h3>
                    <p className="text-sm text-[var(--charcoal)] mt-2 max-w-md mx-auto">{t('contact.successMessage')}</p>
                    <button
                      onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                      className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--navy)] text-white font-semibold rounded-full hover:bg-[#1a2540] transition-colors"
                    >
                      {t('contact.sendAnotherMessage')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-extrabold text-[var(--navy)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t('contact.formTitle')}</h3>
                      <p className="text-sm text-[var(--charcoal)] mt-1">{t('contact.formSubtitle')}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                          {t('contact.name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t('contact.name')}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none text-sm bg-white text-[var(--navy)] placeholder:text-[var(--charcoal)]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                          {t('contact.email')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@email.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none text-sm bg-white text-[var(--navy)] placeholder:text-[var(--charcoal)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                        {t('contact.subject')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        placeholder={t('contact.subjectPlaceholder')}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none text-sm bg-white text-[var(--navy)] placeholder:text-[var(--charcoal)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--navy)] mb-2">
                        {t('contact.message')} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t('contact.messagePlaceholder')}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none text-sm bg-white text-[var(--navy)] placeholder:text-[var(--charcoal)] resize-none"
                        style={{ minHeight: '130px' }}
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--orange)] text-white font-semibold rounded-full hover:bg-[#d94d1a] transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t('contact.sending')}
                          </>
                        ) : (
                          <>
                            <Send size={18} /> {t('contact.send')}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-24 bg-[var(--bg-warm)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy)] tracking-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>{t('contact.faqTitle')}</h2>
            <p className="text-base text-[var(--charcoal)]">{t('contact.faqSubtitle')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200">
            <FAQItem question={t('contact.faq1Question')} answer={t('contact.faq1Answer')} />
            <FAQItem question={t('contact.faq2Question')} answer={t('contact.faq2Answer')} />
            <FAQItem question={t('contact.faq3Question')} answer={t('contact.faq3Answer')} />
            <FAQItem question={t('contact.faq4Question')} answer={t('contact.faq4Answer')} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
