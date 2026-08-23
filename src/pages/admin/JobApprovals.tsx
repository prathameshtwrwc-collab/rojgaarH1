import { useState } from 'react';
import { Briefcase, Plus, CheckCircle, XCircle, MapPin, IndianRupee } from 'lucide-react';
import { Card, Badge, Button, Modal, Select, Input } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { updateJobPosting, createJobPosting, setJobSkills, getOrCreatePlatformEmployer } from '../../lib/supabase/data';

const PLATFORM_OPTION = '__platform__';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  Open: 'success', Pending: 'warning', Closed: 'danger', 'On Hold': 'default',
};

export default function JobApprovals() {
  const { jobs, employers, jobSkills, refresh } = useDatabase();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('All');
  const [showPostModal, setShowPostModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyJobId, setBusyJobId] = useState<string | null>(null);

  const [form, setForm] = useState({
    employerId: '', jobTitle: '', city: '', state: '', salaryMin: '', salaryMax: '',
    employmentType: 'Full-time', qualificationRequired: '', jobDescription: '', skills: '',
  });

  const employerName = (id: string) => employers.find((e: any) => e.id === id)?.company_name || 'Unknown';

  const filteredJobs = jobs.filter((j: any) => statusFilter === 'All' || j.status === statusFilter);
  const pendingCount = jobs.filter((j: any) => j.status === 'Pending').length;

  const handleApprove = async (job: any) => {
    setBusyJobId(job.id);
    try {
      await updateJobPosting(job.id, {
        status: 'Open', is_verified: true, approved_by: user?.id || null, approved_at: new Date().toISOString(),
      } as any);
      await refresh();
    } finally {
      setBusyJobId(null);
    }
  };

  const handleReject = async (job: any) => {
    setBusyJobId(job.id);
    try {
      await updateJobPosting(job.id, { status: 'Closed', is_verified: false } as any);
      await refresh();
    } finally {
      setBusyJobId(null);
    }
  };

  const handlePostJob = async () => {
    if (!form.employerId || !form.jobTitle || !form.jobDescription || !form.city || !form.state || !user) return;
    setSaving(true);
    try {
      const employerId = form.employerId === PLATFORM_OPTION
        ? (await getOrCreatePlatformEmployer(user.id)).id
        : form.employerId;
      const job: any = await createJobPosting({
        employer_id: employerId,
        job_title: form.jobTitle,
        city: form.city,
        state: form.state,
        salary_min: form.salaryMin ? Number(form.salaryMin) : null,
        salary_max: form.salaryMax ? Number(form.salaryMax) : null,
        employment_type: form.employmentType as any,
        qualification_required: form.qualificationRequired,
        job_description: form.jobDescription,
        status: 'Open',
        is_verified: true,
        approved_by: user?.id || null,
        approved_at: new Date().toISOString(),
      } as any);
      const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skills.length > 0) await setJobSkills(job.id, skills);
      await refresh();
      setShowPostModal(false);
      setForm({ employerId: '', jobTitle: '', city: '', state: '', salaryMin: '', salaryMax: '', employmentType: 'Full-time', qualificationRequired: '', jobDescription: '', skills: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)]">Job Postings</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">{jobs.length} total · {pendingCount} awaiting approval</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Open', label: 'Open' },
              { value: 'On Hold', label: 'On Hold' },
              { value: 'Closed', label: 'Closed' },
            ]}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          />
          <Button onClick={() => setShowPostModal(true)} className="gap-1"><Plus size={16} /> Post Job</Button>
        </div>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-[var(--bg-warm)]">
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Job Title</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Employer</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Location</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Salary</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job: any) => (
                <tr key={job.id} className="border-b border-slate-100/60 hover:bg-slate-100 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[var(--navy)]">{job.job_title}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(jobSkills[job.id] || []).slice(0, 3).map((s: string) => <Badge key={s} variant="info" className="text-[10px]">{s}</Badge>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)]">{employerName(job.employer_id)}</td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden sm:table-cell">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.city}, {job.state}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden md:table-cell">
                    <span className="flex items-center gap-1"><IndianRupee size={12} /> {Number(job.salary_min || 0).toLocaleString()}-{Number(job.salary_max || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[job.status]}>{job.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {job.status !== 'Open' && (
                        <Button size="sm" variant="success" disabled={busyJobId === job.id} onClick={() => handleApprove(job)} className="gap-1 text-xs">
                          <CheckCircle size={12} /> Approve
                        </Button>
                      )}
                      {job.status !== 'Closed' && (
                        <Button size="sm" variant="danger" disabled={busyJobId === job.id} onClick={() => handleReject(job)} className="gap-1 text-xs">
                          <XCircle size={12} /> {job.status === 'Pending' ? 'Reject' : 'Close'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredJobs.length === 0 && (
            <div className="text-center py-12 text-[var(--charcoal)]"><Briefcase size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No jobs found</p></div>
          )}
        </div>
      </Card>

      <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)} title="Post a Job on Behalf of an Employer" size="md">
        <div className="space-y-4">
          <Select
            label="Post On Behalf Of"
            options={[
              { value: '', label: 'Select employer...' },
              { value: PLATFORM_OPTION, label: '⭐ Post as RojgaarHai.com (Platform Job)' },
              ...employers.map((e: any) => ({ value: e.id, label: e.company_name })),
            ]}
            value={form.employerId}
            onChange={e => setForm({ ...form, employerId: e.target.value })}
          />
          <Input label="Job Title" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
            <Input label="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Salary Min" type="number" value={form.salaryMin} onChange={e => setForm({ ...form, salaryMin: e.target.value })} />
            <Input label="Salary Max" type="number" value={form.salaryMax} onChange={e => setForm({ ...form, salaryMax: e.target.value })} />
          </div>
          <Select
            label="Employment Type"
            options={[
              { value: 'Full-time', label: 'Full-time' }, { value: 'Part-time', label: 'Part-time' },
              { value: 'Contract', label: 'Contract' }, { value: 'Temporary', label: 'Temporary' },
              { value: 'Internship', label: 'Internship' }, { value: 'Freelance', label: 'Freelance' },
            ]}
            value={form.employmentType}
            onChange={e => setForm({ ...form, employmentType: e.target.value })}
          />
          <Input label="Qualification Required" value={form.qualificationRequired} onChange={e => setForm({ ...form, qualificationRequired: e.target.value })} required />
          <div>
            <label className="block text-sm font-semibold text-[var(--navy)] mb-1.5">Job Description</label>
            <textarea
              value={form.jobDescription}
              onChange={e => setForm({ ...form, jobDescription: e.target.value })}
              rows={3}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
            />
          </div>
          <Input label="Required Skills (comma-separated)" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button onClick={handlePostJob} disabled={saving} variant="success">{saving ? 'Posting...' : 'Post Job (Auto-Approved)'}</Button>
            <Button variant="ghost" onClick={() => setShowPostModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
