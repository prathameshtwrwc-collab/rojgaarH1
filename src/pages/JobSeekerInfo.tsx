import { Link } from 'react-router-dom';
import { UserCheck, Search, Briefcase, MapPin, Shield, Clock, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { FAQItem, Button } from '../components/ui';

function JobSeekerInfo() {
  return (
    <div className="bg-[var(--bg-warm)] transition-colors duration-300">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#101A36] to-[#071A36] py-20 sm:py-24 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-sm font-semibold mb-8">
            <UserCheck size={14} /> For Job Seekers
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Your Next Career Starts Here
          </h1>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
            Join thousands of skilled candidates across India who have found meaningful employment through ROJGAARHAI. Free registration, personalized matching, and full support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register/job-seeker">
              <Button size="lg" className="bg-white text-[var(--navy)] hover:bg-[var(--bg-warm)] shadow-xl hover:-translate-y-0.5 transition-all">
                Register Now — It's Free <ArrowRight size={18} className="ml-1" />
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
              How to Get Started
            </h2>
            <p className="text-base text-[var(--charcoal)] max-w-2xl mx-auto">Three simple steps to land your next opportunity</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: <UserCheck size={28} />, title: 'Create Your Profile', desc: 'Fill in your details — name, skills, experience, and job preferences. Takes less than 5 minutes.' },
              { step: '02', icon: <Search size={28} />, title: 'Get Matched', desc: 'Our team reviews your profile and matches you with the best-fit job openings from verified employers.' },
              { step: '03', icon: <Briefcase size={28} />, title: 'Get Hired', desc: 'Interview with employers, receive your offer letter, and start your new job with ongoing support.' },
            ].map((s, i) => (
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
              Why Join ROJGAARHAI?
            </h2>
            <p className="text-base text-[var(--charcoal)] max-w-2xl mx-auto">Everything we do is designed to help you find meaningful work</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: <CheckCircle size={22} className="text-[var(--green)]" />, title: '100% Free for Job Seekers', desc: 'No registration fees, no hidden charges. Our service is completely free for candidates.' },
              { icon: <Shield size={22} className="text-[var(--navy)]" />, title: 'Verified Employers Only', desc: 'Every company on our platform is vetted. You only interact with legitimate businesses.' },
              { icon: <MapPin size={22} className="text-[var(--orange)]" />, title: 'Local & Relocation Jobs', desc: 'Find opportunities near your hometown or explore jobs in new cities — your choice.' },
              { icon: <Clock size={22} className="text-[var(--purple)]" />, title: 'Quick Turnaround', desc: 'Most candidates get their first match within a week of registration.' },
              { icon: <Heart size={22} className="text-[var(--orange)]" />, title: 'Career Support', desc: 'Our agents guide you through interviews, negotiations, and onboarding.' },
              { icon: <Briefcase size={22} className="text-[var(--green)]" />, title: 'Diverse Industries', desc: 'Manufacturing, healthcare, IT, agriculture, logistics — opportunities across sectors.' },
            ].map(b => (
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
            Simple Registration Form
          </h2>
          <p className="text-center text-[var(--charcoal)] text-sm sm:text-base mb-10">
            Our form is designed to be quick and easy. Here's what you'll need:
          </p>
          <div className="bg-[var(--bg-warm)] rounded-2xl border border-slate-200 p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {['Full Name', 'Phone Number', 'Email Address', 'Date of Birth', 'Current Location', 'Gender', 'Highest Qualification', 'Key Skills', 'Experience (Years)', 'Preferred Job Type', 'Expected Salary', 'Willingness to Relocate'].map((field, i) => (
                <div key={i} className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center gap-3 transition-colors">
                  <CheckCircle size={18} className="text-[var(--green)] flex-shrink-0" />
                  <span className="text-sm font-semibold text-[var(--navy)]">{field}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--charcoal)] mt-5 text-center font-medium">
              Resume upload and profile photo are completely optional
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-[var(--bg-warm)] transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center mb-10 tracking-tight text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
            Frequently Asked Questions
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            <FAQItem question="How do I apply for a job?" answer="Simply register on our platform by filling out the profile form. Our team will review your profile and match you with suitable job openings. You don't need to apply for individual jobs — we do the matching for you." />
            <FAQItem question="Do I need a resume to register?" answer="No, a resume is optional. You can fill in all your details directly in the registration form. However, if you have a resume, uploading it can speed up the process." />
            <FAQItem question="Is there any fee for registration?" answer="No, registration is completely free for job seekers. There are no charges at any stage of the process." />
            <FAQItem question="How will I know if I'm matched with a job?" answer="Once matched, our agent will contact you via phone or email with the job details. You can then decide to proceed with the interview." />
            <FAQItem question="Can I apply for jobs in another state?" answer="Yes! During registration, indicate your willingness to relocate and specify your preferred locations. We'll match you with opportunities in those areas." />
            <FAQItem question="What types of jobs are available?" answer="We have openings across manufacturing, healthcare, IT, agriculture, logistics, construction, education, and more. Both full-time and part-time positions are available." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-[var(--navy)] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to Find Your Next Job?
          </h2>
          <p className="text-base sm:text-lg text-white/80 mb-8">
            Join 1,200+ candidates already registered on our platform
          </p>
          <Link to="/register/job-seeker">
            <Button size="lg" className="bg-[var(--orange)] text-white hover:bg-[#d94d1a] shadow-xl hover:-translate-y-0.5 transition-all">
              Register Now — Free <ArrowRight size={18} className="ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default JobSeekerInfo;
