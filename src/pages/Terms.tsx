const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account or using Rojgaar Hai, you agree to these Terms of Service. If you do not agree, please do not use the platform.',
  },
  {
    title: '2. Eligibility',
    body: 'Candidates must be at least 18 years old or have guardian consent as applicable under Indian law. Employers must provide accurate company information and hold the authority to post job openings on behalf of their organization.',
  },
  {
    title: '3. Accurate Information',
    body: 'You agree to provide accurate, current information when creating your profile or posting a job. Rojgaar Hai reserves the right to suspend accounts found to contain false or misleading information.',
  },
  {
    title: '4. Job Postings & Applications',
    body: 'All job postings are reviewed before going live. Employers are responsible for the legality and accuracy of their listings. Candidates apply to jobs at their own discretion; Rojgaar Hai facilitates the connection but is not a party to any resulting employment relationship.',
  },
  {
    title: '5. Prohibited Conduct',
    body: 'Users may not post fraudulent job listings, misrepresent their identity or qualifications, scrape or misuse platform data, or use the platform for any unlawful purpose.',
  },
  {
    title: '6. Account Termination',
    body: 'Rojgaar Hai may suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform.',
  },
  {
    title: '7. Limitation of Liability',
    body: 'Rojgaar Hai provides a platform to connect candidates and employers. We do not guarantee employment outcomes and are not liable for the conduct of any user, employer, or candidate on the platform.',
  },
  {
    title: '8. Changes to These Terms',
    body: 'We may update these terms periodically. Continued use of the platform after changes constitutes acceptance of the updated terms.',
  },
  {
    title: '9. Contact',
    body: 'Questions about these terms can be sent to support@rojgaarhai.com.',
  },
];

export default function Terms() {
  return (
    <div>
      <section className="page-header-landing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="page-header-landing__title">Terms of Service</h1>
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
