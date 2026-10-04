import { useState } from 'react';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { Inbox } from 'lucide-react';
import { Award, Plus, IndianRupee, CheckCircle, AlertTriangle, Download, Pencil, Trash2 } from 'lucide-react';
import { Card, Badge, Button, Modal, Select, Input } from '../../components/ui';
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

  const employerName = (id: string) => employers.find((e: any) => e.id === id)?.company_name || 'Unknown';
  const candidateName = (id: string) => candidates.find((c: any) => c.id === id)?.profile_name || 'Unknown';
  const jobTitle = (id: string) => jobPostings.find((j: any) => j.id === id)?.job_title || 'Unknown';

  const totalRevenue = placements.reduce((s: number, p: any) => s + (Number(p.commission) || 0), 0);
  const paidRevenue = placements.filter((p: any) => p.commission_status === 'Paid').reduce((s: number, p: any) => s + (Number(p.commission) || 0), 0);
  const unpaidRevenue = placements.filter((p: any) => p.commission_status === 'Unpaid').reduce((s: number, p: any) => s + (Number(p.commission) || 0), 0);

  const handleAdd = async () => {
    const job = jobPostings.find((j: any) => j.id === newPlacement.jobId);
    if (!newPlacement.candidateId || !job || !newPlacement.placementDate) return;
    setSaving(true);
    try {
      await createPlacement({
        candidate_id: newPlacement.candidateId,
        job_id: job.id,
        employer_id: job.employer_id,
        placement_date: newPlacement.placementDate,
        handover_date: newPlacement.handoverDate || null,
        commission: parseInt(newPlacement.commission) || 4000,
        commission_status: newPlacement.commissionStatus as any,
        status: newPlacement.status as any,
      } as any);
      await refresh();
      setShowModal(false);
      setNewPlacement({ candidateId: '', jobId: '', placementDate: '', handoverDate: '', commission: '4000', commissionStatus: 'Unpaid', status: 'Active' });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to record placement');
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (placementId: string) => {
    try {
      await updatePlacementApi(placementId, { commission_status: 'Paid' } as any);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update placement');
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
        commission: editForm.commission ? parseInt(editForm.commission) : editTarget.commission,
        handover_date: editForm.handoverDate || null,
      } as any);
      await refresh();
      setEditTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update placement');
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

  const paging = usePagination(placements, 10);

  return (
    <div className="space-y-6 dash-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)]">Placements</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">Track successful placements and commissions</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExportCsv} className="gap-1.5"><Download size={15} /> Download CSV</Button>
          <Button onClick={() => setShowModal(true)} className="gap-1"><Plus size={16} /> Record Placement</Button>
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
            <p className="text-lg font-bold text-[var(--navy)]">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="card-landing flex items-center gap-3">
          <div className="icon-box-landing icon-box-landing--navy"><CheckCircle size={20} /></div>
          <div>
            <p className="text-xs text-[var(--charcoal)] font-medium">Paid</p>
            <p className="text-lg font-bold text-[var(--navy)]">₹{paidRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="card-landing flex items-center gap-3">
          <div className="icon-box-landing icon-box-landing--orange"><AlertTriangle size={20} /></div>
          <div>
            <p className="text-xs text-[var(--charcoal)] font-medium">Unpaid</p>
            <p className="text-lg font-bold text-[var(--navy)]">₹{unpaidRevenue.toLocaleString()}</p>
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
                <tr key={p.id} className="border-b border-slate-100/60 hover:bg-slate-100 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[var(--navy)]">{candidateName(p.candidate_id)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[var(--navy)]">{jobTitle(p.job_id)}</p>
                    <p className="text-xs text-[var(--charcoal)]">{employerName(p.employer_id)}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden sm:table-cell">{p.placement_date}</td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden md:table-cell">{p.handover_date || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[var(--navy)]">₹{Number(p.commission || 0).toLocaleString()}</p>
                    <Badge variant={commissionVariant[p.commission_status]} className="text-[10px]">{p.commission_status}</Badge>
                  </td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[p.status]}>{p.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {p.commission_status === 'Unpaid' && (
                        <Button variant="ghost" size="sm" onClick={() => markPaid(p.id)} className="text-[var(--green)] text-xs font-semibold">
                          Mark Paid
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)} title="Edit status">
                        <Pencil size={15} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(p)} title="Delete placement" className="text-red-600 hover:text-red-700">
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
                {paging.total === 0 ? (
                  <EmptyState icon={<Inbox size={20} />} title="No placements to show" body="Nothing matches this view yet. Try clearing a filter or search." />
                ) : (
                  <Pagination page={paging.page} pageSize={paging.pageSize} total={paging.total} onPageChange={paging.setPage} label="placements" />
                )}
          {placements.length === 0 && (
            <div className="text-center py-12 text-[var(--charcoal)]"><p className="text-sm">No placements yet</p></div>
          )}
        </div>
      </Card>

      {/* Add Placement Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record New Placement" size="md">
        <div className="space-y-4">
          <Select
            label="Select Candidate"
            options={[{ value: '', label: 'Choose candidate...' }, ...candidates.map((c: any) => ({ value: c.id, label: c.profile_name || c.id }))]}
            value={newPlacement.candidateId}
            onChange={e => setNewPlacement(prev => ({ ...prev, candidateId: e.target.value }))}
          />
          <Select
            label="Select Job"
            options={[{ value: '', label: 'Choose job...' }, ...jobPostings.map((j: any) => ({ value: j.id, label: `${j.job_title} at ${employerName(j.employer_id)}` }))]}
            value={newPlacement.jobId}
            onChange={e => setNewPlacement(prev => ({ ...prev, jobId: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Placement Date" type="date" required value={newPlacement.placementDate} onChange={e => setNewPlacement(prev => ({ ...prev, placementDate: e.target.value }))} />
            <Input label="Handover Date" type="date" value={newPlacement.handoverDate} onChange={e => setNewPlacement(prev => ({ ...prev, handoverDate: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Commission (₹)" type="number" value={newPlacement.commission} onChange={e => setNewPlacement(prev => ({ ...prev, commission: e.target.value }))} hint="₹3,000 - ₹5,000 per placement" />
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
            <Button onClick={handleAdd} disabled={saving} variant="success" className="gap-1"><Award size={14} /> {saving ? 'Saving...' : 'Save Placement'}</Button>
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
              <Input label="Commission (₹)" type="number" value={editForm.commission} onChange={e => setEditForm(prev => ({ ...prev, commission: e.target.value }))} />
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
            <Input label="Handover Date" type="date" value={editForm.handoverDate} onChange={e => setEditForm(prev => ({ ...prev, handoverDate: e.target.value }))} />
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveEdit} disabled={savingEdit} variant="success" className="gap-1">
                <CheckCircle size={14} /> {savingEdit ? 'Saving...' : 'Save Changes'}
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
        onConfirm={async () => { await deletePlacement(deleteTarget.id); await refresh(); }}
      />
    </div>
  );
}
