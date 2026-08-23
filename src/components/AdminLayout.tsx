import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, GitMerge, MessageSquare, Award, LogOut, Menu, X, Briefcase, UserSearch } from 'lucide-react';
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
];

function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminLogout } = useData();
  const { logout: authLogout } = useAuth();
  const { loading: dataLoading } = useDatabase();

  const isActive = (path: string) => location.pathname === path;

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
    <div className="min-h-screen flex text-[var(--navy)]" style={{ fontFamily: "var(--font)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[var(--navy)] text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
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
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3.5 py-4 space-y-0.5 overflow-y-auto" data-lenis-prevent>
          {sidebarItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`dash-sidebar__link ${isActive(item.to) ? 'dash-sidebar__link--active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3.5 py-4 border-t border-white/10">
          <button onClick={handleLogout} className="dash-sidebar__link w-full">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-warm)]">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[var(--bg-warm)]/95 backdrop-blur-[10px] border-b border-[rgba(16,26,54,0.06)] shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-cream)] transition-colors">
                <Menu size={20} className="text-[var(--navy)]" />
              </button>
              <h1 className="text-lg font-bold text-[var(--navy)] hidden sm:block">Admin Control Center</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="dash-avatar w-8 h-8 text-[13px]">A</div>
              <span className="text-sm font-semibold text-[var(--navy)] hidden sm:block">Administrator</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto" data-lenis-prevent>
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
    </div>
  );
}

export default AdminLayout;
