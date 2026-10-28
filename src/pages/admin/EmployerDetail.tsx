import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Users, BadgeCheck, ChevronRight, MapPin, Briefcase } from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { BackLink, InfoItem, DetailSkeleton, DetailProblem, fmtDate, payText, candidateStatusVariant } from '../../components/AdminDetailBits';
import {
  getEmployerByUserId, getJobsByEmployer, getAllJobSkills, getCandidatesReferredByEmployer,
} from '../../lib/supabase/data';

const jobVariant = (s: string) => (s === 'Open' ? 'success' : s === 'Pending' ? 'warning' : s === 'Rejected' ? 'danger' : 'default') as 'success' | 'warning' | 'danger' | 'default';

export default function EmployerDetail() {
  const { id } = useParams<{ id: string }>();
  const [employer, setEmployer] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobSkills, setJobSkills] = useState<Record<string, string[]>>({});
  const [referredCandidates, setReferredCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async (cancelled: () => boolean = () => false) => {
    if (!id) return;
    setLoading(true);
    setFailed(false);
    try {
      const [employerData, employerJobs, candidates] = await Promise.all([
        getEmployerByUserId(id),
        getJobsByEmployer(id),
        getCandidatesReferredByEmployer(id),
      ]);
      if (cancelled()) return;
      setEmployer(employerData);
      setJobs(employerJobs || []);
      setReferredCandidates(candidates || []);
      // Skills are a nice-to-have; the page still shows if they fail
      getAllJobSkills((employerJobs || []).map((j: any) => j.id))
        .then(skills => { if (!cancelled()) setJobSkills(skills); })
        .catch(() => {});
    } catch {
      if (!cancelled()) setFailed(true);
    } finally {
      if (!cancelled()) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let off = false;
    load(() => off);
    return () => { off = true; };
  }, [load]);

  if (loading) return <DetailSkeleton />;
  if (failed) {
    return <DetailProblem title="Could not load this company" body="Check your connection and try again." backTo="/admin/employers" backLabel="Back to Employers" onRetry={() => load()} />;
  }
  if (!employer) {
    return <DetailProblem title="Company not found" body="It may have been deleted, or the link is wrong." backTo="/admin/employers" backLabel="Back to Employers" />;
  }

  const website = employer.website ? (/^https?:\/\//i.test(employer.website) ? employer.website : `https://${employer.website}`) : '';
  const openJobs = jobs.filter(j => j.status === 'Open').length;
  const pendingJobs = jobs.filter(j => j.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <BackLink to="/admin/employers">Back to Employers</BackLink>

      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex-shrink-0 bg-[#0D604A]/10 text-[var(--green)] rounded-2xl flex items-center justify-center">
            <Building2 size={28} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--navy)] flex items-center gap-1.5 min-w-0">
              <span className="truncate">{employer.company_name || 'Unnamed company'}</span>
              {employer.verified && <BadgeCheck size={20} className="text-[var(--green)] flex-shrink-0" aria-label="Verified" />}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="default">{employer.industry || 'Industry not set'}</Badge>
              {employer.verified ? <Badge variant="success">Verified</Badge> : <Badge variant="warning">Not verified</Badge>}
              {employer.created_at && <span className="text-xs text-[var(--charcoal)]">Joined {fmtDate(employer.created_at)}</span>}
            </div>
          </div>
        </div>

        {/* At a glance */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            { label: 'Jobs posted', value: jobs.length },
            { label: 'Live now', value: openJobs },
            { label: 'Referred', value: referredCandidates.length },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-[var(--bg-warm)] border border-slate-200/70 px-3 py-2.5">
              <p className="text-xl font-extrabold text-[var(--navy)] tabular-nums">{s.value}</p>
              <p className="text-[11px] font-semibold text-[var(--charcoal)]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5 mt-6">
          <InfoItem label="Contact person" value={employer.contact_name} />
          <InfoItem label="Email" value={employer.contact_email} href={employer.contact_email ? `mailto:${employer.contact_email}` : undefined} />
          <InfoItem label="Phone" value={employer.contact_phone} href={employer.contact_phone ? `tel:${employer.contact_phone}` : undefined} />
          <InfoItem label="Company size" value={employer.company_size} />
          <InfoItem label="Year established" value={employer.year_established ? String(employer.year_established) : ''} />
          <InfoItem label="Website" value={employer.website} href={website || undefined} external />
          <InfoItem label="GST number" value={employer.gst_number} />
          <InfoItem label="Location" value={[employer.city, employer.state].filter(Boolean).join(', ')} />
          <InfoItem label="Referral code" value={employer.referral_code ? <span className="font-mono">{employer.referral_code}</span> : ''} />
        </div>
      </Card>

      <Card>
        <div className="flex items-end justify-between gap-3 mb-3">
          <h3 className="font-bold text-[var(--navy)]">Job postings <span className="text-[var(--charcoal)] font-semibold tabular-nums">({jobs.length})</span></h3>
          {pendingJobs > 0 && (
            <Link to="/admin/jobs" className="text-xs font-bold text-amber-700 hover:underline">{pendingJobs} awaiting approval</Link>
          )}
        </div>
        <div className="space-y-2.5">
          {jobs.map((job: any) => (
            <Link
              key={job.id}
              to={`/admin/jobs/${job.id}`}
              className="group block bg-slate-50 hover:bg-white rounded-xl p-3.5 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--navy)] truncate group-hover:text-[var(--orange)] transition-colors">{job.job_title}</p>
                  <p className="text-xs text-[var(--charcoal)] mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="inline-flex items-center gap-1"><Briefcase size={11} /> {job.number_of_openings || 1} {(job.number_of_openings || 1) === 1 ? 'opening' : 'openings'}</span>
                    {job.employment_type && <span>{job.employment_type}</span>}
                    {job.city && <span className="inline-flex items-center gap-1"><MapPin size={11} /> {job.city}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge variant={jobVariant(job.status)}>{job.status}</Badge>
                  <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              {(jobSkills[job.id] || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(jobSkills[job.id] || []).slice(0, 6).map((s: string) => <Badge key={s} variant="info" className="text-[10px]">{s}</Badge>)}
                  {(jobSkills[job.id] || []).length > 6 && <Badge className="text-[10px]">+{(jobSkills[job.id] || []).length - 6}</Badge>}
                </div>
              )}
              <p className="text-xs font-semibold text-[var(--green)] mt-1.5">{payText(job.salary_min, job.salary_max)}</p>
            </Link>
          ))}
          {jobs.length === 0 && <p className="text-sm text-[var(--charcoal)] py-2">No job postings yet.</p>}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-[var(--navy)] mb-3 flex items-center gap-2">
          <Users size={18} className="text-[var(--orange)]" /> Candidates referred <span className="text-[var(--charcoal)] font-semibold tabular-nums">({referredCandidates.length})</span>
        </h3>
        <div className="divide-y divide-slate-100">
          {referredCandidates.map((c: any) => (
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
          {referredCandidates.length === 0 && <p className="text-sm text-[var(--charcoal)] py-2">No candidates referred yet.</p>}
        </div>
      </Card>
    </div>
  );
}
