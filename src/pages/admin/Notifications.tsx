import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Briefcase, CreditCard, FileText, Eye, CheckCheck, Circle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { useAdminNotifications, isNewNotification, AdminNotification } from '../../lib/adminNotifications';
import { AdminToolbar, SegmentedTabs } from '../../components/AdminToolbar';
import { Button } from '../../components/ui';

type Filter = 'all' | 'unread' | 'job' | 'payment' | 'cv';

const KIND_META = {
  job: { label: 'Job', icon: Briefcase, cls: 'dash-status--accent' },
  payment: { label: 'Payment', icon: CreditCard, cls: 'dash-status--warning' },
  cv: { label: 'CV Request', icon: FileText, cls: 'dash-status--neutral' },
} as const;

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

export default function Notifications() {
  const { jobs, employers, cvRequests, loading } = useDatabase();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const source = useMemo(() => ({ jobs, employers, cvRequests }), [jobs, employers, cvRequests]);
  const { items, isRead, markRead, markUnread, markAllRead, unreadCount } = useAdminNotifications(user?.id, source);

  const filtered = items.filter(n => {
    if (filter === 'unread' && isRead(n.id)) return false;
    if (filter === 'job' && n.kind !== 'job') return false;
    if (filter === 'payment' && n.kind !== 'payment') return false;
    if (filter === 'cv' && n.kind !== 'cv') return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!`${n.title} ${n.body}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const newItems = filtered.filter(isNewNotification);
  const earlier = filtered.filter(n => !isNewNotification(n));

  const counts = {
    all: items.length,
    unread: unreadCount,
    job: items.filter(n => n.kind === 'job').length,
    payment: items.filter(n => n.kind === 'payment').length,
    cv: items.filter(n => n.kind === 'cv').length,
  };

  const openDetail = (n: AdminNotification) => {
    markRead(n.id);
    navigate(n.link);
  };

  const renderItem = (n: AdminNotification) => {
    const meta = KIND_META[n.kind];
    const Icon = meta.icon;
    const read = isRead(n.id);
    return (
      <div
        key={n.id}
        className={`group flex items-start gap-3.5 px-4 sm:px-5 py-4 transition-colors ${read ? 'bg-white' : 'bg-[var(--orange)]/[0.04]'} hover:bg-[var(--bg-warm)]`}
      >
        <div className="relative flex-shrink-0 mt-0.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-warm)] border border-[#E7E2D9] flex items-center justify-center text-[var(--navy)]">
            <Icon size={18} />
          </div>
          {!read && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--orange)] ring-2 ring-white" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className={`text-sm truncate ${read ? 'font-semibold text-[var(--charcoal)]' : 'font-bold text-[var(--navy)]'}`}>{n.title}</p>
            <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0">{timeAgo(n.createdAt)}</span>
          </div>
          <p className="text-xs text-[var(--charcoal)] mt-0.5 truncate">{n.body}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`dash-status ${meta.cls}`}>{meta.label}</span>
            {!read && <span className="dash-status dash-status--accent">Unread</span>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => (read ? markUnread(n.id) : markRead(n.id))}
            title={read ? 'Mark as unread' : 'Mark as read'}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[var(--navy)] hover:bg-slate-100"
          >
            {read ? <Circle size={15} /> : <CheckCircle2 size={15} />}
          </button>
          <Button size="sm" variant="outline" onClick={() => openDetail(n)} className="h-8 gap-1 text-xs">
            <Eye size={13} /> View more
          </Button>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, subtitle: string, list: AdminNotification[]) => {
    if (list.length === 0) return null;
    return (
      <section>
        <div className="flex items-center justify-between px-1 mb-2">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--navy)]">{title}</h3>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
          <span className="text-[11px] font-bold text-[var(--charcoal)]">{list.length}</span>
        </div>
        <div className="dash-surface overflow-hidden divide-y divide-[#EFEAE1]">{list.map(renderItem)}</div>
      </section>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)] flex items-center gap-2">
            <Bell size={22} className="text-[var(--orange)]" /> Notifications
          </h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">
            New jobs, payment submissions and CV requests from the last 30 days.
          </p>
        </div>
        <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0} className="gap-1.5 h-11">
          <CheckCheck size={15} /> Mark all as read
        </Button>
      </div>

      <AdminToolbar>
        <div className="relative w-full lg:max-w-md">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notifications…"
            className="w-full h-11 px-4 rounded-xl border border-[#D8D2C6] bg-white text-sm text-[var(--navy)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/40 focus:border-[var(--orange)]"
          />
        </div>
        <SegmentedTabs
          value={filter}
          onChange={v => setFilter(v as Filter)}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'unread', label: 'Unread', count: counts.unread },
            { value: 'job', label: 'Jobs', count: counts.job },
            { value: 'payment', label: 'Payments', count: counts.payment },
            { value: 'cv', label: 'CV Requests', count: counts.cv },
          ]}
        />
      </AdminToolbar>

      {loading ? (
        <div className="dash-surface p-10 text-center text-sm text-[var(--charcoal)]">Loading notifications…</div>
      ) : filtered.length === 0 ? (
        <div className="dash-surface p-12 text-center">
          <Bell size={40} className="mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-bold text-[var(--navy)]">You're all caught up</h3>
          <p className="text-sm text-[var(--charcoal)] mt-1">
            {query || filter !== 'all' ? 'No notifications match these filters.' : 'New job postings, payments and CV requests will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {renderSection('New', 'Last 24 hours', newItems)}
          {renderSection('Earlier', 'Older than 24 hours', earlier)}
        </div>
      )}

      <p className="text-[11px] text-slate-400 flex items-center gap-1">
        <ChevronRight size={11} /> Read status is saved on this device. Opening “View more” marks an item as read.
      </p>
    </div>
  );
}
