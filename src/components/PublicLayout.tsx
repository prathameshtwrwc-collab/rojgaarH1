import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Briefcase, Users, Building2, ChevronDown, LogOut, LayoutDashboard, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';

function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [isHeaderTransparent, setIsHeaderTransparent] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const updateHeader = () => {
      const atTop = window.scrollY === 0;
      setIsHeaderTransparent(location.pathname === '/employer-info' && atTop);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, [location.pathname]);

  const isEmployerInfo = location.pathname === '/employer-info';

  const {
    isCandidateLoggedIn, loggedCandidate, candidateLogout,
    isEmployerLoggedIn, loggedEmployer, employerLogout
  } = useData();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/job-seeker-info', label: 'For Job Seekers' },
    { to: '/employer-info', label: 'For Employers' },
    { to: '/contact', label: 'Contact' },
  ];

  const handleNavLinkClick = (to: string, e: React.MouseEvent) => {
    if (to.includes('#')) {
      const [path, hash] = to.split('#');
      if (location.pathname === path) {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-warm)]" style={{ fontFamily: "var(--font)" }}>
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 ${isHeaderTransparent ? 'header-transparent' : 'header-solid'}`}
      >
        <div className="landing-container">
          <div className="flex items-center justify-between h-[76px]">
            {/* Logo */}
            <Link to="/" className="flex items-center no-underline">
              <img src="/assets/logo/RogjaarHaiLogo.png" alt="Rojgaar Hai" className="h-[72px] w-auto object-contain" />
            </Link>

            {/* Right-grouped nav + actions (matches landing page .header-right) */}
            <div className="hidden md:flex items-center gap-[30px]">
            {/* Desktop Nav Links */}
            <nav className="flex items-center gap-[30px]" aria-label="Primary">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-[13.5px] font-semibold text-[var(--charcoal)] no-underline transition-colors duration-150 hover:text-[var(--navy)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="flex items-center gap-[10px]">
              {isCandidateLoggedIn && loggedCandidate ? (
                <div className="flex items-center gap-[10px]">
                  <Link to="/dashboard/candidate" className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--orange)] text-white text-[13px] font-bold rounded-[999px] no-underline transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(241,90,36,0.22)]">
                    {loggedCandidate.firstName}
                  </Link>
                  <button onClick={() => { candidateLogout(); navigate('/'); }} className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--navy)] text-white text-[13px] font-bold rounded-[999px] border-0 cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(16,26,54,0.18)]">
                    Sign Out
                  </button>
                </div>
              ) : isEmployerLoggedIn && loggedEmployer ? (
                <div className="flex items-center gap-[10px]">
                  <Link to="/dashboard/employer" className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--orange)] text-white text-[13px] font-bold rounded-[999px] no-underline transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(241,90,36,0.22)]">
                    {loggedEmployer.companyName}
                  </Link>
                  <button onClick={() => { employerLogout(); navigate('/'); }} className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--navy)] text-white text-[13px] font-bold rounded-[999px] border-0 cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(16,26,54,0.18)]">
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/register/job-seeker" className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--orange)] text-white text-[13px] font-bold rounded-[999px] no-underline transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(241,90,36,0.22)]">
                  Get Started
                </Link>
              )}

              {/* Portals Dropdown */}
              <div className="relative">
                <button onClick={() => setAdminDropdown(!adminDropdown)} className="text-[11px] font-medium text-[var(--charcoal)] hover:text-[var(--navy)] transition-colors flex items-center gap-[4px]">
                  Portals <ChevronDown size={12} />
                </button>
                {adminDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 w-48 z-50">
                    {!isCandidateLoggedIn && (
                      <Link to="/login/candidate" onClick={() => setAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <Users size={14} className="text-[var(--navy)]" /> Candidate Portal
                      </Link>
                    )}
                    {!isEmployerLoggedIn && (
                      <Link to="/login/employer" onClick={() => setAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <Building2 size={14} className="text-[var(--navy)]" /> Employer Portal
                      </Link>
                    )}
                    <hr className="my-1 border-slate-100" />
                    <Link to="/admin/login" onClick={() => setAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      Admin Dashboard
                    </Link>
                  </div>
                )}
              </div>
            </div>
            </div>

            {/* Mobile Menu Icon */}
            <div className="flex items-center gap-2 md:hidden">
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-[var(--bg-cream)] transition-colors">
                {mobileOpen ? <X size={24} className="text-[var(--navy)]" /> : <Menu size={24} className="text-[var(--navy)]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[rgba(16,26,54,0.06)] bg-[var(--bg-warm)]">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleNavLinkClick(link.to, e)}
                  className="block px-3 py-2.5 text-[15px] font-semibold text-[var(--navy)] no-underline transition-colors hover:bg-[var(--bg-cream)]"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-3 border-t border-[rgba(16,26,54,0.06)] space-y-2">
                {!isCandidateLoggedIn && (
                  <Link to="/register/job-seeker" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-[var(--orange)] border border-[var(--orange)] rounded-[999px] no-underline hover:bg-[rgba(241,90,36,0.08)]">
                    I'm a Job Seeker
                  </Link>
                )}
                {!isEmployerLoggedIn && (
                  <Link to="/register/employer" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-[var(--navy)] rounded-[999px] no-underline hover:bg-[#1a2540]">
                    I'm an Employer
                  </Link>
                )}
                {isCandidateLoggedIn && (
                  <button onClick={() => { candidateLogout(); setMobileOpen(false); navigate('/'); }} className="block w-full text-center px-4 py-2 text-xs text-red-600 font-semibold">
                    Sign Out
                  </button>
                )}
                {isEmployerLoggedIn && (
                  <button onClick={() => { employerLogout(); setMobileOpen(false); navigate('/'); }} className="block w-full text-center px-4 py-2 text-xs text-red-600 font-semibold">
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-[76px]">{children}</main>

      {/* Footer */}
      <footer className="bg-[#071A36] text-white">
        <div className="landing-container py-[22px]">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(150px,1fr)_auto_minmax(150px,1fr)] items-center gap-[32px]">
            <div className="justify-self-start">
              <Link to="/" className="flex items-center gap-[9px] no-underline text-white">
                <img src="/assets/logo/forfooter_logo.png" alt="Rojgaar Hai" className="h-[52px] w-auto object-contain" />
              </Link>
              <p className="text-[11px] text-[rgba(255,255,255,0.7)] mt-1 max-w-[200px]">Connecting skilled talent with opportunities across India.</p>
            </div>

            <nav className="flex items-center justify-center gap-[clamp(18px,2.2vw,28px)]" aria-label="Footer navigation">
              <Link to="/" className="text-[11.5px] font-medium text-[rgba(255,255,255,0.78)] no-underline transition-colors duration-150 hover:text-white">Home</Link>
              <Link to="/jobs" className="text-[11.5px] font-medium text-[rgba(255,255,255,0.78)] no-underline transition-colors duration-150 hover:text-white">Jobs</Link>
              <Link to="/contact" className="text-[11.5px] font-medium text-[rgba(255,255,255,0.78)] no-underline transition-colors duration-150 hover:text-white">Contact</Link>
              <Link to="/job-seeker-info" className="text-[11.5px] font-medium text-[rgba(255,255,255,0.78)] no-underline transition-colors duration-150 hover:text-white">About Us</Link>
            </nav>

            <div className="flex items-center justify-self-end gap-[20px]">
              <a href="#linkedin" aria-label="LinkedIn" className="text-[rgba(255,255,255,0.82)] no-underline transition-colors duration-150 hover:text-white hover:-translate-y-[1px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9v9M6 6.5v.01M10 18v-5a4 4 0 0 1 8 0v5M10 9v9"/></svg>
              </a>
              <a href="#twitter" aria-label="Twitter" className="text-[rgba(255,255,255,0.82)] no-underline transition-colors duration-150 hover:text-white hover:-translate-y-[1px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5l14 14M19 5L5 19"/></svg>
              </a>
              <a href="#instagram" aria-label="Instagram" className="text-[rgba(255,255,255,0.82)] no-underline transition-colors duration-150 hover:text-white hover:-translate-y-[1px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><path d="M17.5 6.5h.01"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
