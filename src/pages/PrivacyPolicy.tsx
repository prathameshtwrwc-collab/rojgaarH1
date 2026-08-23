const sections = [
  {
    title: '1. Information We Collect',
    body: 'When you register as a candidate or employer, we collect information you provide directly — name, email, phone number, resume details, work experience, company information, and job postings. We also collect usage data such as pages visited and jobs viewed to improve matching quality.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to create and manage your account, match candidates with relevant job openings, allow employers to review applicants, send you relevant notifications, and improve our platform. We do not sell your personal data to third parties.',
  },
  {
    title: '3. Information Sharing',
    body: 'Candidate profile information (name, contact details, resume, skills, experience) is shared with employers when you apply to their job postings or when a recruiter matches you to a role. Employer company information is visible to candidates browsing job listings.',
  },
  {
    title: '4. Data Security',
    body: 'We use industry-standard security practices, including encrypted connections and access controls, to protect your data. Passwords are never stored in plain text.',
  },
  {
    title: '5. Your Rights',
    body: 'You can review and update your profile information at any time from your dashboard. To request account deletion or have questions about your data, contact us at support@rojgaarhai.com.',
  },
  {
    title: '6. Cookies',
    body: 'We use essential cookies to keep you logged in and remember your preferences. We do not use third-party advertising trackers.',
  },
  {
    title: '7. Changes to This Policy',
    body: 'We may update this policy from time to time. Material changes will be communicated via the platform or email.',
  },
];

export default function PrivacyPolicy() {
  return (
    <div>
      <section className="page-header-landing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="page-header-landing__title">Privacy Policy</h1>
          <p className="page-header-landing__subtitle mx-auto mt-4">Last updated: August 2026</p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {sections.map(s => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-[var(--navy)] mb-2">{s.title}</h2>
              <p className="text-sm text-[var(--charcoal)] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
