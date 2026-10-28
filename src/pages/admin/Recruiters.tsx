import { useState } from 'react';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { Link } from 'react-router-dom';
import { Search, Eye, UserSearch, CheckCircle, XCircle, Download, X, Inbox, Copy, Check } from 'lucide-react';
import { Card, Badge, Button, Modal, Toast } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { updateRecruiterApproval } from '../../lib/supabase/data';
import { exportToCsv } from '../../lib/csvExport';

type StatusFilter = 'all' | 'pending' | 'approved';

export default function Recruiters() {
  const { recruiters, candidates, refresh } = useDatabase();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState<any | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const referredCount = (recruiterId: string) => candidates.filter((c: any) => c.referred_by_recruiter === recruiterId).length;
  const pendingCount = recruiters.filter((r: any) => !r.is_approved).length;

  const filtered = recruiters.filter((r: any) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      (r.profile_name || '').toLowerCase().includes(q) ||
      (r.referral_code || '').toLowerCase().includes(q) ||
      (r.profile_phone || '').replace(/\D/g, '').includes(q.replace(/\D/g, '') || '\u0000');
    const matchStatus = status === 'all' || (status === 'pending' ? !r.is_approved : r.is_approved);
    return matchSearch && matchStatus;
  });

  // Pending first so the people waiting on you are at the top
  const sorted = [...filtered].sort((a: any, b: any) => Number(a.is_approved) - Number(b.is_approved));
  const paging = usePagination(sorted, 10);

  const setApproval = async (recruiter: any, approve: boolean) => {
    setBusyId(recruiter.id);
    try {
      await updateRecruiterApproval(recruiter.id, approve, user?.id || null);
      await refresh({ silent: true });
      setToast(`${recruiter.profile_name || 'Recruiter'} ${approve ? 'approved' : 'suspended'}`);
    } catch (err) {
      setToast((err as { message?: string })?.message || 'Could not update this recruiter. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(c => (c === code ? null : c)), 1600);
    } catch { /* clipboard blocked */ }
  };

  const handleExportCsv = () => {
    exportToCsv('recruiters', sorted.map((r: any) => ({
      'Full Name': r.profile_name || '',
      Phone: r.profile_phone || '',
      'Referral Code': r.referral_code,
      Approved: r.is_approved,
      'Candidates Referred': referredCount(r.id),
      'Date Joined': r.created_at ? r.created_at.split('T')[0] : '',
      'Recruiter ID': r.id,
    })));
  };

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: recruiters.length },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'approved', label: 'Approved', count: recruiters.length - pendingCount },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="admin-page-title text-2xl font-bold text-[var(--navy)]">Recruiters</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">
            <span className="tabular-nums">{recruiters.length}</span> total
            {pendingCount > 0 && <> · <span className="font-bold text-amber-700 tabular-nums">{pendingCount}</span> awaiting approval</>}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={sorted.length === 0} className="gap-1.5 self-start sm:self-auto"><Download size={15} /> Download CSV</Button>
      </div>

      <Card className="!p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--charcoal)] pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, phone or referral code"
              aria-label="Search recruiters"
              className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none text-sm bg-white text-[var(--navy)] placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-[var(--navy)]">
                <X size={15} />
              </button>
            )}
          </div>
          <div className="ap-rail" role="group" aria-label="Filter by status">
            {tabs.map(t => (
              <button key={t.key} type="button" className="ap-chip" aria-pressed={status === t.key} onClick={() => setStatus(t.key)}>
                {t.label} <span className="tabular-nums opacity-60">{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card padding={false}>
        <div className="admin-table overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-[var(--bg-warm)]">
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Recruiter</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Referral Code</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Candidates</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paging.pageItems.map((r: any) => {
                const count = referredCount(r.id);
                return (
                  <tr key={r.id} className="border-b border-slate-100/60 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/recruiter/${r.id}`} className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(118,85,217,0.1)', color: '#7655D9' }}>
                          <UserSearch size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--navy)] truncate hover:underline">{r.profile_name || 'Unnamed'}</p>
                          <p className="text-xs text-[var(--charcoal)] truncate">
                            {r.profile_phone || 'No phone'}
                            <span className="md:hidden"> · {count} {count === 1 ? 'candidate' : 'candidates'}</span>
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {r.referral_code ? (
                        <button
                          type="button"
                          onClick={() => copyCode(r.referral_code)}
                          className="inline-flex items-center gap-1.5 text-sm text-[var(--charcoal)] font-mono hover:text-[var(--navy)] rounded-md px-1.5 py-0.5 -mx-1.5 hover:bg-slate-100"
                          title="Copy code"
                        >
                          {r.referral_code}
                          {copied === r.referral_code ? <Check size={13} className="text-[var(--green)]" /> : <Copy size={12} className="opacity-50" />}
                        </button>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm font-bold text-[var(--orange)] tabular-nums">{count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={r.is_approved ? 'success' : 'warning'}>{r.is_approved ? 'Approved' : 'Pending'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {r.is_approved ? (
                          <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => setConfirmSuspend(r)} className="gap-1 text-xs text-red-600 hover:text-red-700">
                            <XCircle size={13} /> Suspend
                          </Button>
                        ) : (
                          <Button size="sm" variant="success" loading={busyId === r.id} disabled={busyId === r.id} onClick={() => setApproval(r, true)} className="gap-1 text-xs">
                            {busyId !== r.id && <CheckCircle size={13} />} Approve
                          </Button>
                        )}
                        <Link
                          to={`/recruiter/${r.id}`}
                          aria-label={`Open ${r.profile_name || 'recruiter'}`}
                          className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-[var(--charcoal)] hover:bg-slate-100 hover:text-[var(--navy)]"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {paging.total === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<Inbox size={20} />}
                title={recruiters.length === 0 ? 'No recruiters yet' : 'No recruiters match'}
                body={recruiters.length === 0 ? 'Recruiters appear here when they sign up.' : 'Try a different search or status.'}
                action={search || status !== 'all' ? <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatus('all'); }}>Clear filters</Button> : undefined}
              />
            </div>
          ) : (
            <Pagination page={paging.page} pageSize={paging.pageSize} total={paging.total} onPageChange={paging.setPage} label="recruiters" />
          )}
        </div>
      </Card>

      <Modal
        isOpen={Boolean(confirmSuspend)}
        onClose={() => setConfirmSuspend(null)}
        title="Suspend this recruiter?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmSuspend(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => { const r = confirmSuspend; setConfirmSuspend(null); setApproval(r, false); }}>Suspend</Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--charcoal)]">
          <strong className="text-[var(--navy)]">{confirmSuspend?.profile_name || 'This recruiter'}</strong> will lose access to their dashboard until you approve them again. Candidates they already referred stay as they are.
        </p>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
