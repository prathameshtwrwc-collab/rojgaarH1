import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserSearch, Users, CheckCircle, XCircle } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { getRecruiterByUserId, getCandidatesReferredByRecruiter, updateRecruiterApproval } from '../../lib/supabase/data';

export default function RecruiterDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [recruiter, setRecruiter] = useState<any | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [r, c] = await Promise.all([getRecruiterByUserId(id), getCandidatesReferredByRecruiter(id)]);
    setRecruiter(r);
    setCandidates(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleToggleApproval = async () => {
    if (!recruiter) return;
    setBusy(true);
    try {
      await updateRecruiterApproval(recruiter.id, !recruiter.is_approved, user?.id || null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-[var(--charcoal)]">Loading recruiter...</div>;

  if (!recruiter) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--charcoal)]">Recruiter not found.</p>
        <Link to="/admin/recruiters" className="text-[var(--orange)] font-semibold text-sm mt-2 inline-block">Back to Recruiters</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/recruiters" className="inline-flex items-center gap-1 text-sm text-[var(--charcoal)] hover:text-[var(--navy)]">
        <ArrowLeft size={16} /> Back to Recruiters
      </Link>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: 'rgba(118,85,217,0.1)', color: '#7655D9' }}>
              <UserSearch size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--navy)]">{recruiter.full_name || 'Unnamed Recruiter'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={recruiter.is_approved ? 'success' : 'warning'}>{recruiter.is_approved ? 'Approved' : 'Pending Approval'}</Badge>
                <span className="text-xs text-[var(--charcoal)] font-mono">{recruiter.referral_code}</span>
              </div>
            </div>
          </div>
          <Button variant={recruiter.is_approved ? 'danger' : 'success'} disabled={busy} onClick={handleToggleApproval} className="gap-1.5">
            {recruiter.is_approved ? <><XCircle size={16} /> Suspend</> : <><CheckCircle size={16} /> Approve</>}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          <div><p className="text-xs text-[var(--charcoal)] font-medium">Phone</p><p className="text-sm font-semibold text-[var(--navy)]">{recruiter.phone || '—'}</p></div>
          <div><p className="text-xs text-[var(--charcoal)] font-medium">Candidates Referred</p><p className="text-sm font-semibold text-[var(--navy)]">{candidates.length}</p></div>
          <div><p className="text-xs text-[var(--charcoal)] font-medium">Joined</p><p className="text-sm font-semibold text-[var(--navy)]">{recruiter.created_at ? new Date(recruiter.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p></div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-[var(--navy)] mb-3 flex items-center gap-2">
          <Users size={18} className="text-[var(--orange)]" /> Candidates Referred by This Recruiter ({candidates.length})
        </h3>
        <div className="divide-y divide-slate-100">
          {candidates.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="font-semibold text-sm text-[var(--navy)]">{c.profile_name || 'Unnamed candidate'}</p>
                <p className="text-xs text-[var(--charcoal)]">{c.profile_phone} · Registered {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <Badge variant="info">{c.status}</Badge>
            </div>
          ))}
          {candidates.length === 0 && <p className="text-sm text-[var(--charcoal)]">No candidates referred yet.</p>}
        </div>
      </Card>
    </div>
  );
}
