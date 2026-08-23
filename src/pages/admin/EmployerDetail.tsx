import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Users } from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import {
  getEmployerByUserId, getJobsByEmployer, getAllJobSkills, getCandidatesReferredByEmployer,
} from '../../lib/supabase/data';

export default function EmployerDetail() {
  const { id } = useParams<{ id: string }>();
  const [employer, setEmployer] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobSkills, setJobSkills] = useState<Record<string, string[]>>({});
  const [referredCandidates, setReferredCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      const [employerData, employerJobs, candidates] = await Promise.all([
        getEmployerByUserId(id),
        getJobsByEmployer(id),
        getCandidatesReferredByEmployer(id),
      ]);
      setEmployer(employerData);
      setJobs(employerJobs);
      setReferredCandidates(candidates);
      const skills = await getAllJobSkills((employerJobs || []).map((j: any) => j.id));
      setJobSkills(skills);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="text-center py-16 text-[var(--charcoal)]">Loading employer...</div>;
  }

  if (!employer) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--charcoal)]">Employer not found.</p>
        <Link to="/admin/employers" className="text-[var(--orange)] font-semibold text-sm mt-2 inline-block">Back to Employers</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/employers" className="inline-flex items-center gap-1 text-sm text-[var(--charcoal)] hover:text-[var(--navy)]">
        <ArrowLeft size={16} /> Back to Employers
      </Link>

      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#0D604A]/10 text-[var(--green)] rounded-xl flex items-center justify-center">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--navy)]">{employer.company_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default">{employer.industry || 'N/A'}</Badge>
              {employer.verified && <Badge variant="success">Verified</Badge>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          <div><p className="text-xs text-[var(--charcoal)] font-medium">Contact Person</p><p className="text-sm font-semibold text-[var(--navy)]">{employer.contact_name}</p></div>
          <div><p className="text-xs text-[var(--charcoal)] font-medium">Email</p><p className="text-sm font-semibold text-[var(--navy)]">{employer.contact_email}</p></div>
          <div><p className="text-xs text-[var(--charcoal)] font-medium">Phone</p><p className="text-sm font-semibold text-[var(--navy)]">{employer.contact_phone}</p></div>
          <div><p className="text-xs text-[var(--charcoal)] font-medium">Company Size</p><p className="text-sm font-semibold text-[var(--navy)]">{employer.company_size || 'N/A'}</p></div>
          <div><p className="text-xs text-[var(--charcoal)] font-medium">Year Established</p><p className="text-sm font-semibold text-[var(--navy)]">{employer.year_established || 'N/A'}</p></div>
          <div><p className="text-xs text-[var(--charcoal)] font-medium">Website</p><p className="text-sm font-semibold text-[var(--navy)]">{employer.website || 'N/A'}</p></div>
          <div><p className="text-xs text-[var(--charcoal)] font-medium">GST Number</p><p className="text-sm font-semibold text-[var(--navy)]">{employer.gst_number || 'N/A'}</p></div>
          <div><p className="text-xs text-[var(--charcoal)] font-medium">Location</p><p className="text-sm font-semibold text-[var(--navy)]">{employer.city}, {employer.state}</p></div>
          <div><p className="text-xs text-[var(--charcoal)] font-medium">Referral Code</p><p className="text-sm font-semibold text-[var(--navy)]">{employer.referral_code}</p></div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-[var(--navy)] mb-3">Job Postings ({jobs.length})</h3>
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <div key={job.id} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--navy)]">{job.job_title}</p>
                  <p className="text-xs text-[var(--charcoal)] mt-0.5">{job.number_of_openings || 1} openings · {job.employment_type} · {job.city}</p>
                </div>
                <Badge variant={job.status === 'Open' ? 'success' : job.status === 'Pending' ? 'warning' : 'default'}>{job.status}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(jobSkills[job.id] || []).map((s: string) => <Badge key={s} variant="info" className="text-[10px]">{s}</Badge>)}
              </div>
              <p className="text-xs font-semibold text-[var(--green)] mt-1.5">Salary: ₹{Number(job.salary_min || 0).toLocaleString()} - ₹{Number(job.salary_max || 0).toLocaleString()}/month</p>
            </div>
          ))}
          {jobs.length === 0 && <p className="text-sm text-[var(--charcoal)]">No job postings yet</p>}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-[var(--navy)] mb-3 flex items-center gap-2">
          <Users size={18} className="text-[var(--orange)]" /> Candidates Referred by This Employer ({referredCandidates.length})
        </h3>
        <div className="divide-y divide-slate-100">
          {referredCandidates.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="font-semibold text-sm text-[var(--navy)]">{c.profile_name || 'Unnamed candidate'}</p>
                <p className="text-xs text-[var(--charcoal)]">{c.profile_phone} · Registered {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <Badge variant="info">{c.status}</Badge>
            </div>
          ))}
          {referredCandidates.length === 0 && <p className="text-sm text-[var(--charcoal)]">No candidates referred yet.</p>}
        </div>
      </Card>
    </div>
  );
}
