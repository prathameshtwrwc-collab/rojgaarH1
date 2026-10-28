import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Copy, Check } from 'lucide-react';
import { FAQItem } from '../components/ui';
import { useAppTranslation } from '../hooks/useAppTranslation';

const SUPPORT_EMAIL = 'support@rojgaarhai.com';
const SUPPORT_PHONE = '+918693802432';

// The site has no message inbox on the server, so the form hands the message to the
// visitor's own email app, addressed to support. Nothing is pretended to be "sent".
function buildMailto(d: { name: string; email: string; subject: string; message: string }) {
  const body = `${d.message.trim()}\n\n---\nName: ${d.name.trim()}\nEmail: ${d.email.trim()}`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(d.subject.trim() || 'Message from rojgaarhai.com')}&body=${encodeURIComponent(body)}`;
}

function Contact() {
  const { t } = useAppTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = buildMailto(formData);
    setSubmitted(true);
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${SUPPORT_EMAIL}\nSubject: ${formData.subject}\n\n${formData.message}\n\n${formData.name} (${formData.email})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
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
              <a href={`tel:${SUPPORT_PHONE}`} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]">
                <div className="w-12 h-12 rounded-xl bg-[rgba(241,90,36,0.1)] text-[var(--orange)] flex items-center justify-center flex-shrink-0">
                  <Phone size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--navy)]">{t('contact.phone')}</h3>
                   <p className="text-sm font-semibold text-[var(--orange)] mt-1">+91-8693802432</p>
                   <p className="text-xs text-[var(--charcoal)] mt-1">Mon–Sat, 9am–6pm · tap to call</p>
                </div>
              </a>

              {/* Email Card */}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]">
                <div className="w-12 h-12 rounded-xl bg-[rgba(16,26,54,0.08)] text-[var(--navy)] flex items-center justify-center flex-shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--navy)]">{t('contact.email')}</h3>
                  <p className="text-sm font-semibold text-[var(--orange)] mt-1 break-all">{SUPPORT_EMAIL}</p>
                  <p className="text-xs text-[var(--charcoal)] mt-1">We respond within 24 hours</p>
                </div>
              </a>

              {/* Office Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-[rgba(13,96,74,0.1)] text-[var(--green)] flex items-center justify-center flex-shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--navy)]">{t('contact.address')}</h3>
                   <p className="text-sm font-semibold text-[var(--charcoal)] mt-1 leading-relaxed">58, Safed Pool, Andheri - Kurla Road, Sakinaka, Mumbai - 400072</p>
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
                  <div className="text-center py-10 dash-enter" role="status">
                    <div className="auth-verified inline-flex mb-4">
                      <span className="w-16 h-16 rounded-full bg-[var(--green)] text-white flex items-center justify-center shadow-lg">
                        <CheckCircle size={32} />
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-[var(--navy)]">Almost there</h3>
                    <p className="text-sm text-[var(--charcoal)] mt-2 max-w-md mx-auto">
                      Your email app should have opened with your message to <strong className="text-[var(--navy)]">{SUPPORT_EMAIL}</strong>. Press send there and we will reply within 24 hours.
                    </p>
                    <p className="text-xs text-slate-500 mt-4 max-w-md mx-auto">Nothing opened? Copy the message and email it, or call us.</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={copyMessage}
                        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-slate-300 text-sm font-bold text-[var(--navy)] hover:bg-slate-50 active:scale-[0.97] transition"
                      >
                        {copied ? <><Check size={16} className="text-[var(--green)]" /> Copied</> : <><Copy size={16} /> Copy message</>}
                      </button>
                      <a href={buildMailto(formData)} className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-slate-300 text-sm font-bold text-[var(--navy)] hover:bg-slate-50 active:scale-[0.97] transition">
                        <Mail size={16} /> Open email again
                      </a>
                      <a href={`tel:${SUPPORT_PHONE}`} className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-slate-300 text-sm font-bold text-[var(--navy)] hover:bg-slate-50 active:scale-[0.97] transition">
                        <Phone size={16} /> Call
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                      className="mt-6 inline-flex items-center justify-center gap-2 h-11 px-6 bg-[var(--navy)] text-white font-semibold rounded-full hover:bg-[#1a2540] transition-colors"
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
                          autoComplete="name"
                          autoCapitalize="words"
                          maxLength={80}
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
                          inputMode="email"
                          autoComplete="email"
                          autoCapitalize="none"
                          spellCheck={false}
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
                        maxLength={120}
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
                        maxLength={2000}
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t('contact.messagePlaceholder')}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none text-sm bg-white text-[var(--navy)] placeholder:text-[var(--charcoal)] resize-none"
                        style={{ minHeight: '130px' }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[var(--orange)] text-white font-bold rounded-full hover:bg-[#d94d1a] active:scale-[0.97] transition"
                      >
                        <Send size={18} /> {t('contact.send')}
                      </button>
                      <p className="text-xs text-slate-500">Opens your email app with this message, ready to send.</p>
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
