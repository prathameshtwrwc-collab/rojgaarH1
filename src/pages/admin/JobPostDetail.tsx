import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, IndianRupee, Search, Download, Building2, Users } from 'lucide-react';
import { Card, Badge, Select } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { getApplicationsForJob } from '../../lib/supabase/data';
import { exportToCsv } from '../../lib/csvExport';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
  applied: 'info', screening: 'warning', shortlisted: 'info', interview_scheduled: 'default',
  interviewed: 'default', selected: 'success', rejected: 'danger', withdrawn: 'default', joined: 'success',
};

const statusLabel = (s: string) => s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function JobPostDetail() {
  const { id } = useParams<{ id: string }>();
  const { jobs, employers, candidates, jobSkills } = useDatabase();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const job = jobs.find((j: any) => j.id === id);
  const employer = job ? employers.find((e: any) => e.id === job.employer_id) : null;
  const candidatesMap = new Map(candidates.map((c: any) => [c.id, c]));

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getApplicationsForJob(id).then(apps => { setApplications(apps); setLoading(false); });
  }, [id]);

  const applicants = applications
    .map((a: any) => ({ ...a, candidate: candidatesMap.get(a.candidate_id) }))
    .filter((a: any) => a.candidate);

  const filtered = applicants.filter((a: any) => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchSearch = !search ||
      (a.candidate.profile_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.candidate.profile_phone || '').includes(search);
    return matchStatus && matchSearch;
  });

  const handleExportCsv = () => {
    exportToCsv(`applicants-${job?.job_title || 'job'}`, filtered.map((a: any) => ({
      'Candidate Name': a.candidate.profile_name || 'Unnamed',
      Phone: a.candidate.profile_phone || '',
      Location: a.candidate.location || a.candidate.city || '',
      State: a.candidate.state || '',
      Qualification: a.candidate.qualification || '',
      Skills: a.candidate.skills || [],
      'Experience (yrs)': a.candidate.total_experience_years ?? '',
      'Expected Salary': a.candidate.expected_salary_min ?? '',
      'Application Status': statusLabel(a.status),
      'Applied On': a.applied_at ? a.applied_at.split('T')[0] : '',
      'Candidate ID': a.candidate_id,
    })));
  };

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--charcoal)]">Job not found.</p>
        <Link to="/admin/jobs" className="text-[var(--orange)] font-semibold text-sm mt-2 inline-block">Back to Job Postings</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/jobs" className="inline-flex items-center gap-1 text-sm text-[var(--charcoal)] hover:text-[var(--navy)]">
        <ArrowLeft size={16} /> Back to Job Postings
      </Link>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--orange)]/10 text-[var(--orange)] flex items-center justify-center flex-shrink-0">
              <Briefcase size={26} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--navy)]">{job.job_title}</h1>
              <p className="text-sm text-[var(--charcoal)] flex items-center gap-1 mt-1">
                <Building2 size={14} /> {employer?.company_name || 'Unknown Employer'}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--charcoal)] mt-2">
                <span className="flex items-center gap-1"><MapPin size={12} /> {job.city}, {job.state}</span>
                <span className="flex items-center gap-1"><IndianRupee size={12} /> {Number(job.salary_min || 0).toLocaleString()}-{Number(job.salary_max || 0).toLocaleString()}/mo</span>
                <span>{job.employment_type}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {(jobSkills[job.id] || []).map((s: string) => <Badge key={s} variant="info" className="text-[10px]">{s}</Badge>)}
              </div>
            </div>
          </div>
          <Badge variant={job.status === 'Open' ? 'success' : job.status === 'Pending' ? 'warning' : 'default'}>{job.status}</Badge>
        </div>
      </Card>

      <Card padding={false}>
        <div className="p-4 border-b border-slate-200 bg-[var(--bg-warm)]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-[var(--navy)] flex items-center gap-2">
            <Users size={18} className="text-[var(--orange)]" /> Applicants ({filtered.length})
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--charcoal)]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or phone..."
                className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[var(--orange)] focus:outline-none"
              />
            </div>
            <Select
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'applied', label: 'Applied' },
                { value: 'screening', label: 'Screening' },
                { value: 'shortlisted', label: 'Shortlisted' },
                { value: 'interview_scheduled', label: 'Interview Scheduled' },
                { value: 'interviewed', label: 'Interviewed' },
                { value: 'selected', label: 'Selected' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'joined', label: 'Joined' },
              ]}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            />
            <button onClick={handleExportCsv} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-[var(--navy)] hover:bg-slate-50 transition-colors">
              <Download size={15} /> CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-[var(--bg-warm)]">
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Candidate</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Location</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Experience</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Applied On</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a: any) => (
                <tr key={a.id} className="border-b border-slate-100/60 hover:bg-slate-100 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[var(--navy)]">{a.candidate.profile_name || 'Unnamed'}</p>
                    <p className="text-xs text-[var(--charcoal)]">{a.candidate.profile_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden sm:table-cell">{a.candidate.location || a.candidate.city || '—'}</td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden md:table-cell">{a.candidate.total_experience_years ?? 0} yrs</td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)]">{a.applied_at ? a.applied_at.split('T')[0] : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[a.status] || 'default'}>{statusLabel(a.status)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-[var(--charcoal)]"><Users size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No applicants found</p></div>
          )}
          {loading && (
            <div className="text-center py-12 text-[var(--charcoal)]"><p className="text-sm">Loading applicants...</p></div>
          )}
        </div>
      </Card>
    </div>
  );
}
