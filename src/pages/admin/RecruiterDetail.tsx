import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserSearch, Users, CheckCircle, XCircle, Copy, Check } from 'lucide-react';
import { Card, Badge, Button, Modal, Toast } from '../../components/ui';
import { BackLink, InfoItem, DetailSkeleton, DetailProblem, fmtDate, candidateStatusVariant } from '../../components/AdminDetailBits';
import { useAuth } from '../../context/AuthContext';
import { getRecruiterByUserId, getCandidatesReferredByRecruiter, updateRecruiterApproval } from '../../lib/supabase/data';

export default function RecruiterDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [recruiter, setRecruiter] = useState<any | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // quiet = refresh after an action, without swapping the page for a skeleton
  const load = useCallback(async (quiet = false) => {
    if (!id) return;
    if (!quiet) setLoading(true);
    setFailed(false);
    try {
      const [r, c] = await Promise.all([getRecruiterByUserId(id), getCandidatesReferredByRecruiter(id)]);
      setRecruiter(r);
      setCandidates(c || []);
    } catch {
      if (!quiet) setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const setApproval = async (approve: boolean) => {
    if (!recruiter) return;
    setBusy(true);
    try {
      await updateRecruiterApproval(recruiter.id, approve, user?.id || null);
      await load(true);
      setToast(approve ? 'Recruiter approved' : 'Recruiter suspended');
    } catch (err) {
      setToast((err as { message?: string })?.message || 'Could not update this recruiter. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async () => {
    if (!recruiter?.referral_code) return;
    try {
      await navigator.clipboard.writeText(recruiter.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked */ }
  };

  if (loading) return <DetailSkeleton />;
  if (failed) {
    return <DetailProblem title="Could not load this recruiter" body="Check your connection and try again." backTo="/admin/recruiters" backLabel="Back to Recruiters" onRetry={() => load()} />;
  }
  if (!recruiter) {
    return <DetailProblem title="Recruiter not found" body="They may have been removed, or the link is wrong." backTo="/admin/recruiters" backLabel="Back to Recruiters" />;
  }

  const placed = candidates.filter(c => c.status === 'Placed').length;

  return (
    <div className="space-y-6">
      <BackLink to="/admin/recruiters">Back to Recruiters</BackLink>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(118,85,217,0.1)', color: '#7655D9' }}>
              <UserSearch size={28} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--navy)] truncate">{recruiter.full_name || 'Unnamed Recruiter'}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant={recruiter.is_approved ? 'success' : 'warning'}>{recruiter.is_approved ? 'Approved' : 'Pending Approval'}</Badge>
                {recruiter.referral_code && (
                  <button type="button" onClick={copyCode} title="Copy referral code" className="inline-flex items-center gap-1 text-xs text-[var(--charcoal)] font-mono hover:text-[var(--navy)] rounded px-1 hover:bg-slate-100">
                    {recruiter.referral_code}
                    {copied ? <Check size={12} className="text-[var(--green)]" /> : <Copy size={11} className="opacity-50" />}
                  </button>
                )}
              </div>
            </div>
          </div>
          {recruiter.is_approved ? (
            <Button variant="outline" disabled={busy} onClick={() => setConfirmSuspend(true)} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto">
              <XCircle size={16} /> Suspend
            </Button>
          ) : (
            <Button variant="success" loading={busy} disabled={busy} onClick={() => setApproval(true)} className="gap-1.5 w-full sm:w-auto">
              {!busy && <CheckCircle size={16} />} Approve
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            { label: 'Referred', value: candidates.length },
            { label: 'Placed', value: placed },
            { label: 'Active', value: candidates.length - placed - candidates.filter(c => c.status === 'Inactive').length },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-[var(--bg-warm)] border border-slate-200/70 px-3 py-2.5">
              <p className="text-xl font-extrabold text-[var(--navy)] tabular-nums">{s.value}</p>
              <p className="text-[11px] font-semibold text-[var(--charcoal)]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5 mt-6">
          <InfoItem label="Phone" value={recruiter.phone} href={recruiter.phone ? `tel:${recruiter.phone}` : undefined} />
          <InfoItem label="Joined" value={fmtDate(recruiter.created_at)} />
          <InfoItem label="Approved on" value={recruiter.is_approved ? fmtDate(recruiter.approved_at) : ''} />
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-[var(--navy)] mb-3 flex items-center gap-2">
          <Users size={18} className="text-[var(--orange)]" /> Candidates referred <span className="text-[var(--charcoal)] font-semibold tabular-nums">({candidates.length})</span>
        </h3>
        <div className="divide-y divide-slate-100">
          {candidates.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--navy)] truncate">{c.profile_name || 'Unnamed candidate'}</p>
                <p className="text-xs text-[var(--charcoal)] truncate">
                  {[c.profile_phone, c.created_at ? `Registered ${fmtDate(c.created_at)}` : ''].filter(Boolean).join(' · ')}
                </p>
              </div>
              <Badge variant={candidateStatusVariant(c.status)}>{c.status || 'New'}</Badge>
            </div>
          ))}
          {candidates.length === 0 && <p className="text-sm text-[var(--charcoal)] py-2">No candidates referred yet.</p>}
        </div>
      </Card>

      <Modal
        isOpen={confirmSuspend}
        onClose={() => setConfirmSuspend(false)}
        title="Suspend this recruiter?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmSuspend(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { setConfirmSuspend(false); setApproval(false); }}>Suspend</Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--charcoal)]">
          They will lose access to their dashboard until you approve them again. Candidates they already referred stay as they are.
        </p>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
