import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Users, Building2, ChevronDown, UserSearch, Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import RoleChooserModal from './RoleChooserModal';
import LanguageSwitcher from './LanguageSwitcher';
import { useAppTranslation } from '../hooks/useAppTranslation';

function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [isHeaderTransparent, setIsHeaderTransparent] = useState(false);
  const [showRoleChooser, setShowRoleChooser] = useState(false);
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState<Event | null>(null);
  const [showPwaInstructions, setShowPwaInstructions] = useState(false);
  const { t } = useAppTranslation();
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

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const handlePwaInstall = async () => {
    if (!pwaInstallPrompt) return;
    const promptEvent = pwaInstallPrompt as any;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setPwaInstallPrompt(null);
    }
  };

  const handleGetAppClick = async () => {
    if (pwaInstallPrompt) {
      await handlePwaInstall();
    } else if (isIos) {
      setShowPwaInstructions(true);
    } else {
      window.open(window.location.href, '_blank');
    }
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/jobs', label: t('nav.jobs') },
    { to: '/job-seeker-info', label: t('nav.forJobSeekers') },
    { to: '/employer-info', label: t('nav.forEmployers') },
    { to: '/recruiter-info', label: t('nav.recruiters') },
    { to: '/contact', label: t('nav.contact') },
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
              <img src="/assets/logo/RogjaarHaiLogo.png" alt="Rojgaar Hai" className="h-[72px] w-auto object-contain" loading="lazy" decoding="async" />
            </Link>

            {/* Right-grouped nav + actions (matches landing page .header-right) */}
            <div className="hidden md:flex items-center gap-4">
            {/* Desktop Nav Links */}
            <nav className="flex items-center gap-4" aria-label="Primary">
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
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <button
                  onClick={handleGetAppClick}
                  className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--navy)] text-white text-[13px] font-bold rounded-[999px] border-0 cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(16,26,54,0.18)] gap-2 flex-shrink-0"
                >
                  <Download size={16} /> Get App
                </button>
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
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowRoleChooser(true)} className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--orange)] text-white text-[13px] font-bold rounded-[999px] border-0 cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(241,90,36,0.22)]">
                  {t('nav.getStarted')}
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

            {/* Mobile-only language switcher + get app */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={handleGetAppClick}
                className="inline-flex items-center justify-center h-[36px] px-3 bg-[var(--navy)] text-white text-[11px] font-bold rounded-full border-0 cursor-pointer"
              >
                <Download size={14} /> Get App
              </button>
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
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <LanguageSwitcher />
                  </div>
                  <button
                    onClick={handleGetAppClick}
                    className="flex flex-col items-center justify-center gap-1 w-16 h-16 bg-[var(--navy)] text-white rounded-xl border-0 cursor-pointer"
                  >
                    <Download size={20} />
                    <span className="text-[10px] font-bold leading-none">Get App</span>
                  </button>
                </div>
                {!displayUser && (
                  <button
                    onClick={() => { setMobileOpen(false); setShowRoleChooser(true); }}
                    className="block w-full text-center px-4 py-2.5 bg-[var(--orange)] text-white text-sm font-bold rounded-full border-0 cursor-pointer"
                  >
                    {t('nav.getStarted')}
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

      {showPwaInstructions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setShowPwaInstructions(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-sm overflow-hidden z-10 animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--orange)] text-white flex items-center justify-center mx-auto mb-4">
                <Download size={28} />
              </div>
              <h3 className="text-lg font-extrabold text-[var(--navy)] mb-2">Install Rojgaar Hai</h3>
              <p className="text-sm text-[var(--charcoal)] mb-4">Add this app to your home screen for quick access, just like a native app.</p>
              <div className="bg-[var(--bg-warm)] rounded-xl p-4 text-left text-sm space-y-2 mb-5">
                <p className="font-bold text-[var(--navy)]">Steps to install:</p>
                <ol className="list-decimal list-inside space-y-1 text-[var(--charcoal)]">
                  <li>Tap the <strong>Share</strong> button <span className="inline-block w-5 h-5 bg-[var(--navy)] text-white text-[10px] leading-5 text-center rounded">⎋</span> in your browser toolbar.</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong>"Add"</strong> to confirm.</li>
                </ol>
              </div>
              <button onClick={() => setShowPwaInstructions(false)} className="w-full h-[44px] bg-[var(--navy)] text-white font-bold rounded-full">Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicLayout;
