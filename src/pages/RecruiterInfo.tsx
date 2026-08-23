import { Link } from 'react-router-dom';
import { UserSearch, Link2, UserPlus2, TrendingUp, IndianRupee, Infinity as InfinityIcon, Eye } from 'lucide-react';

const earnCards = [
  { icon: <IndianRupee size={20} />, title: 'Get Rewarded', text: 'Earn for every candidate you bring in who gets hired.' },
  { icon: <InfinityIcon size={20} />, title: 'No Cap', text: 'Refer as many candidates as you want — there\'s no ceiling.' },
  { icon: <Eye size={20} />, title: 'Full Visibility', text: 'Track every referral\'s progress from your dashboard.' },
];

const steps = [
  { icon: <UserPlus2 size={22} />, title: 'Join & Get Approved', text: 'Sign up in minutes. Our team reviews and approves your account so the network stays trustworthy.' },
  { icon: <Link2 size={22} />, title: 'Get Your Unique Link', text: 'Once approved, you get a personal referral link/code to share with candidates.' },
  { icon: <TrendingUp size={22} />, title: 'Onboard & Track', text: 'Add candidates directly — even for those without internet access — and track everyone mapped to you from your dashboard.' },
];

export default function RecruiterInfo() {
  return (
    <div>
      <section className="page-header-landing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="page-header-landing__title">Become a Rojgaar Hai Recruiter</h1>
          <p className="page-header-landing__subtitle mx-auto mt-4">
            Help candidates find real jobs — refer talent through your unique link and track everyone you bring onto the platform.
          </p>
          <Link to="/register/recruiter" className="inline-flex items-center justify-center h-[46px] px-7 mt-6 bg-[#7655D9] text-white text-sm font-bold rounded-full no-underline hover:shadow-lg transition-all">
            Join Now
          </Link>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 mb-14">
            {steps.map(s => (
              <div key={s.title} className="bg-white rounded-2xl border border-slate-200 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-[#7655D9]/10 text-[#7655D9] flex items-center justify-center mx-auto mb-4">
                  {s.icon}
                </div>
                <h3 className="font-bold text-base text-[var(--navy)] mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--charcoal)] leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══ EARN FOR RECRUITING ═══ */}
      <section className="py-20 sm:py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #101A36 0%, #1C2B52 55%, #101A36 100%)' }}>
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7655D9 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--orange) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Turn Your Network Into Income
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed mb-12">
            Refer candidates, help them get hired, earn for it — simple as that.
          </p>

          <div className="grid sm:grid-cols-3 gap-5 text-left">
            {earnCards.map(c => (
              <div key={c.title} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-[#7655D9]/20 text-[#B8A6F5] flex items-center justify-center mb-3">
                  {c.icon}
                </div>
                <h3 className="font-bold text-sm text-white mb-1">{c.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>

          <Link to="/register/recruiter" className="inline-flex items-center justify-center h-[46px] px-7 mt-10 bg-[#7655D9] text-white text-sm font-bold rounded-full no-underline hover:shadow-lg transition-all">
            Start Earning as a Recruiter
          </Link>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#7655D9]/10 text-[#7655D9] flex items-center justify-center mx-auto mb-4">
              <UserSearch size={26} />
            </div>
            <h2 className="text-xl font-bold text-[var(--navy)] mb-2">Ready to start referring?</h2>
            <p className="text-sm text-[var(--charcoal)] mb-6 max-w-md mx-auto">
              Note: new recruiter accounts require a quick approval from our team before your dashboard activates.
            </p>
            <Link to="/register/recruiter" className="inline-flex items-center justify-center h-[46px] px-7 bg-[#7655D9] text-white text-sm font-bold rounded-full no-underline hover:shadow-lg transition-all">
              Join as a Recruiter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
