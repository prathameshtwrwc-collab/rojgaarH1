import { ReactNode, useState, useMemo, useEffect } from 'react';
import { lockBodyScroll } from '../lib/scrollLock';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, GitMerge, MessageSquare, Award, LogOut, Menu, X, Briefcase, UserSearch, FileText, Bell, ShieldCheck } from 'lucide-react';
import { MobileBottomNav, type BottomNavItem } from './MobileBottomNav';
import { useMountTransition } from '../hooks/useMountTransition';
import { useAdminNotifications } from '../lib/adminNotifications';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { TableSkeleton } from './Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarItems = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/admin/jobs', label: 'Jobs', icon: <Briefcase size={20} /> },
  { to: '/admin/candidates', label: 'Candidates', icon: <Users size={20} /> },
  { to: '/admin/employers', label: 'Employers', icon: <Building2 size={20} /> },
  { to: '/admin/recruiters', label: 'Recruiters', icon: <UserSearch size={20} /> },
  { to: '/admin/matching', label: 'Matching', icon: <GitMerge size={20} /> },
  { to: '/admin/communications', label: 'Communications', icon: <MessageSquare size={20} /> },
  { to: '/admin/placements', label: 'Placements', icon: <Award size={20} /> },
  { to: '/admin/cv-requests', label: 'CV Requests', icon: <FileText size={20} /> },
  { to: '/admin/permanent-requests', label: 'Permanent Requests', icon: <ShieldCheck size={20} /> },
  { to: '/admin/notifications', label: 'Notifications', icon: <Bell size={20} /> },
];

function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminLogout } = useData();
  const { logout: authLogout } = useAuth();
  const { loading: dataLoading, jobs, employers, cvRequests, cvSubmissions } = useDatabase();
  const { user: notifUser } = useAuth();
  const { unreadCount } = useAdminNotifications(notifUser?.id, useMemo(() => ({ jobs, employers, cvRequests, cvSubmissions }), [jobs, employers, cvRequests, cvSubmissions]));

  // Detail pages (/admin/jobs/123) keep their section highlighted
  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname === path || location.pathname.startsWith(`${path}/`);
  const currentSection = sidebarItems.find(item => isActive(item.to));
  const pageTitle = currentSection?.label || 'Admin';

  // The drawer: closes on navigation and on Escape, and holds the page still while open
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!sidebarOpen) return;
    const release = lockBodyScroll();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { release(); document.removeEventListener('keydown', onKey); };
  }, [sidebarOpen]);

  // Phone tab bar: the four busiest pages, plus "More" which opens the full menu.
  const { mounted: scrimMounted, state: scrimState } = useMountTransition(sidebarOpen, 220);
  const tabItems: BottomNavItem[] = [
    { key: '/admin', label: 'Home', icon: <LayoutDashboard size={22} />, onSelect: () => navigate('/admin') },
    { key: '/admin/jobs', label: 'Jobs', icon: <Briefcase size={22} />, onSelect: () => navigate('/admin/jobs') },
    { key: '/admin/candidates', label: 'Candidates', icon: <Users size={22} />, onSelect: () => navigate('/admin/candidates') },
    { key: '/admin/employers', label: 'Employers', icon: <Building2 size={22} />, onSelect: () => navigate('/admin/employers') },
    { key: 'more', label: 'More', icon: <Menu size={22} />, badge: unreadCount, onSelect: () => setSidebarOpen(true) },
  ];
  const tabKeys = tabItems.slice(0, 4).map(i => i.key);
  const activeTab = sidebarOpen ? 'more' : (tabKeys.find(k => isActive(k)) ?? 'more');

  const handleLogout = async () => {
    try {
      await authLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      adminLogout();
      navigate('/admin/login');
    }
  };

  return (
    <div className="has-bottom-nav-space min-h-screen flex text-[var(--navy)]" style={{ fontFamily: "var(--font)" }}>
      {/* Mobile overlay */}
      {scrimMounted && <div className="m-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" data-state={scrimState} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside
        aria-label="Admin sections"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[min(18rem,84vw)] lg:w-64 bg-[var(--navy)] text-white transform transition-transform duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black/40' : '-translate-x-full lg:translate-x-0'} flex flex-col pt-[env(safe-area-inset-top,0px)] lg:pt-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 bg-[var(--orange)] rounded-lg flex items-center justify-center shadow-md">
              <Briefcase size={18} className="text-white" />
            </div>
            <div>
              <span className="text-base font-bold leading-tight block text-white tracking-tight">ROJGAARHAI Admin</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close menu" className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3.5 py-4 space-y-0.5 overflow-y-auto overscroll-contain" data-lenis-prevent>
          {sidebarItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              aria-current={isActive(item.to) ? 'page' : undefined}
              className={`dash-sidebar__link min-h-[44px] lg:min-h-0 ${isActive(item.to) ? 'dash-sidebar__link--active' : ''}`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.to === '/admin/notifications' && unreadCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--orange)] text-white text-[11px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3.5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-white/10">
          <button onClick={handleLogout} className="dash-sidebar__link w-full">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-warm)]">
        {/* Top Bar */}
        <header className="dash-topbar sticky top-0 z-30 bg-[var(--bg-warm)]/95 backdrop-blur-[10px] border-b border-[rgba(16,26,54,0.06)] shadow-sm">
          <div className="dash-topbar__row flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" aria-expanded={sidebarOpen} className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-cream)] transition-colors">
                <Menu size={20} className="text-[var(--navy)]" />
              </button>
              <h1 className="text-lg font-bold text-[var(--navy)] hidden sm:block">Admin Control Center</h1>
              {/* Phones: the bar names the page you are on */}
              <h1 key={pageTitle} className="sm:hidden text-[17px] font-extrabold text-[var(--navy)] tracking-tight truncate max-w-[52vw] dash-enter">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/admin/notifications" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} className="relative p-2 rounded-xl hover:bg-[var(--bg-cream)] transition-colors">
                <Bell size={19} className="text-[var(--navy)]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--orange)] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--bg-warm)]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <div className="dash-avatar w-8 h-8 text-[13px]">A</div>
              <span className="text-sm font-semibold text-[var(--navy)] hidden sm:block">Administrator</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom,0px)+20px)] md:pb-6 overflow-y-auto" data-lenis-prevent>
          <AnimatePresence mode="wait">
            {dataLoading ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TableSkeleton rows={6} />
              </motion.div>
            ) : (
              <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <MobileBottomNav items={tabItems} activeKey={activeTab} />
    </div>
  );
}

export default AdminLayout;
