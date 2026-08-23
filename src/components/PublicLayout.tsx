import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Users, Building2, ChevronDown, UserSearch } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import RoleChooserModal from './RoleChooserModal';

function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [isHeaderTransparent, setIsHeaderTransparent] = useState(false);
  const [showRoleChooser, setShowRoleChooser] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const {
    isCandidateLoggedIn, loggedCandidate, candidateLogout,
    isEmployerLoggedIn, loggedEmployer, employerLogout
  } = useData();

  const { user, logout: authLogout } = useAuth();

  const handleLogout = async () => {
    try {
      await authLogout();
      candidateLogout();
      employerLogout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    const updateHeader = () => {
      const atTop = window.scrollY === 0;
      setIsHeaderTransparent(location.pathname === '/employer-info' && atTop);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/job-seeker-info', label: 'For Job Seekers' },
    { to: '/employer-info', label: 'For Employers' },
    { to: '/recruiter-info', label: 'Recruiters' },
    { to: '/contact', label: 'Contact' },
  ];

  const displayUser = user || (isCandidateLoggedIn ? { role: 'candidate', fullName: loggedCandidate?.firstName } : null) || (isEmployerLoggedIn ? { role: 'employer', fullName: loggedEmployer?.companyName } : null);
  const userRole = user?.role || (isCandidateLoggedIn ? 'candidate' : isEmployerLoggedIn ? 'employer' : null);

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
              {displayUser && userRole ? (
                <div className="flex items-center gap-[10px]">
                  {userRole === 'candidate' && (
                    <Link to="/dashboard/candidate" className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--orange)] text-white text-[13px] font-bold rounded-[999px] no-underline transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(241,90,36,0.22)]">
                      {user?.fullName || loggedCandidate?.firstName || 'Candidate'}
                    </Link>
                  )}
                  {userRole === 'employer' && (
                    <Link to="/dashboard/employer" className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--orange)] text-white text-[13px] font-bold rounded-[999px] no-underline transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(241,90,36,0.22)]">
                      {user?.fullName || loggedEmployer?.companyName || 'Employer'}
                    </Link>
                  )}
                  {userRole === 'recruiter' && (
                    <Link to="/dashboard/recruiter" className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--orange)] text-white text-[13px] font-bold rounded-[999px] no-underline transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(241,90,36,0.22)]">
                      {user?.fullName || 'Recruiter'}
                    </Link>
                  )}
                  {userRole === 'superadmin' && (
                    <Link to="/admin" className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--orange)] text-white text-[13px] font-bold rounded-[999px] no-underline transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(241,90,36,0.22)]">
                      Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--navy)] text-white text-[13px] font-bold rounded-[999px] border-0 cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(16,26,54,0.18)]">
                    Sign Out
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowRoleChooser(true)} className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--orange)] text-white text-[13px] font-bold rounded-[999px] border-0 cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(241,90,36,0.22)]">
                  Get Started
                </button>
              )}

              {/* Portals Dropdown */}
              <div className="relative">
                <button onClick={() => setAdminDropdown(!adminDropdown)} className="text-[11px] font-medium text-[var(--charcoal)] hover:text-[var(--navy)] transition-colors flex items-center gap-[4px]">
                  Portals <ChevronDown size={12} />
                </button>
                {adminDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 w-48 z-50">
                    {!isCandidateLoggedIn && !user && (
                      <Link to="/login/candidate" onClick={() => setAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <Users size={14} className="text-[var(--navy)]" /> Candidate Portal
                      </Link>
                    )}
                    {!isEmployerLoggedIn && !user && (
                      <Link to="/login/employer" onClick={() => setAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <Building2 size={14} className="text-[var(--navy)]" /> Employer Portal
                      </Link>
                    )}
                    {!user && (
                      <Link to="/login/recruiter" onClick={() => setAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <UserSearch size={14} className="text-[var(--navy)]" /> Recruiter Portal
                      </Link>
                    )}
                    {!user && (
                      <Link to="/admin/login" onClick={() => setAdminDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <Building2 size={14} className="text-[var(--navy)]" /> Admin Portal
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-[40px] h-[40px] flex items-center justify-center bg-transparent border-0 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} className="text-[var(--navy)]" /> : <Menu size={24} className="text-[var(--navy)]" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileOpen && (
            <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-[15px] font-semibold text-[var(--navy)] no-underline"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                {!displayUser && (
                  <button
                    onClick={() => { setMobileOpen(false); setShowRoleChooser(true); }}
                    className="block w-full text-center px-4 py-2.5 bg-[var(--orange)] text-white text-sm font-bold rounded-full border-0 cursor-pointer"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-[76px]">
        {children}
      </main>

      <RoleChooserModal isOpen={showRoleChooser} onClose={() => setShowRoleChooser(false)} mode="signup" />
    </div>
  );
}

export default PublicLayout;
