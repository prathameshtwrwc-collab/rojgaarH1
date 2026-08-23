import { Newspaper } from 'lucide-react';

export default function Blog() {
  return (
    <div>
      <section className="page-header-landing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="page-header-landing__title">Blog</h1>
          <p className="page-header-landing__subtitle mx-auto mt-4">
            Career tips, hiring advice, and updates from the Rojgaar Hai team.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-400">
            <Newspaper size={32} />
          </div>
          <h2 className="text-xl font-bold text-[var(--navy)] mb-2">Coming Soon</h2>
          <p className="text-[var(--charcoal)] text-sm">
            We're working on articles about job search strategies, interview prep, and hiring best practices.
            Check back soon.
          </p>
        </div>
      </section>
    </div>
  );
}
