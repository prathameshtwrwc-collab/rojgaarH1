import { useState } from 'react';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { Inbox } from 'lucide-react';
import { Award, Plus, IndianRupee, CheckCircle, AlertTriangle, Download, Pencil, Trash2 } from 'lucide-react';
import { Card, Badge, Button, Modal, Select, Input, Toast } from '../../components/ui';
import { fmtDate } from '../../components/AdminDetailBits';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { useDatabase } from '../../context/DatabaseContext';
import { createPlacement, updatePlacement as updatePlacementApi, deletePlacement } from '../../lib/supabase/data';
import { exportToCsv } from '../../lib/csvExport';

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  'Active': 'success', 'Completed': 'warning', 'Terminated': 'danger',
};
const commissionVariant: Record<string, 'success' | 'danger' | 'warning'> = {
  'Paid': 'success', 'Unpaid': 'danger', 'Partial': 'warning',
};

export default function Placements() {
  const { placements, candidates, jobs: jobPostings, employers, refresh } = useDatabase();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPlacement, setNewPlacement] = useState({
    candidateId: '', jobId: '', placementDate: '', handoverDate: '', commission: '4000',
    commissionStatus: 'Unpaid', status: 'Active',
  });
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ status: 'Active', commissionStatus: 'Unpaid', commission: '', handoverDate: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [addErrors, setAddErrors] = useState<{ candidateId?: string; jobId?: string; placementDate?: string; handoverDate?: string; commission?: string }>({});
  const [payingId, setPayingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const errMsg = (err: unknown, fallback: string) => (err as { message?: string })?.message || fallback;

  const employerName = (id: string) => employers.find((e: any) => e.id === id)?.company_name || 'Unknown';
  const candidateName = (id: string) => candidates.find((c: any) => c.id === id)?.profile_name || 'Unknown';
  const jobTitle = (id: string) => jobPostings.find((j: any) => j.id === id)?.job_title || 'Unknown';

  const totalRevenue = placements.reduce((s: number, p: any) => s + (Number(p.commission) || 0), 0);
  const paidRevenue = placements.filter((p: any) => p.commission_status === 'Paid').reduce((s: number, p: any) => s + (Number(p.commission) || 0), 0);
  const unpaidRevenue = placements.filter((p: any) => p.commission_status === 'Unpaid').reduce((s: number, p: any) => s + (Number(p.commission) || 0), 0);

  const handleAdd = async () => {
    const job = jobPostings.find((j: any) => j.id === newPlacement.jobId);
    const errs: typeof addErrors = {};
    if (!newPlacement.candidateId) errs.candidateId = 'Choose the candidate who was placed';
    if (!job) errs.jobId = 'Choose the job they were placed in';
    if (!newPlacement.placementDate) errs.placementDate = 'Pick the placement date';
    if (newPlacement.handoverDate && newPlacement.placementDate && newPlacement.handoverDate < newPlacement.placementDate) errs.handoverDate = 'Handover cannot be before placement';
    if (newPlacement.commission !== '' && (Number.isNaN(Number(newPlacement.commission)) || Number(newPlacement.commission) < 0)) errs.commission = 'Enter a valid amount';
    setAddErrors(errs);
    if (Object.keys(errs).length || !job) return;
    setSaving(true);
    try {
      await createPlacement({
        candidate_id: newPlacement.candidateId,
        job_id: job.id,
        employer_id: job.employer_id,
        placement_date: newPlacement.placementDate,
        handover_date: newPlacement.handoverDate || null,
        // Empty means the standard fee; an explicit 0 stays 0
        commission: newPlacement.commission === '' ? 4000 : Math.max(0, parseInt(newPlacement.commission, 10) || 0),
        commission_status: newPlacement.commissionStatus as any,
        status: newPlacement.status as any,
      } as any);
      await refresh({ silent: true });
      setShowModal(false);
      setNewPlacement({ candidateId: '', jobId: '', placementDate: '', handoverDate: '', commission: '4000', commissionStatus: 'Unpaid', status: 'Active' });
      setToast('Placement recorded');
    } catch (err) {
      setToast(errMsg(err, 'Failed to record placement'));
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (placementId: string) => {
    if (payingId) return;
    setPayingId(placementId);
    try {
      await updatePlacementApi(placementId, { commission_status: 'Paid' } as any);
      await refresh({ silent: true });
      setToast('Commission marked as paid');
    } catch (err) {
      setToast(errMsg(err, 'Failed to update placement'));
    } finally {
      setPayingId(null);
    }
  };

  const openEdit = (p: any) => {
    setEditTarget(p);
    setEditForm({
      status: p.status || 'Active',
      commissionStatus: p.commission_status || 'Unpaid',
      commission: String(p.commission ?? ''),
      handoverDate: p.handover_date || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSavingEdit(true);
    try {
      await updatePlacementApi(editTarget.id, {
        status: editForm.status as any,
        commission_status: editForm.commissionStatus as any,
        commission: editForm.commission !== '' ? Math.max(0, parseInt(editForm.commission, 10) || 0) : editTarget.commission,
        handover_date: editForm.handoverDate || null,
      } as any);
      await refresh({ silent: true });
      setEditTarget(null);
      setToast('Placement updated');
    } catch (err) {
      setToast(errMsg(err, 'Failed to update placement'));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleExportCsv = () => {
    exportToCsv('placements', placements.map((p: any) => ({
      Candidate: candidateName(p.candidate_id),
      'Job Title': jobTitle(p.job_id),
      Employer: employerName(p.employer_id),
      'Placement Date': p.placement_date,
      'Handover Date': p.handover_date || '',
      'Commission (₹)': p.commission,
      'Commission Status': p.commission_status,
      Status: p.status,
      'Placement ID': p.id,
      'Candidate ID': p.candidate_id,
      'Job ID': p.job_id,
    })));
  };

  // Newest placements first
  const sortedPlacements = [...placements].sort((a: any, b: any) => String(b.placement_date || '').localeCompare(String(a.placement_date || '')));
  const paging = usePagination(sortedPlacements, 10);
  const placedIds = new Set(placements.map((p: any) => p.candidate_id));

  return (
    <div className="space-y-6 dash-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="admin-page-title text-2xl font-bold text-[var(--navy)]">Placements</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">Track successful placements and commissions</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={placements.length === 0} className="gap-1.5"><Download size={15} /> CSV</Button>
          <Button size="sm" onClick={() => { setAddErrors({}); setShowModal(true); }} className="gap-1"><Plus size={16} /> Record Placement</Button>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-landing flex items-center gap-3">
          <div className="icon-box-landing icon-box-landing--orange"><Award size={20} /></div>
          <div>
            <p className="text-xs text-[var(--charcoal)] font-medium">Total Placements</p>
            <p className="text-lg font-bold text-[var(--navy)]">{placements.length}</p>
          </div>
        </div>
        <div className="card-landing flex items-center gap-3">
          <div className="icon-box-landing icon-box-landing--green"><IndianRupee size={20} /></div>
          <div>
            <p className="text-xs text-[var(--charcoal)] font-medium">Total Revenue</p>
            <p className="text-lg font-bold text-[var(--navy)] tabular-nums">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="card-landing flex items-center gap-3">
          <div className="icon-box-landing icon-box-landing--navy"><CheckCircle size={20} /></div>
          <div>
            <p className="text-xs text-[var(--charcoal)] font-medium">Paid</p>
            <p className="text-lg font-bold text-[var(--green)] tabular-nums">₹{paidRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="card-landing flex items-center gap-3">
          <div className="icon-box-landing icon-box-landing--orange"><AlertTriangle size={20} /></div>
          <div>
            <p className="text-xs text-[var(--charcoal)] font-medium">Unpaid</p>
            <p className={`text-lg font-bold tabular-nums ${unpaidRevenue > 0 ? 'text-[var(--orange)]' : 'text-[var(--navy)]'}`}>₹{unpaidRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Placements Table */}
      <Card padding={false}>
        <div className="admin-table overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-[var(--bg-warm)]">
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Candidate</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Job / Company</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Placement Date</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Handover</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Commission</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paging.pageItems.map((p: any) => (
                <tr key={p.id} className="border-b border-slate-100/60 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[var(--navy)]">{candidateName(p.candidate_id)}</p>
                    <p className="text-[11px] text-[var(--charcoal)] sm:hidden">{fmtDate(p.placement_date) || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[var(--navy)]">{jobTitle(p.job_id)}</p>
                    <p className="text-xs text-[var(--charcoal)]">{employerName(p.employer_id)}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden sm:table-cell whitespace-nowrap">{fmtDate(p.placement_date) || '—'}</td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden md:table-cell whitespace-nowrap">{fmtDate(p.handover_date) || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[var(--navy)] tabular-nums">₹{Number(p.commission || 0).toLocaleString('en-IN')}</p>
                    <Badge variant={commissionVariant[p.commission_status]} className="text-[10px]">{p.commission_status}</Badge>
                  </td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[p.status]}>{p.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {p.commission_status !== 'Paid' && (
                        <Button variant="ghost" size="sm" onClick={() => markPaid(p.id)} loading={payingId === p.id} disabled={Boolean(payingId)} className="text-[var(--green)] text-xs font-semibold">
                          Mark Paid
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)} title="Edit placement" aria-label="Edit placement">
                        <Pencil size={15} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(p)} title="Delete placement" aria-label="Delete placement" className="text-red-600 hover:text-red-700">
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
                {paging.total === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={<Inbox size={20} />}
                      title="No placements yet"
                      body="Placements appear here when a candidate is hired, or when you record one."
                      action={<Button size="sm" onClick={() => { setAddErrors({}); setShowModal(true); }} className="gap-1"><Plus size={14} /> Record Placement</Button>}
                    />
                  </div>
                ) : (
                  <Pagination page={paging.page} pageSize={paging.pageSize} total={paging.total} onPageChange={paging.setPage} label="placements" />
                )}
        </div>
      </Card>

      {/* Add Placement Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record New Placement" size="md">
        <div className="space-y-4">
          <Select
            label="Select Candidate"
            options={[
              { value: '', label: 'Choose candidate...' },
              ...[...candidates]
                .sort((a: any, b: any) => (a.profile_name || '').localeCompare(b.profile_name || ''))
                .map((c: any) => ({ value: c.id, label: `${c.profile_name || 'Unnamed'}${c.profile_phone ? ` · ${c.profile_phone}` : ''}${placedIds.has(c.id) ? ' (already placed)' : ''}` })),
            ]}
            value={newPlacement.candidateId}
            onChange={e => { setNewPlacement(prev => ({ ...prev, candidateId: e.target.value })); setAddErrors(x => ({ ...x, candidateId: undefined })); }}
            error={addErrors.candidateId}
          />
          <Select
            label="Select Job"
            options={[
              { value: '', label: 'Choose job...' },
              ...[...jobPostings]
                .sort((a: any, b: any) => Number(b.status === 'Open') - Number(a.status === 'Open'))
                .map((j: any) => ({ value: j.id, label: `${j.job_title} at ${employerName(j.employer_id)}${j.status !== 'Open' ? ` (${j.status})` : ''}` })),
            ]}
            value={newPlacement.jobId}
            onChange={e => { setNewPlacement(prev => ({ ...prev, jobId: e.target.value })); setAddErrors(x => ({ ...x, jobId: undefined })); }}
            error={addErrors.jobId}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Placement Date" type="date" required max={new Date().toISOString().slice(0, 10)} value={newPlacement.placementDate} onChange={e => { setNewPlacement(prev => ({ ...prev, placementDate: e.target.value })); setAddErrors(x => ({ ...x, placementDate: undefined })); }} error={addErrors.placementDate} />
            <Input label="Handover Date" type="date" min={newPlacement.placementDate || undefined} value={newPlacement.handoverDate} onChange={e => { setNewPlacement(prev => ({ ...prev, handoverDate: e.target.value })); setAddErrors(x => ({ ...x, handoverDate: undefined })); }} error={addErrors.handoverDate} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Commission (₹)" type="number" inputMode="numeric" min={0} value={newPlacement.commission} onChange={e => { setNewPlacement(prev => ({ ...prev, commission: e.target.value })); setAddErrors(x => ({ ...x, commission: undefined })); }} hint="₹3,000 – ₹5,000 per placement" error={addErrors.commission} />
            <Select
              label="Commission Status"
              options={[
                { value: 'Unpaid', label: 'Unpaid' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Partial', label: 'Partial' },
              ]}
              value={newPlacement.commissionStatus}
              onChange={e => setNewPlacement(prev => ({ ...prev, commissionStatus: e.target.value }))}
            />
          </div>
          <Select
            label="Placement Status"
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Terminated', label: 'Terminated' },
            ]}
            value={newPlacement.status}
            onChange={e => setNewPlacement(prev => ({ ...prev, status: e.target.value }))}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleAdd} disabled={saving} loading={saving} variant="success" className="gap-1">{!saving && <Award size={14} />} {saving ? 'Saving…' : 'Save Placement'}</Button>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Placement Modal */}
      <Modal isOpen={Boolean(editTarget)} onClose={() => setEditTarget(null)} title="Edit Placement Status" size="md">
        {editTarget && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[var(--bg-warm)] p-3">
              <p className="text-sm font-bold text-[var(--navy)]">{candidateName(editTarget.candidate_id)}</p>
              <p className="text-xs text-[var(--charcoal)]">{jobTitle(editTarget.job_id)} at {employerName(editTarget.employer_id)}</p>
            </div>
            <Select
              label="Placement Status"
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Terminated', label: 'Terminated' },
              ]}
              value={editForm.status}
              onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Commission (₹)" type="number" inputMode="numeric" min={0} value={editForm.commission} onChange={e => setEditForm(prev => ({ ...prev, commission: e.target.value }))} />
              <Select
                label="Commission Status"
                options={[
                  { value: 'Unpaid', label: 'Unpaid' },
                  { value: 'Paid', label: 'Paid' },
                  { value: 'Partial', label: 'Partial' },
                ]}
                value={editForm.commissionStatus}
                onChange={e => setEditForm(prev => ({ ...prev, commissionStatus: e.target.value }))}
              />
            </div>
            <Input label="Handover Date" type="date" min={editTarget.placement_date || undefined} value={editForm.handoverDate} onChange={e => setEditForm(prev => ({ ...prev, handoverDate: e.target.value }))} />
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveEdit} disabled={savingEdit} loading={savingEdit} variant="success" className="gap-1">
                {!savingEdit && <CheckCircle size={14} />} {savingEdit ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button variant="ghost" onClick={() => setEditTarget(null)} disabled={savingEdit}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this placement?"
        description={deleteTarget ? `This permanently deletes the placement record for ${candidateName(deleteTarget.candidate_id)} (${jobTitle(deleteTarget.job_id)} at ${employerName(deleteTarget.employer_id)}), including its commission history. This cannot be undone.` : ''}
        confirmLabel="Delete placement"
        onConfirm={async () => { await deletePlacement(deleteTarget.id); await refresh({ silent: true }); setToast('Placement deleted'); }}
      />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
