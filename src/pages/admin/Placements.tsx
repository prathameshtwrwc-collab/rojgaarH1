import { useState } from 'react';
import { Award, Plus, IndianRupee, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, Badge, Button, Modal, Select, Input } from '../../components/ui';
import { useData, Placement } from '../../context/DataContext';

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  'Active': 'success', 'Completed': 'warning', 'Terminated': 'danger',
};
const commissionVariant: Record<string, 'success' | 'danger' | 'warning'> = {
  'Paid': 'success', 'Unpaid': 'danger', 'Partial': 'warning',
};

export default function Placements() {
  const { placements, addPlacement, updatePlacement, jobSeekers, jobPostings, employers } = useData();
  const [showModal, setShowModal] = useState(false);
  const [newPlacement, setNewPlacement] = useState({
    candidateId: '', jobId: '', placementDate: '', handoverDate: '', commission: '4000',
    commissionStatus: 'Unpaid' as Placement['commissionStatus'], status: 'Active' as Placement['status'],
  });

  const totalRevenue = placements.reduce((s, p) => s + p.commission, 0);
  const paidRevenue = placements.filter(p => p.commissionStatus === 'Paid').reduce((s, p) => s + p.commission, 0);
  const unpaidRevenue = placements.filter(p => p.commissionStatus === 'Unpaid').reduce((s, p) => s + p.commission, 0);

  const handleAdd = () => {
    const candidate = jobSeekers.find(c => c.id === newPlacement.candidateId);
    const job = jobPostings.find(j => j.id === newPlacement.jobId);
    const employer = employers.find(e => e.id === job?.employerId);
    if (candidate && job && employer) {
      const placement: Placement = {
        id: `PL${String(Date.now()).slice(-6)}`,
        candidateId: candidate.id,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        jobId: job.id,
        jobTitle: job.jobTitle,
        employerId: employer.id,
        companyName: employer.companyName,
        placementDate: newPlacement.placementDate,
        handoverDate: newPlacement.handoverDate,
        commission: parseInt(newPlacement.commission) || 4000,
        commissionStatus: newPlacement.commissionStatus,
        status: newPlacement.status,
      };
      addPlacement(placement);
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)]">Placements</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">Track successful placements and commissions</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-1"><Plus size={16} /> Record Placement</Button>
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
        <div className="overflow-x-auto">
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
              {placements.map(p => (
                <tr key={p.id} className="border-b border-slate-100/60 hover:bg-slate-100 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[var(--navy)]">{p.candidateName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[var(--navy)]">{p.jobTitle}</p>
                    <p className="text-xs text-[var(--charcoal)]">{p.companyName}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden sm:table-cell">{p.placementDate}</td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden md:table-cell">{p.handoverDate}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[var(--navy)]">₹{p.commission.toLocaleString()}</p>
                    <Badge variant={commissionVariant[p.commissionStatus]} className="text-[10px]">{p.commissionStatus}</Badge>
                  </td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[p.status]}>{p.status}</Badge></td>
                  <td className="px-4 py-3">
                    {p.commissionStatus === 'Unpaid' && (
                      <Button variant="ghost" size="sm" onClick={() => updatePlacement(p.id, { commissionStatus: 'Paid' })} className="text-[var(--green)] text-xs font-semibold">
                        Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            options={[{ value: '', label: 'Choose candidate...' }, ...jobSeekers.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))]}
            value={newPlacement.candidateId}
            onChange={e => setNewPlacement(prev => ({ ...prev, candidateId: e.target.value }))}
          />
          <Select
            label="Select Job"
            options={[{ value: '', label: 'Choose job...' }, ...jobPostings.map(j => ({ value: j.id, label: `${j.jobTitle} at ${j.companyName}` }))]}
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
              onChange={e => setNewPlacement(prev => ({ ...prev, commissionStatus: e.target.value as Placement['commissionStatus'] }))}
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
            onChange={e => setNewPlacement(prev => ({ ...prev, status: e.target.value as Placement['status'] }))}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleAdd} variant="success" className="gap-1"><Award size={14} /> Save Placement</Button>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
