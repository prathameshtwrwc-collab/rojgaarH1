import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Building2, Menu, LayoutDashboard, UserPlus } from 'lucide-react';
import { MobileBottomNav, type BottomNavItem } from './MobileBottomNav';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

/** The public tab bar only appears on the jobs list; every other public page (and a single job's sticky Apply bar) goes without. */
export function hidesPublicTabs(pathname: string) {
  return pathname.replace(/\/+$/, '') !== '/jobs';
}

/**
 * Phone tab bar for the public site (landing, jobs, info pages). It adapts to who is looking:
 * visitors get a "Get Started" call to action, signed-in people get a shortcut to their own dashboard.
 */
export default function PublicMobileTabs({
  menuOpen,
  onMenu,
  onGetStarted,
}: {
  menuOpen: boolean;
  onMenu: () => void;
  onGetStarted: () => void;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isCandidateLoggedIn, isEmployerLoggedIn } = useData();

  if (hidesPublicTabs(pathname)) return null;

  const role = user?.role || (isCandidateLoggedIn ? 'candidate' : isEmployerLoggedIn ? 'employer' : null);
  const dashboardPath =
    role === 'employer' ? '/dashboard/employer' : role === 'recruiter' ? '/dashboard/recruiter' : role === 'superadmin' ? '/admin' : '/dashboard/candidate';

  const home: BottomNavItem = { key: 'home', label: 'Home', icon: <Home size={22} />, onSelect: () => navigate('/') };
  const jobs: BottomNavItem = { key: 'jobs', label: 'Jobs', icon: <Search size={22} />, onSelect: () => navigate('/jobs') };
  const menu: BottomNavItem = { key: 'menu', label: 'Menu', icon: <Menu size={22} />, onSelect: onMenu };

  const items: BottomNavItem[] = role
    ? [home, jobs, { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} />, onSelect: () => navigate(dashboardPath) }, menu]
    : [
        home,
        jobs,
        { key: 'start', label: 'Get Started', icon: <UserPlus size={22} />, accent: true, onSelect: onGetStarted },
        { key: 'hire', label: 'Hire', icon: <Building2 size={22} />, onSelect: () => navigate('/employer-info') },
        menu,
      ];

  const activeKey = menuOpen
    ? 'menu'
    : pathname === '/'
    ? 'home'
    : pathname.startsWith('/jobs')
    ? 'jobs'
    : pathname === '/employer-info'
    ? 'hire'
    : null;

  return <MobileBottomNav items={items} activeKey={activeKey} />;
}
