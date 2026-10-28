import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Users, Building2, ChevronDown, ChevronRight, UserSearch, Download, LayoutDashboard, LogOut, LogIn, MoreVertical } from 'lucide-react';
import { useMountTransition } from '../hooks/useMountTransition';
import { haptic } from '../lib/haptics';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import RoleChooserModal from './RoleChooserModal';
import PublicMobileTabs, { hidesPublicTabs } from './PublicMobileTabs';
import LanguageSwitcher from './LanguageSwitcher';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { onPwaInstallAvailabilityChange, promptPwaInstall, isPwaInstalled } from '../lib/pwaInstall';

function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [isHeaderTransparent, setIsHeaderTransparent] = useState(false);
  const [showRoleChooser, setShowRoleChooser] = useState(false);
  const [roleChooserMode, setRoleChooserMode] = useState<'signup' | 'login'>('signup');
  const openRoleChooser = (mode: 'signup' | 'login') => { setRoleChooserMode(mode); setShowRoleChooser(true); };
  const portalsRef = useRef<HTMLDivElement>(null);
  const [pwaInstallAvailable, setPwaInstallAvailable] = useState(false);
  const [showPwaInstructions, setShowPwaInstructions] = useState(false);
  const { t } = useAppTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { mounted: menuMounted, state: menuState } = useMountTransition(mobileOpen, 200);

  // The menu always closes when you land on a new page
  useEffect(() => { setMobileOpen(false); setAdminDropdown(false); }, [location.pathname]);

  // Escape closes the phone menu, the Portals dropdown and the install help
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMobileOpen(false);
      setAdminDropdown(false);
      setShowPwaInstructions(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // A click anywhere outside the Portals dropdown closes it
  useEffect(() => {
    if (!adminDropdown) return;
    const onDown = (e: PointerEvent) => {
      if (portalsRef.current && !portalsRef.current.contains(e.target as Node)) setAdminDropdown(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [adminDropdown]);

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

  // The install offer is captured once at startup (lib/pwaInstall), so a late-loading page never misses it
  useEffect(() => onPwaInstallAvailabilityChange(setPwaInstallAvailable), []);

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  // Already running as the installed app: no point offering to install it
  const isInstalled = isPwaInstalled();

  const handleGetAppClick = async () => {
    haptic('tap');
    if (pwaInstallAvailable) {
      await promptPwaInstall();
    } else {
      // No install prompt from the browser (iPhone, or Chrome that has not offered it yet): show the steps
      setShowPwaInstructions(true);
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
  const dashboardPath = userRole === 'employer' ? '/dashboard/employer' : userRole === 'recruiter' ? '/dashboard/recruiter' : userRole === 'superadmin' ? '/admin' : '/dashboard/candidate';
  const isSignedIn = Boolean(displayUser && userRole);

  return (
    <div className={`${hidesPublicTabs(location.pathname) ? '' : 'has-bottom-nav '}min-h-screen flex flex-col bg-[var(--bg-warm)]`} style={{ fontFamily: "var(--font)" }}>
      {/* Header */}
      <header
        className={`public-header fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top,0px)] ${isHeaderTransparent ? 'header-transparent' : 'header-solid'}`}
      >
        <div className="landing-container">
          <div className="flex items-center justify-between h-[76px]">
            {/* Logo */}
            <Link to="/" className="flex items-center no-underline">
              <img src="/assets/logo/RogjaarHaiLogo.png" alt="Rojgaar Hai" className="h-[72px] w-auto object-contain" decoding="async" fetchPriority="high" />
            </Link>

            {/* Right-grouped nav + actions (matches landing page .header-right) */}
            <div className="hidden md:flex items-center gap-4">
            {/* Desktop Nav Links */}
            <nav className="flex items-center gap-4" aria-label="Primary">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={location.pathname === link.to ? 'page' : undefined}
                  className={`nav-link-underline relative text-[13.5px] font-semibold no-underline transition-colors duration-150 hover:text-[var(--navy)] ${location.pathname === link.to || (link.to === '/jobs' && location.pathname.startsWith('/jobs/')) ? 'text-[var(--navy)] is-active' : 'text-[var(--charcoal)]'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

              {/* Desktop Actions */}
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                {!isInstalled && (
                  <button
                    type="button"
                    onClick={handleGetAppClick}
                    className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--navy)] text-white text-[13px] font-bold rounded-[999px] border-0 cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(16,26,54,0.18)] gap-2 flex-shrink-0"
                  >
                    <Download size={16} /> Get App
                  </button>
                )}
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
                <button type="button" onClick={() => openRoleChooser('signup')} className="inline-flex items-center justify-center h-[40px] px-[18px] bg-[var(--orange)] text-white text-[13px] font-bold rounded-[999px] border-0 cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(241,90,36,0.22)]">
                  {t('nav.getStarted')}
                </button>
              )}

              {/* Portals Dropdown */}
              <div className="relative" ref={portalsRef}>
                <button
                  type="button"
                  onClick={() => setAdminDropdown(!adminDropdown)}
                  aria-expanded={adminDropdown}
                  aria-haspopup="menu"
                  className="h-9 px-1 text-[11px] font-medium text-[var(--charcoal)] hover:text-[var(--navy)] transition-colors flex items-center gap-[4px]"
                >
                  Portals <ChevronDown size={12} className={`transition-transform duration-200 ${adminDropdown ? 'rotate-180' : ''}`} />
                </button>
                {adminDropdown && (
                  <div role="menu" className="ecm-pop absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 w-52 z-50">
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

            {/* Mobile-only: language, then My Dashboard when signed in (otherwise Get App) */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher />
              {isSignedIn ? (
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center justify-center h-[36px] px-3 bg-[var(--orange)] text-white text-[11px] font-bold rounded-full no-underline whitespace-nowrap active:scale-95 transition-transform"
                >
                  My Dashboard
                </Link>
              ) : !isInstalled ? (
                <button
                  type="button"
                  onClick={handleGetAppClick}
                  className="inline-flex items-center justify-center gap-1 h-[36px] px-3 bg-[var(--navy)] text-white text-[11px] font-bold rounded-full border-0 cursor-pointer active:scale-95 transition-transform"
                >
                  <Download size={14} /> Get App
                </button>
              ) : null}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => { haptic('tap'); setMobileOpen(!mobileOpen); }}
              className="md:hidden relative w-[44px] h-[44px] flex items-center justify-center bg-transparent border-0 cursor-pointer rounded-full active:bg-slate-100"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {/* The two icons cross-fade and turn, instead of swapping abruptly */}
              <Menu size={24} className={`absolute text-[var(--navy)] transition-all duration-300 ${mobileOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
              <X size={24} className={`absolute text-[var(--navy)] transition-all duration-300 ${mobileOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
            </button>
          </div>

          {/* Mobile Nav */}
          {menuMounted && (
            <>
            <div
              // The header has a backdrop-filter, which makes it the containing block for "fixed" children,
              // so this scrim is absolutely positioned from the header and simply made taller than the screen.
              className="m-backdrop md:hidden absolute inset-x-0 top-full h-[100dvh] bg-slate-950/45"
              data-state={menuState}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="m-menu md:hidden relative bg-white border-t border-slate-100 px-4 pt-1 pb-4 rounded-b-3xl shadow-[0_24px_40px_-16px_rgba(16,26,54,0.3)]" data-state={menuState}>
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`m-menu__item flex items-center justify-between min-h-[52px] border-b border-slate-100 text-[16px] font-semibold no-underline active:bg-slate-50 ${location.pathname === link.to ? 'text-[var(--orange)]' : 'text-[var(--navy)]'}`}
                >
                  {link.label}
                  <ChevronRight size={18} className="text-slate-300" />
                </Link>
              ))}
              <div className="m-menu__item mt-3 pt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <LanguageSwitcher />
                  </div>
                  {!isInstalled && (
                    <button
                      type="button"
                      onClick={handleGetAppClick}
                      className="flex flex-col items-center justify-center gap-1 w-16 h-16 bg-[var(--navy)] text-white rounded-xl border-0 cursor-pointer active:scale-95 transition-transform"
                    >
                      <Download size={20} />
                      <span className="text-[10px] font-bold leading-none">Get App</span>
                    </button>
                  )}
                </div>
                {isSignedIn ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={dashboardPath}
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center justify-center gap-2 h-12 bg-[var(--orange)] text-white text-sm font-bold rounded-full no-underline active:scale-[0.97] transition-transform"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setMobileOpen(false); handleLogout(); }}
                      className="inline-flex items-center justify-center gap-2 h-12 border border-slate-300 text-[var(--navy)] text-sm font-bold rounded-full bg-white active:scale-[0.97] transition-transform"
                    >
                      <LogOut size={16} /> {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setMobileOpen(false); openRoleChooser('login'); }}
                      className="inline-flex items-center justify-center gap-2 h-12 border border-slate-300 text-[var(--navy)] text-sm font-bold rounded-full bg-white active:scale-[0.97] transition-transform"
                    >
                      <LogIn size={16} /> Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMobileOpen(false); openRoleChooser('signup'); }}
                      className="inline-flex items-center justify-center h-12 bg-[var(--orange)] text-white text-sm font-bold rounded-full border-0 cursor-pointer active:scale-[0.97] transition-transform"
                    >
                      {t('nav.getStarted')}
                    </button>
                  </div>
                )}
              </div>
            </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-[calc(76px+env(safe-area-inset-top,0px))]">
        {children}
      </main>

      <PublicMobileTabs menuOpen={mobileOpen} onMenu={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileOpen(o => !o); }} onGetStarted={() => openRoleChooser('signup')} />

      <RoleChooserModal isOpen={showRoleChooser} onClose={() => setShowRoleChooser(false)} mode={roleChooserMode} />

      {showPwaInstructions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setShowPwaInstructions(false)} />
          <div role="dialog" aria-modal="true" aria-label="Install Rojgaar Hai" className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-sm overflow-hidden z-10" style={{ animation: 'ap-scale-in 320ms var(--ease-out-expo) both' }}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--orange)] text-white flex items-center justify-center mx-auto mb-4">
                <Download size={28} />
              </div>
              <h3 className="text-lg font-extrabold text-[var(--navy)] mb-2">Install Rojgaar Hai</h3>
              <p className="text-sm text-[var(--charcoal)] mb-4">Add this app to your home screen for quick access, just like a native app.</p>
              <div className="bg-[var(--bg-warm)] rounded-xl p-4 text-left text-sm space-y-2 mb-5">
                <p className="font-bold text-[var(--navy)]">Steps to install:</p>
                {isIos ? (
                  <ol className="list-decimal list-inside space-y-1 text-[var(--charcoal)]">
                    <li>Tap the <strong>Share</strong> button <span className="inline-block w-5 h-5 bg-[var(--navy)] text-white text-[10px] leading-5 text-center rounded">⎋</span> in Safari.</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                    <li>Tap <strong>"Add"</strong> to confirm.</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-1 text-[var(--charcoal)]">
                    <li>Open the browser menu <MoreVertical size={14} className="inline -mt-0.5" /> (top right in Chrome).</li>
                    <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                    <li>Tap <strong>"Install"</strong> to confirm.</li>
                  </ol>
                )}
              </div>
              <button type="button" autoFocus onClick={() => setShowPwaInstructions(false)} className="w-full h-[44px] bg-[var(--navy)] text-white font-bold rounded-full active:scale-[0.98] transition-transform">Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicLayout;
