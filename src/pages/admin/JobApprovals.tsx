import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, CheckCircle, XCircle, MapPin, IndianRupee, Download } from 'lucide-react';
import { Card, Badge, Button, Modal, Select, Input, SkillTags } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { updateJobPosting, createJobPosting, setJobSkills, getOrCreatePlatformEmployer } from '../../lib/supabase/data';
import { exportToCsv } from '../../lib/csvExport';

const PLATFORM_OPTION = '__platform__';

const commonQualifications = [
  '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'B.Tech/BCA', 'B.Com', 'B.Sc',
  'BA', 'BBA', 'MBA', 'M.Sc', 'M.Com', 'B.Pharm/D.Pharm', 'Any Graduate', 'No Formal Education Required',
];

const commonSkills = [
  'Communication', 'MS Excel', 'MS Office', 'Tally Prime', 'GST Filing', 'Data Entry', 'Sales',
  'Customer Service', 'CNC Operation', 'Welding', 'Quality Check', 'Machine Operation', 'AutoCAD',
  'Site Management', 'Patient Care', 'Nursing', 'React', 'Python', 'Java', 'SQL', 'Site Supervision',
];

const indianStatesList = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh',
];

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

  const emptyForm = {
    employerId: '', jobTitle: '', city: '', state: '', numberOfOpenings: '1',
    salaryMin: '', salaryMax: '', employmentType: 'Full-time', qualificationRequired: '',
    experienceMin: '', experienceMax: '', jobDescription: '', skills: [] as string[],
    benefits: '', joiningTimeline: 'Immediate', workingHours: '', deadline: '',
    accommodationProvided: false, transportationProvided: false,
  };
  const [form, setForm] = useState(emptyForm);

  const employerName = (id: string) => employers.find((e: any) => e.id === id)?.company_name || 'Unknown';

  const filteredJobs = jobs.filter((j: any) => statusFilter === 'All' || j.status === statusFilter);
  const pendingCount = jobs.filter((j: any) => j.status === 'Pending').length;

  const handleExportCsv = () => {
    exportToCsv('job-postings', filteredJobs.map((j: any) => ({
      'Job Title': j.job_title,
      Employer: employerName(j.employer_id),
      City: j.city || '',
      State: j.state || '',
      'Employment Type': j.employment_type,
      'Qualification Required': j.qualification_required || '',
      'Experience Min (yrs)': j.experience_min_years ?? '',
      'Experience Max (yrs)': j.experience_max_years ?? '',
      'Salary Min': j.salary_min ?? '',
      'Salary Max': j.salary_max ?? '',
      'Number of Openings': j.number_of_openings ?? '',
      Skills: jobSkills[j.id] || [],
      Status: j.status,
      Verified: j.is_verified,
      'Accommodation Provided': j.accommodation_provided,
      'Transportation Provided': j.transportation_provided,
      'Joining Timeline': j.joining_timeline || '',
      Deadline: j.deadline || '',
      'Posted Date': j.created_at ? j.created_at.split('T')[0] : '',
      'Job ID': j.id,
    })));
  };

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
        number_of_openings: Number(form.numberOfOpenings) || 1,
        salary_min: form.salaryMin ? Number(form.salaryMin) : null,
        salary_max: form.salaryMax ? Number(form.salaryMax) : null,
        employment_type: form.employmentType as any,
        qualification_required: form.qualificationRequired,
        experience_min_years: form.experienceMin ? Number(form.experienceMin) : null,
        experience_max_years: form.experienceMax ? Number(form.experienceMax) : null,
        job_description: form.jobDescription,
        benefits: form.benefits || null,
        joining_timeline: form.joiningTimeline || null,
        working_hours: form.workingHours || null,
        deadline: form.deadline || null,
        accommodation_provided: form.accommodationProvided,
        transportation_provided: form.transportationProvided,
        status: 'Open',
        is_verified: true,
        approved_by: user?.id || null,
        approved_at: new Date().toISOString(),
      } as any);
      if (form.skills.length > 0) await setJobSkills(job.id, form.skills);
      await refresh();
      setShowPostModal(false);
      setForm(emptyForm);
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
          <Button variant="outline" onClick={handleExportCsv} className="gap-1.5"><Download size={15} /> Download CSV</Button>
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
                    <Link to={`/admin/jobs/${job.id}`} className="text-sm font-bold text-[var(--navy)] hover:text-[var(--orange)] hover:underline">{job.job_title}</Link>
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
                      <Link to={`/admin/jobs/${job.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">View</Button>
                      </Link>
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

      <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)} title="Post a Job" size="lg">
        <div className="space-y-4">
          <Select
            label="Post On Behalf Of"
            options={[
              { value: '', label: 'Select employer...' },
              { value: PLATFORM_OPTION, label: '⭐ Post as RojgaarHai.com (Platform Job)' },
              ...employers.map((e: any) => ({ value: e.id, label: e.company_name || `Unnamed (${e.contact_name || e.id.slice(0, 8)})` })),
            ]}
            value={form.employerId}
            onChange={e => {
              const id = e.target.value;
              const emp = employers.find((x: any) => x.id === id);
              setForm(prev => ({
                ...prev, employerId: id,
                city: emp?.city && !prev.city ? emp.city : prev.city,
                state: emp?.state && !prev.state ? emp.state : prev.state,
              }));
            }}
          />

          <Input label="Job Title" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} required placeholder="e.g. CNC Machine Operator" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
            <Select
              label="State"
              options={[{ value: '', label: 'Select state...' }, ...indianStatesList.map(s => ({ value: s, label: s }))]}
              value={form.state}
              onChange={e => setForm({ ...form, state: e.target.value })}
            />
            <Input label="Number of Openings" type="number" min={1} value={form.numberOfOpenings} onChange={e => setForm({ ...form, numberOfOpenings: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <Select
              label="Qualification Required"
              options={[{ value: '', label: 'Select qualification...' }, ...commonQualifications.map(q => ({ value: q, label: q }))]}
              value={form.qualificationRequired}
              onChange={e => setForm({ ...form, qualificationRequired: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Experience Min (years)" type="number" min={0} value={form.experienceMin} onChange={e => setForm({ ...form, experienceMin: e.target.value })} />
            <Input label="Experience Max (years)" type="number" min={0} value={form.experienceMax} onChange={e => setForm({ ...form, experienceMax: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Salary Min (₹/month)" type="number" value={form.salaryMin} onChange={e => setForm({ ...form, salaryMin: e.target.value })} />
            <Input label="Salary Max (₹/month)" type="number" value={form.salaryMax} onChange={e => setForm({ ...form, salaryMax: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--navy)] mb-1.5">Job Description</label>
            <textarea
              value={form.jobDescription}
              onChange={e => setForm({ ...form, jobDescription: e.target.value })}
              rows={3}
              required
              placeholder="Describe the role, responsibilities, and expectations..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
            />
          </div>

          <SkillTags label="Required Skills" value={form.skills} onChange={skills => setForm({ ...form, skills })} suggestions={commonSkills} placeholder="Type a skill and press Enter..." />

          <Input label="Benefits" value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} placeholder="e.g. PF, ESI, annual bonus" />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Joining Timeline"
              options={[
                { value: 'Immediate', label: 'Immediate' }, { value: 'Within 15 days', label: 'Within 15 days' },
                { value: 'Within 1 month', label: 'Within 1 month' }, { value: 'Flexible', label: 'Flexible' },
              ]}
              value={form.joiningTimeline}
              onChange={e => setForm({ ...form, joiningTimeline: e.target.value })}
            />
            <Input label="Application Deadline" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          </div>

          <Input label="Working Hours" value={form.workingHours} onChange={e => setForm({ ...form, workingHours: e.target.value })} placeholder="e.g. 9 AM - 6 PM, 6-day week" />

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--navy)]">
              <input type="checkbox" checked={form.accommodationProvided} onChange={e => setForm({ ...form, accommodationProvided: e.target.checked })} className="w-4 h-4" />
              Accommodation Provided
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--navy)]">
              <input type="checkbox" checked={form.transportationProvided} onChange={e => setForm({ ...form, transportationProvided: e.target.checked })} className="w-4 h-4" />
              Transportation Provided
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handlePostJob} disabled={saving} variant="success">{saving ? 'Posting...' : 'Post Job (Auto-Approved)'}</Button>
            <Button variant="ghost" onClick={() => { setForm(emptyForm); setShowPostModal(false); }}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
