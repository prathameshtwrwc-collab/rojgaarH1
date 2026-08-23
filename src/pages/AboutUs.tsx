import { Link } from 'react-router-dom';
import { Target, Users, ShieldCheck, Heart } from 'lucide-react';

const values = [
  { icon: <Target size={22} />, title: 'Our Mission', text: 'Connect job seekers across India with real, verified opportunities — and help employers hire faster with better-matched candidates.' },
  { icon: <ShieldCheck size={22} />, title: 'Verified & Trusted', text: 'Every employer on our platform is verified. Every job posting is reviewed before it goes live.' },
  { icon: <Users size={22} />, title: 'For Everyone', text: 'From first-time job seekers without a smartphone to established recruiters — we built Rojgaar Hai to work for all of them.' },
  { icon: <Heart size={22} />, title: 'Built With Care', text: 'We treat every application and every hire as what it really is: someone\'s livelihood and someone\'s team.' },
];

export default function AboutUs() {
  return (
    <div>
      <section className="page-header-landing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="page-header-landing__title">About Rojgaar Hai</h1>
          <p className="page-header-landing__subtitle mx-auto mt-4">
            A better career. The right talent. Real connections that build the future.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-14">
          <p className="text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            Rojgaar Hai exists to close the gap between people looking for work and companies looking to hire —
            without the noise, the fake listings, or the endless waiting. We verify every employer, review every
            job posting, and use real matching logic (not guesswork) to connect the right candidate with the right role.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 gap-6">
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

        <div className="text-center mt-16">
          <p className="text-[var(--charcoal)] mb-4">Have questions about how we work?</p>
          <Link to="/contact" className="inline-flex items-center justify-center h-[46px] px-6 bg-[var(--orange)] text-white text-sm font-bold rounded-full no-underline hover:shadow-lg transition-all">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
