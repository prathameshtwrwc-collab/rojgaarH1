import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import AnimatedCounter from '../components/AnimatedCounter';
import RoleChooserModal from '../components/RoleChooserModal';

const testimonialCards = [
  {
    name: 'Priya Verma',
    role: 'Marketing Specialist',
    text: <>We found the<br />perfect fit...</>,
  },
  {
    name: 'Arjun Mehta',
    role: <>HR Manager,<br />TechNova</>,
    text: <>We found the perfect<br />candidate in just 3 days!</>,
  },
  {
    name: 'Karan Malhotra',
    role: <>CEO,<br />Growthify</>,
    text: <>We found top talent<br />surprisingly fast!</>,
  },
];

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [activeCard, setActiveCard] = useState(1);
  const [showRoleChooser, setShowRoleChooser] = useState(false);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY === 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Header */}
      <header className={`header ${atTop ? "header--at-top" : ""}`}>
        <div className="header-inner">
          <Link to="/" className="brand">
            <img src="/assets/logo/RogjaarHaiLogo.png" alt="Rojgaar Hai" className="brand-icon h-[72px] w-auto object-contain" />
          </Link>

          <div className="header-right">
            <nav className="nav" aria-label="Primary">
              <Link to="/job-seeker-info" className="nav-link">For Job Seekers</Link>
              <Link to="/employer-info" className="nav-link">For Employers</Link>
              <Link to="/recruiter-info" className="nav-link">Recruiters</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              <Link to="/jobs" className="nav-link">Apply for Jobs</Link>
            </nav>

            <button onClick={() => setShowRoleChooser(true)} className="btn-header-cta">
              <span>Get Started</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>

            <button
              className="menu-toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={`menu-icon ${menuOpen ? 'is-open' : ''}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile">
            <Link to="/job-seeker-info" onClick={() => setMenuOpen(false)}>For Job Seekers</Link>
            <Link to="/employer-info" onClick={() => setMenuOpen(false)}>For Employers</Link>
            <Link to="/recruiter-info" onClick={() => setMenuOpen(false)}>Recruiters</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link to="/jobs" onClick={() => setMenuOpen(false)}>Apply for Jobs</Link>
              <button onClick={() => { setMenuOpen(false); setShowRoleChooser(true); }} className="mobile-nav-cta">Get Started</button>
          </nav>
        )}
      </header>

      {/* Section 01: Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <svg className="eyebrow-spark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3C11.2 8.1 8.1 11.2 3 12C8.1 12.8 11.2 15.9 12 21C12.8 15.9 15.9 12.8 21 12C15.9 11.2 12.8 8.1 12 3Z" stroke="#F15A24" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="eyebrow-line1">Opportunities don't happen.</span>
              <span className="eyebrow-line2">We make them happen.</span>
              <svg className="eyebrow-underline" viewBox="0 0 60 16" fill="none" aria-hidden="true">
                <path className="sketch-line-ghost" d="M4 10.4C10 6.8 18 4.7 26 6.1C32 7.3 36 9.6 44 8.9C50 7.5 55 5 60 6.3" stroke="#F15A24" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <path className="sketch-line-main" d="M4 9.6C10 5.9 18 4 26 5.4C32 6.7 36 9 44 8.2C50 6.8 55 4.4 60 5.7" stroke="#F15A24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className="hero-title">
              <motion.span
                className="title-rojgaar"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                Rojgaar
              </motion.span>
              <motion.span
                className="title-hai"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                Hai!
              </motion.span>
            </h1>

            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              A better career. The right talent.<br />
              Real connections that build the future.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to="/register/job-seeker" className="btn btn-hero btn-primary">
                <svg className="btn-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>I am a Job Seeker</span>
                <svg className="btn-icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/register/employer" className="btn btn-hero btn-secondary">
                <svg className="btn-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <span>I am an Employer</span>
                <svg className="btn-icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Section 02: For Job Seekers */}
      <section className="job-seeker-section">
        <Reveal className="job-seeker-inner">
          <div className="job-seeker-content">
            <h2 className="job-seeker-heading">
              <span>For</span>
              <span>Job Seekers</span>
            </h2>

            <svg className="js-swoosh" viewBox="0 0 300 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                className="sketch-line-ghost"
                d="M6 13.3C38 5.6 88 2.4 146 6.2C184 8.6 220 11.6 253 8.3C270 6.7 281 7.3 293 10"
                stroke="#7655D9"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                className="sketch-line-main"
                d="M5 12.2C38 4.4 88 1.3 146 5.1C184 7.6 220 10.7 253 7.2C270 5.5 281 6.2 294 9"
                stroke="#7655D9"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <p className="job-seeker-description">
              Discover opportunities that<br />
              match your skills and ambition.
            </p>

            <Link to="/jobs" className="circle-cta circle-cta-purple">
              <span className="circle-cta-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="circle-cta-text">Explore Jobs</span>
            </Link>
          </div>

        </Reveal>
      </section>

      {/* Section 03: For Employers */}
      <section className="employer-section">
        <Reveal className="employer-inner">
          <div className="employer-content">
            <h2 className="employer-heading">
              <span>For</span>
              <span>Employers</span>
            </h2>

            <p className="employer-description">
              Find the right talent. Faster.<br />
              Smarter. Better.
            </p>

            <Link to="/register/employer" className="circle-cta circle-cta-green">
              <span className="circle-cta-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="circle-cta-text">Post a Job</span>
            </Link>
          </div>

          <div className="employer-visual" aria-hidden="true" />
        </Reveal>
      </section>

      {/* Section 04: How It Works */}
      <section className="how-it-works" aria-label="How It Works">
        <Reveal className="how-inner">
          <div className="how-heading">
            <h2>
              <span className="line-white">Simple Steps.</span>
              <span className="line-orange">Powerful Outcomes.</span>
            </h2>
          </div>

          <div className="process-timeline" role="list">
            <div className="process-step" role="listitem">
              <div className="step-icon-wrap icon-discover">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
              </div>
              <h3 className="step-title">Discover</h3>
              <p className="step-desc">Find the right match<br />for your career.</p>
            </div>

            <div className="process-step" role="listitem">
              <div className="step-icon-wrap icon-apply">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h10M7 13h7" /></svg>
              </div>
              <h3 className="step-title">Apply</h3>
              <p className="step-desc">Apply to jobs that<br />fit you best.</p>
            </div>

            <div className="process-step" role="listitem">
              <div className="step-icon-wrap icon-connect">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="10" r="3" /><circle cx="15" cy="10" r="3" /><path d="M12 6v3m0 2v3" /></svg>
              </div>
              <h3 className="step-title">Connect</h3>
              <p className="step-desc">Employers connect<br />with top talent.</p>
            </div>

            <div className="process-step" role="listitem">
              <div className="step-icon-wrap icon-grow">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2c2.5 1.5 4 4.5 4 8 0 2-.5 3.5-1.2 4.8H9.2C8.5 13.5 8 12 8 10c0-3.5 1.5-6.5 4-8z" />
                  <circle cx="12" cy="9" r="1.6" />
                  <path d="M9.2 14.8c-1.6.6-2.7 2-3.2 4 2-.3 3.4-1 4.3-2.2M14.8 14.8c1.6.6 2.7 2 3.2 4-2-.3-3.4-1-4.3-2.2" />
                  <path d="M10.5 19.5c0 1 .6 2 1.5 2.5.9-.5 1.5-1.5 1.5-2.5" />
                </svg>
              </div>
              <h3 className="step-title">Grow</h3>
              <p className="step-desc">Build your future.<br />Together.</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Section 05: Features */}
      <section className="features-section" aria-label="Features">
        <div className="features-background" aria-hidden="true" />
        <Reveal className="features-inner">
          <div className="features-heading">
            <h2>
              <span>All the right</span>
              <span>features. In all</span>
              <span>the <em className="accent-purple">right</em> ways.</span>
            </h2>
          </div>

          <div className="features-grid">
            <article className="feature-item">
              <div className="feature-tile tile-lavender">
                <svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <h3 className="feature-title">Smart Matching</h3>
              <p className="feature-desc">AI-powered matching for better connections.</p>
            </article>

            <article className="feature-item">
              <div className="feature-tile tile-mint">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
              </div>
              <h3 className="feature-title">Verified Employers</h3>
              <p className="feature-desc">Trusted companies. Genuine opportunities.</p>
            </article>

            <article className="feature-item">
              <div className="feature-tile tile-peach">
                <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              </div>
              <h3 className="feature-title">Career Insights</h3>
              <p className="feature-desc">Insights to help you grow and decide.</p>
            </article>

            <article className="feature-item">
              <div className="feature-tile tile-bluegrey">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
              </div>
              <h3 className="feature-title">Real-time Alerts</h3>
              <p className="feature-desc">Never miss an opportunity.</p>
            </article>
          </div>
        </Reveal>
      </section>

      {/* Section 06: Stats */}
      <section className="stats-section" aria-label="Stats">
        <Reveal className="stats-inner">
          <div className="stats-content">
            <h2 className="stats-heading">
              <span>Trusted by thousands.</span>
              <span>Growing every day.</span>
            </h2>

            <div className="stats-grid">
              <div className="stat-item">
                <strong className="stat-number"><AnimatedCounter value={50} suffix="K+" /></strong>
                <span className="stat-label-text">Job Seekers</span>
              </div>
              <div className="stat-item">
                <strong className="stat-number"><AnimatedCounter value={5} suffix="K+" /></strong>
                <span className="stat-label-text">Employers</span>
              </div>
              <div className="stat-item">
                <strong className="stat-number"><AnimatedCounter value={20} suffix="K+" /></strong>
                <span className="stat-label-text">Jobs Posted</span>
              </div>
              <div className="stat-item">
                <strong className="stat-number"><AnimatedCounter value={95} suffix="%" /></strong>
                <span className="stat-label-text">Satisfaction Rate</span>
              </div>
            </div>
          </div>

          <div className="stats-visual" aria-hidden="true" />
        </Reveal>
      </section>

      {/* Section 07: Testimonials */}
      <section className="testimonials-section" aria-label="Testimonials">
        <div className="testimonials-background" aria-hidden="true" />

        <Reveal className="testimonials-inner">
          <div className="featured-testimonial">
            <span className="quote-mark" aria-hidden="true">“</span>
            <p className="featured-quote">
              <span>Rojgaar Hai made</span>
              <span>
                my job search{' '}
                <em className="easier-highlight">
                  easier
                  <svg viewBox="0 0 108 30" fill="none" aria-hidden="true" preserveAspectRatio="none">
                    <path d="M7 18C9 8 29 5 55 6C84 7 101 12 99 19C97 27 67 30 38 28C16 27 5 24 7 16" stroke="#C8D94A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </em>
              </span>
              <span>and my career better.</span>
            </p>
            <div className="featured-author">
              <span className="author-name">— Neha Sharma</span>
              <span className="author-role">Product Designer</span>
            </div>
          </div>

          <div className="testimonial-carousel">
            {testimonialCards.map((card, i) => {
              const offset = (i - activeCard + 3) % 3;
              const posClass = offset === 0 ? 'card-center' : offset === 1 ? 'card-right' : 'card-left';
              return (
                <article
                  key={card.name}
                  className={`testimonial-card ${posClass}`}
                  onClick={() => setActiveCard(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Show testimonial from ${card.name}`}
                  aria-current={offset === 0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveCard(i);
                    }
                  }}
                >
                  <span className="card-quote" aria-hidden="true">“</span>
                  <p className="card-text">{card.text}</p>
                  <div className="card-author">
                    <span className="card-author-name">— {card.name}</span>
                    <span className="card-author-role">{card.role}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </Reveal>

        <div className="carousel-dots">
          {testimonialCards.map((card, i) => (
            <span
              key={card.name}
              className={i === activeCard ? 'dot-active' : ''}
              onClick={() => setActiveCard(i)}
              role="button"
              tabIndex={0}
              aria-label={`Show testimonial from ${card.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveCard(i);
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* Section 08: Final CTA and footer */}
      <section className="final-section" aria-label="Get started with Rojgaar Hai">
        <div className="final-cta">
          <div className="final-cta-background" aria-hidden="true" />

          <Reveal className="final-cta-inner">
            <div className="final-cta-content">
              <h2 className="final-cta-heading">
                <span>Your next opportunity</span>
                <span>is just a <em>click</em> away.</span>
              </h2>

              <p className="final-cta-description">
                Whether you're hiring or job hunting,<br />
                Rojgaar Hai is here to help you win.
              </p>

              <div className="final-cta-actions">
                <Link to="/register/job-seeker" className="btn btn-primary">I am a Job Seeker</Link>
                <Link to="/register/employer" className="btn btn-secondary">I am an Employer</Link>
              </div>
            </div>

            <div className="cta-visual" aria-hidden="true" />
          </Reveal>
        </div>

        <footer className="site-footer">
          <div className="footer-inner">
            <Link to="/" className="footer-brand" aria-label="Rojgaar Hai home">
              <img src="/assets/logo/forfooter_logo.png" alt="Rojgaar Hai" className="footer-brand-icon h-[52px] w-auto object-contain" />
            </Link>

            <nav className="footer-navigation" aria-label="Footer navigation">
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms</Link>
            </nav>

            <div className="footer-socials" aria-label="Social media">
              <a href="https://in.linkedin.com/in/team-rojgaarhai-ba080b427" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9v9M6 6.5v.01M10 18v-5a4 4 0 0 1 8 0v5M10 9v9" /></svg>
              </a>
              <a href="https://x.com/rojgaarhaiRH" target="_blank" rel="noopener noreferrer" aria-label="Twitter X">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
              </a>
              <a href="https://www.instagram.com/rojgaarhai.co" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.5" /><path d="M17.5 6.5h.01" /></svg>
              </a>
            </div>
          </div>
        </footer>
      </section>

      <RoleChooserModal isOpen={showRoleChooser} onClose={() => setShowRoleChooser(false)} mode="signup" />
    </>
  );
}

export default Landing;
