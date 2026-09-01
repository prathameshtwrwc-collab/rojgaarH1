import { Link } from 'react-router-dom';
import { Target, Users, ShieldCheck, Heart, Sparkles } from 'lucide-react';

const values = [
  { icon: <Target size={22} />, title: 'People-First Approach', text: 'We believe good recruitment is about finding the right match. A candidate is more than a resume, and a job is more than a designation.' },
  { icon: <ShieldCheck size={22} />, title: 'Verified & Reliable', text: 'Every employer is verified. Every job posting is reviewed. We reduce the confusion, clutter, and disconnect that make recruitment frustrating.' },
  { icon: <Users size={22} />, title: 'For Everyone', text: 'Whether starting your journey, looking for a better role, returning to work, or preparing for the next stage — Rojgaar Hai is designed for you.' },
  { icon: <Heart size={22} />, title: 'Built With Care', text: 'We treat every application and every hire as what it really is: someone\'s livelihood and someone\'s team.' },
  { icon: <Sparkles size={22} />, title: 'Right Match, Not More Applications', text: 'We help employers reach the right talent instead of simply receiving more applications. Better connections, better outcomes.' },
];

export default function AboutUs() {
  return (
    <div>
      <section className="page-header-landing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="page-header-landing__title">About Rojgaar Hai</h1>
          <p className="page-header-landing__subtitle mx-auto mt-4">
            Connecting talent with opportunity — meaningfully, reliably, and effectively.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-14 space-y-6">
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            Rojgaar Hai is a people-first recruitment platform created to make the connection between talent and opportunity more meaningful, reliable, and effective. We understand that finding the right job is not simply about applying to multiple openings, and hiring the right person is not simply about filling a vacancy. Both are important decisions that can shape careers, teams, and businesses for years to come.
          </p>
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            Powered by <strong className="text-[var(--navy)]">Pacific Jobs</strong>, Rojgaar Hai brings together practical recruitment experience, industry understanding, and a modern digital approach to create a better hiring experience for both job seekers and employers.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map(v => (
            <div key={v.title} className="bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[rgba(241,90,36,0.1)] text-[var(--orange)] flex items-center justify-center mb-4">
                {v.icon}
              </div>
              <h3 className="font-bold text-lg text-[var(--navy)] mb-2">{v.title}</h3>
              <p className="text-sm text-[var(--charcoal)] leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-[#FAF7F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
              Our Purpose
            </h2>
          </div>
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            For job seekers, we aim to provide access to genuine opportunities that match their skills, experience, ambitions, and career direction. Whether someone is starting their professional journey, looking for a better role, returning to the workforce, or preparing for the next stage of their career, Rojgaar Hai is designed to help them discover opportunities where they can grow and move forward with confidence.
          </p>
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            For employers, we focus on helping organisations reach the right talent instead of simply receiving more applications. Every business has different hiring needs, expectations, cultures, and challenges. By creating stronger connections between employers and relevant candidates, we aim to make recruitment more efficient while helping organisations build capable and dependable teams.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
            Our Belief
          </h2>
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            At the heart of Rojgaar Hai is a simple belief: good recruitment is about finding the right match. A candidate is more than a resume, and a job is more than a designation. The best outcomes happen when skills, aspirations, expectations, and opportunities come together in the right way.
          </p>
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            With the recruitment experience and industry foundation of Pacific Jobs behind us, Rojgaar Hai is building a platform where opportunities are easier to discover, talent is easier to recognise, and meaningful professional connections are easier to create.
          </p>
          <p className="text-lg sm:text-xl font-bold text-[var(--navy)] mt-8">
            Because the right opportunity can shape a career, and the right person can make a real difference to a business.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#FAF7F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--charcoal)] mb-6 text-base">Have questions about how we work? Want to partner with us?</p>
          <Link to="/contact" className="inline-flex items-center justify-center h-[46px] px-8 bg-[var(--orange)] text-white text-sm font-bold rounded-full no-underline hover:shadow-lg transition-all">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
