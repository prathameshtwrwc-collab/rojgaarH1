import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, UserSearch, CheckCircle, XCircle, Download } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { updateRecruiterApproval } from '../../lib/supabase/data';
import { exportToCsv } from '../../lib/csvExport';

export default function Recruiters() {
  const { recruiters, candidates, refresh } = useDatabase();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const referredCount = (recruiterId: string) => candidates.filter((c: any) => c.referred_by_recruiter === recruiterId).length;

  const filtered = recruiters.filter((r: any) =>
    !search ||
    (r.profile_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.profile_phone || '').includes(search)
  );

  const handleToggleApproval = async (recruiter: any) => {
    setBusyId(recruiter.id);
    try {
      await updateRecruiterApproval(recruiter.id, !recruiter.is_approved, user?.id || null);
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleExportCsv = () => {
    exportToCsv('recruiters', filtered.map((r: any) => ({
      'Full Name': r.profile_name || '',
      Phone: r.profile_phone || '',
      'Referral Code': r.referral_code,
      Approved: r.is_approved,
      'Candidates Referred': referredCount(r.id),
      'Date Joined': r.created_at ? r.created_at.split('T')[0] : '',
      'Recruiter ID': r.id,
    })));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)]">Recruiters</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">{recruiters.length} total · {recruiters.filter((r: any) => !r.is_approved).length} awaiting approval</p>
        </div>
        <Button variant="outline" onClick={handleExportCsv} className="gap-1.5"><Download size={15} /> Download CSV</Button>
      </div>

      <Card className="!p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--charcoal)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none text-sm bg-white text-[var(--navy)] placeholder:text-slate-400"
          />
        </div>
      </Card>

      <Card padding={false}>
        <div className="overflow-x-auto">
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
              {filtered.map((r: any) => (
                <tr key={r.id} className="border-b border-slate-100/60 hover:bg-slate-100 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/recruiter/${r.id}`} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(118,85,217,0.1)', color: '#7655D9' }}>
                        <UserSearch size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--navy)] truncate hover:underline">{r.profile_name || 'Unnamed'}</p>
                        <p className="text-xs text-[var(--charcoal)]">{r.profile_phone}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] font-mono hidden sm:table-cell">{r.referral_code}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm font-bold text-[var(--orange)]">{referredCount(r.id)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.is_approved ? 'success' : 'warning'}>{r.is_approved ? 'Approved' : 'Pending'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm" variant={r.is_approved ? 'danger' : 'success'} disabled={busyId === r.id}
                        onClick={() => handleToggleApproval(r)} className="gap-1 text-xs"
                      >
                        {r.is_approved ? <><XCircle size={12} /> Suspend</> : <><CheckCircle size={12} /> Approve</>}
                      </Button>
                      <Link to={`/recruiter/${r.id}`}>
                        <Button size="sm" variant="ghost"><Eye size={16} /></Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[var(--charcoal)]"><UserSearch size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No recruiters found</p></div>
          )}
        </div>
      </Card>
    </div>
  );
}
