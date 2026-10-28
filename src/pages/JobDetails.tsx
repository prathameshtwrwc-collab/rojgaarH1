import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, MapPin, Briefcase, ShieldCheck, Bookmark, Building2,
  CheckCircle, UserCheck, AlertCircle, Share2, Calendar, GraduationCap,
  Home, Car, Sparkles, Factory, Tag, User, Globe, Clock, RefreshCw,
} from 'lucide-react';
import { haptic } from '../lib/haptics';
import { Badge, Button, Modal, Toast } from '../components/ui';
import PageLoader from '../components/PageLoader';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import {
  getJobPostingById, getOpenJobsPublic, getJobSkills,
  getJobRequirements, getJobResponsibilities, createApplication, getAllEmployers, getAllJobSkills,
} from '../lib/supabase/data';
import { computeMatch } from '../lib/matching';
import { JobCard, JobCardData, timeAgo, payRange } from '../components/JobCard';
import { useAppTranslation } from '../hooks/useAppTranslation';

function formatExperience(min: number | null, max: number | null): string {
  if (min != null && max != null) return `${min}-${max} years`;
  if (min != null) return `${min}+ years`;
  return 'Not specified';
}

const SAVED_KEY = 'rojgaarhai_saved_jobs';

function readSaved(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function writeSaved(ids: string[]) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(ids)); } catch { /* storage full or blocked */ }
}

/** "₹15,000 – ₹20,000" in full, without ever showing "₹0". */
function fullPay(min: string, max: string) {
  const lo = parseInt(min || '0', 10) || 0;
  const hi = parseInt(max || '0', 10) || 0;
  const f = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  if (lo && hi && lo !== hi) return `${f(lo)} – ${f(hi)}`;
  if (lo || hi) return f(lo || hi);
  return 'Not disclosed';
}

function niceDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function mapEmployer(e: any) {
  if (!e) return null;
  return {
    id: e.id,
    companyName: e.company_name,
    industry: e.industry || '',
    companySize: e.company_size || '',
    yearEstablished: e.year_established || '',
    website: e.website || '',
    address: e.address || '',
    city: e.city || '',
    state: e.state || '',
    contactName: e.contact_name || '',
    contactEmail: e.contact_email || '',
    contactPhone: e.contact_phone || '',
  };
}

function mapJob(job: any, skills: string[], requirements: string[], responsibilities: string[], companyName: string) {
  return {
    id: job.id,
    employerId: job.employer_id,
    jobTitle: job.job_title,
    companyName,
    city: job.city || '',
    state: job.state || '',
    address: job.address || '',
    sector: job.sector || '',
    subsector: job.subsector || '',
    salaryMin: String(job.salary_min ?? 0),
    salaryMax: String(job.salary_max ?? 0),
    employmentType: job.employment_type,
    qualificationRequired: job.qualification_required || '',
    experienceRequired: formatExperience(job.experience_min_years, job.experience_max_years),
    skillsRequired: skills,
    jobDescription: job.job_description,
    numberOfOpenings: job.number_of_openings,
    createdAt: job.created_at,
    isVerified: job.is_verified,
    status: job.status,
    benefits: job.benefits,
    joiningTimeline: job.joining_timeline,
    workingHours: job.working_hours,
    accommodationProvided: job.accommodation_provided,
    transportationProvided: job.transportation_provided,
    deadline: job.deadline,
    recruiterName: job.recruiter_name,
    recruiterEmail: job.recruiter_email,
    recruiterPhone: job.recruiter_phone,
    requirements,
    responsibilities,
  };
}

export default function JobDetails() {
  const { t } = useAppTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { candidate, profile, applications, refresh } = useDatabase();
  const isCandidateLoggedIn = user?.role === 'candidate';

  const [job, setJob] = useState<any | null>(null);
  const [employer, setEmployer] = useState<any | null>(null);
  const [similarRaw, setSimilarRaw] = useState<any[]>([]);
  const [employersMap, setEmployersMap] = useState<Map<string, any>>(new Map());
  const [similarSkillsMap, setSimilarSkillsMap] = useState<Record<string, string[]>>({});
  const [jobLoading, setJobLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [rawJobForMatch, setRawJobForMatch] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setJobLoading(true);
    setLoadError(false);
    window.scrollTo(0, 0);
    (async () => {
      try {
        const [rawJob, allOpenJobs, allEmployers] = await Promise.all([getJobPostingById(id), getOpenJobsPublic(), getAllEmployers()]);
        if (cancelled) return;
        const empMap = new Map(allEmployers.map((e: any) => [e.id, e]));
        setEmployersMap(empMap);
        if (!rawJob) { setJob(null); return; }
        const [skills, requirements, responsibilities] = await Promise.all([
          getJobSkills(id),
          getJobRequirements(id),
          getJobResponsibilities(id),
        ]);
        if (cancelled) return;
        const employerData = empMap.get(rawJob.employer_id);
        setJob(mapJob(rawJob, skills, requirements, responsibilities, employerData?.company_name || 'Company'));
        setEmployer(mapEmployer(employerData));
        setRawJobForMatch({ ...rawJob, skills_required: skills });

        // Same city or same qualification first; top up with other open jobs so the row is never thin
        const others = allOpenJobs.filter((j: any) => j.id !== id);
        const close = others.filter((j: any) => j.city === rawJob.city || j.qualification_required === rawJob.qualification_required);
        const similar = [...close, ...others.filter((j: any) => !close.includes(j))].slice(0, 3);
        setSimilarRaw(similar);
        const skillsMap = await getAllJobSkills(similar.map((j: any) => j.id));
        if (!cancelled) setSimilarSkillsMap(skillsMap);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setJobLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, reloadKey]);

  const appliedJobIds = new Set(applications.map((a: any) => a.job_id));

  // Saved jobs live in this browser; re-read them whenever another job is opened
  const [savedIds, setSavedIds] = useState<string[]>(readSaved);
  useEffect(() => { setSavedIds(readSaved()); }, [id]);
  const isSaved = id ? savedIds.includes(id) : false;

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const matchDetail = useMemo(() => {
    if (!isCandidateLoggedIn || !candidate || !rawJobForMatch) return undefined;
    return computeMatch(candidate, rawJobForMatch);
  }, [isCandidateLoggedIn, candidate, rawJobForMatch]);
  const matchScore = matchDetail?.score;

  if (jobLoading) {
    return <PageLoader label="Loading job details..." />;
  }

  if (loadError || !job) {
    return (
      <div className="min-h-[70vh] bg-[var(--bg-warm)] py-16 px-4 flex items-center justify-center" style={{ fontFamily: "var(--font)" }}>
        <div className="dash-surface dash-surface--pad text-center max-w-md w-full dash-enter">
          <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${loadError ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
            {loadError ? <RefreshCw size={26} /> : <AlertCircle size={28} />}
          </div>
          <h2 className="text-xl font-bold text-[var(--navy)]">{loadError ? 'This job could not load' : 'This job is no longer listed'}</h2>
          <p className="text-[var(--charcoal)] text-sm mt-1">
            {loadError ? 'Check your internet connection and try again.' : 'It may have been filled, closed or removed by the employer.'}
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
            {loadError && <Button onClick={() => setReloadKey(k => k + 1)}><RefreshCw size={15} /> Try again</Button>}
            <Link to="/jobs"><Button variant={loadError ? 'ghost' : 'primary'} fullWidth>Browse open jobs</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const isApplied = appliedJobIds.has(job.id);

  const toggleSavedId = (jobId: string) => {
    haptic('select');
    const current = readSaved();
    const updated = current.includes(jobId) ? current.filter(i => i !== jobId) : [...current, jobId];
    writeSaved(updated);
    setSavedIds(updated);
    setToastMessage(updated.includes(jobId) ? 'Saved. Find it under Saved in your dashboard.' : 'Removed from your saved jobs');
  };
  const toggleBookmark = () => toggleSavedId(job.id);

  const handleShare = async () => {
    haptic('tap');
    const url = `${window.location.origin}/jobs/${job.id}`;
    const shareData = { title: `${job.jobTitle} at ${job.companyName}`, text: `${job.jobTitle} at ${job.companyName}: apply on ${t('app.name')}`, url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setToastMessage('Job link copied. Paste it anywhere to share.');
    } catch {
      setToastMessage('Could not copy the link. Please copy it from the address bar.');
    }
  };

  const goBack = () => {
    // Back to the search the person came from, or to all jobs when the page was opened directly
    if (window.history.length > 1 && location.key !== 'default') navigate(-1);
    else navigate('/jobs');
  };

  const handleApplyClick = () => {
    if (!isCandidateLoggedIn) {
      // Sign in, then come straight back to this job
      navigate('/login/candidate', { state: { from: { pathname: location.pathname } } });
      return;
    }
    haptic('tap');
    setShowApplyModal(true);
  };

  const handleConfirmApply = async () => {
    if (!user) return;
    setApplying(true);
    try {
      await createApplication({ candidate_id: user.id, job_id: job.id, status: 'applied' } as any);
      await refresh({ silent: true });
      setShowApplyModal(false);
      setToastMessage(`Applied to ${job.jobTitle}. Track its progress under Applied in your dashboard.`);
    } catch (err) {
      const message = (err as { message?: string } | null)?.message;
      setToastMessage(message ? `Could not submit your application: ${message}` : 'Could not submit your application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const pay = fullPay(job.salaryMin, job.salaryMax);
  const place = [job.address, job.city, job.state].filter(Boolean).join(', ');
  // Only facts the employer actually gave; nothing is filled in on their behalf
  const aboutCompany = employer
    ? [
        employer.industry && `${employer.companyName} works in ${employer.industry}`,
        employer.yearEstablished && `established in ${employer.yearEstablished}`,
        employer.companySize && `with a team of ${employer.companySize} people`,
      ].filter(Boolean).join(', ')
    : '';

  const similarJobs: JobCardData[] = similarRaw.map((j: any) => ({
    id: j.id,
    employerId: j.employer_id,
    jobTitle: j.job_title,
    companyName: employersMap.get(j.employer_id)?.company_name || 'Company',
    city: j.city || '',
    state: j.state || '',
    employmentType: j.employment_type,
    salaryMin: String(j.salary_min ?? 0),
    salaryMax: String(j.salary_max ?? 0),
    qualificationRequired: j.qualification_required || '',
    experienceRequired: formatExperience(j.experience_min_years, j.experience_max_years),
    skillsRequired: similarSkillsMap[j.id] || [],
    jobDescription: j.job_description,
    numberOfOpenings: j.number_of_openings,
    createdAt: j.created_at,
    isVerified: j.is_verified,
    status: j.status,
  }));

  const matchColor = matchScore == null ? ''
    : matchScore >= 80 ? 'bg-[rgba(13,96,74,0.08)] border-[rgba(13,96,74,0.25)] text-[var(--green)]'
    : matchScore >= 60 ? 'bg-[rgba(241,90,36,0.08)] border-[rgba(241,90,36,0.22)] text-[var(--orange)]'
    : matchScore >= 40 ? 'bg-amber-50 border-amber-200 text-amber-700'
    : 'bg-slate-50 border-slate-200 text-slate-500';

  const ApplyCTA = ({ full = false }: { full?: boolean }) => isApplied ? (
    <div className={`px-5 py-3 bg-[rgba(13,96,74,0.06)] border border-[rgba(13,96,74,0.2)] text-[var(--green)] rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${full ? 'w-full' : ''}`}>
      <CheckCircle size={17} /> Applied Successfully
    </div>
  ) : (
    <Button size="lg" onClick={handleApplyClick} className={`shadow-lg gap-2 bg-[var(--orange)] ${full ? 'w-full' : ''}`}>
      Apply Now <UserCheck size={18} />
    </Button>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-warm)] pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] lg:pb-10 transition-colors duration-300" style={{ fontFamily: "var(--font)" }}>
      <div className="dash-container py-4 sm:py-6 dash-enter">

        {/* Phones: one clear way back. Desktop: breadcrumb. */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:hidden">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1 -ml-2 h-10 pl-1.5 pr-3 rounded-full text-[14px] font-bold text-[var(--navy)] active:bg-white"
          >
            <ChevronLeft size={20} /> Jobs
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share this job"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E7E2D9] text-[var(--navy)] active:scale-90 transition-transform"
          >
            <Share2 size={17} />
          </button>
        </div>
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[12.5px] text-[var(--charcoal)] mb-5 flex-wrap">
          <Link to="/" className="hover:text-[var(--orange)] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/jobs" className="hover:text-[var(--orange)] transition-colors">Jobs</Link>
          <ChevronRight size={12} />
          <span className="text-[var(--navy)] font-semibold truncate max-w-[260px]" aria-current="page">{job.jobTitle}</span>
        </nav>

        {/* ═══ TOP HERO BANNER ═══ */}
        <div className="dash-surface dash-surface--pad mb-5 sm:mb-6 relative overflow-hidden">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--orange)] via-[#F7A072] to-[#1C2B52]" />
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="dash-avatar w-14 h-14 !rounded-2xl text-xl flex-shrink-0" aria-hidden="true">
                {job.companyName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 w-full">
                <h1 className="text-[22px] sm:text-[28px] font-extrabold text-[var(--navy)] tracking-tight leading-tight break-words">
                  {job.jobTitle}
                </h1>
                <p className="mt-1 text-[14.5px] sm:text-[15px] font-semibold text-[var(--charcoal)] flex items-center gap-1.5 min-w-0">
                  <Building2 size={15} className="text-[var(--orange)] flex-shrink-0" />
                  <span className="truncate">{job.companyName}</span>
                </p>

                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {job.isVerified !== false && (
                    <span className="dash-status dash-status--success">
                      <ShieldCheck size={13} /> Verified employer
                    </span>
                  )}
                  {matchScore != null && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[12px] font-extrabold ${matchColor}`}>
                      <Sparkles size={12} /> {matchScore}% match{matchDetail && !matchDetail.confident ? ' · limited data' : ''}
                    </span>
                  )}
                  <span className="ap-pill"><Clock size={11} className="text-slate-400" /><span>Posted {timeAgo(job.createdAt)}</span></span>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-4 gap-y-1.5 text-[13px] text-[var(--charcoal)] mt-3">
                  {place && <span className="flex items-start gap-1.5 min-w-0"><MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" /><span className="break-words">{place}</span></span>}
                  {job.employmentType && <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-slate-400" />{job.employmentType}</span>}
                  {job.sector && (
                    <span className="flex items-center gap-1.5 min-w-0"><Factory size={14} className="text-slate-400 flex-shrink-0" /><span className="truncate">{job.sector}{job.subsector ? ` · ${job.subsector}` : ''}</span></span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mt-4 sm:mt-5">
                  <div className="col-span-2 sm:col-span-1 rounded-xl bg-[var(--green)]/5 border border-[var(--green)]/20 px-3.5 py-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--green)]">Monthly pay</p>
                    <p className="mt-0.5 text-[16px] sm:text-[15px] font-extrabold text-[var(--navy)] leading-tight tabular-nums">{pay}</p>
                  </div>
                  <div className="rounded-xl bg-[var(--bg-warm)] border border-[#EFEAE1] px-3.5 py-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--charcoal)]">Experience</p>
                    <p className="mt-0.5 text-[15px] font-extrabold text-[var(--navy)] leading-tight">{job.experienceRequired && job.experienceRequired !== 'Not specified' ? job.experienceRequired : 'Any'}</p>
                  </div>
                  <div className="rounded-xl bg-[var(--bg-warm)] border border-[#EFEAE1] px-3.5 py-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--charcoal)]">Openings</p>
                    <p className="mt-0.5 text-[15px] font-extrabold text-[var(--navy)] leading-tight tabular-nums">{job.numberOfOpenings || 1}</p>
                  </div>
                  {matchScore != null ? (
                    <div className={`col-span-2 sm:col-span-1 rounded-xl border px-3.5 py-3 ${matchColor}`}>
                      <p className="text-[10.5px] font-bold uppercase tracking-wider">Your match</p>
                      <p className="mt-0.5 text-[15px] font-extrabold leading-tight tabular-nums">{matchScore}%</p>
                      {matchDetail && !matchDetail.confident && <p className="text-[10.5px] opacity-80 mt-0.5">Limited profile data</p>}
                    </div>
                  ) : !user ? (
                    <button
                      type="button"
                      onClick={handleApplyClick}
                      className="col-span-2 sm:col-span-1 text-left rounded-xl border border-dashed border-[var(--orange)]/40 bg-[var(--orange)]/5 px-3.5 py-3 hover:bg-[var(--orange)]/10 transition-colors"
                    >
                      <p className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--orange)]">Your match</p>
                      <p className="mt-0.5 text-[13.5px] font-extrabold text-[var(--navy)] leading-tight">Sign in to see it</p>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={handleShare}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-[#E7E2D9] text-slate-500 hover:bg-[var(--bg-warm)] transition-colors"
                title="Share this job"
                aria-label="Share this job"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={toggleBookmark}
                aria-pressed={isSaved}
                className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-colors ${
                  isSaved ? 'bg-[var(--orange)]/10 border-[var(--orange)]/30 text-[var(--orange)]' : 'border-[#E7E2D9] text-slate-500 hover:bg-[var(--bg-warm)]'
                }`}
                title={isSaved ? 'Saved' : 'Save job'}
                aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
              >
                <Bookmark size={18} className={isSaved ? 'fill-[var(--orange)]' : ''} />
              </button>
              <ApplyCTA />
            </div>
          </div>
        </div>

        {/* ═══ MAIN CONTENT GRID ═══ */}
        <div className="grid lg:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-12 dash-enter dash-enter-d1">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6 min-w-0">

            {job.jobDescription && (
              <section className="dash-surface dash-surface--pad">
                <h2 className="text-[16px] sm:text-[17px] font-bold text-[var(--navy)] mb-3 flex items-center gap-2">
                  <Briefcase size={18} className="text-[var(--orange)]" /> About this job
                </h2>
                <p className="text-[var(--charcoal)] leading-relaxed text-[14px] whitespace-pre-line break-words">
                  {job.jobDescription}
                </p>
              </section>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <section className="dash-surface dash-surface--pad">
                <h2 className="text-[16px] sm:text-[17px] font-bold text-[var(--navy)] mb-3">What you will do</h2>
                <ul className="space-y-2.5 text-[14px] text-[var(--charcoal)]">
                  {job.responsibilities.map((resp: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] mt-[7px] flex-shrink-0" />
                      <span className="break-words">{resp}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="dash-surface dash-surface--pad">
              <h2 className="text-[16px] sm:text-[17px] font-bold text-[var(--navy)] mb-3">Requirements</h2>
              {job.requirements && job.requirements.length > 0 ? (
                <ul className="space-y-2.5 text-[14px] text-[var(--charcoal)] mb-4">
                  {job.requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={15} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
                      <span className="break-words">{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2.5 text-[14px] text-[var(--charcoal)] mb-4">
                  <li className="flex items-start gap-2.5">
                    <GraduationCap size={15} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
                    <span>Education: <strong className="text-[var(--navy)]">{job.qualificationRequired || 'Any'}</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Briefcase size={15} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
                    <span>Experience: <strong className="text-[var(--navy)]">{job.experienceRequired && job.experienceRequired !== 'Not specified' ? job.experienceRequired : 'Freshers welcome'}</strong>
                      {job.subsector ? <> in a <strong className="text-[var(--navy)]">{job.subsector}</strong> role</> : null}
                    </span>
                  </li>
                </ul>
              )}

              {job.skillsRequired.length > 0 && (
                <>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.map((skill: string) => (
                      <Badge key={skill} variant="info" className="px-3 py-1 text-[12.5px] font-medium">{skill}</Badge>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="dash-surface dash-surface--pad">
              <h2 className="text-[16px] sm:text-[17px] font-bold text-[var(--navy)] mb-3">Benefits & facilities</h2>
              {job.benefits ? (
                <p className="text-[14px] text-[var(--charcoal)] mb-4 whitespace-pre-line break-words">{job.benefits}</p>
              ) : (
                <p className="text-[13px] text-slate-400 mb-4">The employer has not listed other benefits for this job.</p>
              )}

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {[
                  { on: job.accommodationProvided, icon: Home, label: 'Accommodation' },
                  { on: job.transportationProvided, icon: Car, label: 'Transport' },
                ].map(({ on, icon: Icon, label }) => (
                  <div key={label} className={`p-3 sm:p-3.5 rounded-xl border flex items-center gap-2.5 sm:gap-3 min-w-0 ${on ? 'bg-[rgba(13,96,74,0.06)] border-[rgba(13,96,74,0.2)]' : 'bg-[var(--bg-warm)] border-[#E7E2D9]'}`}>
                    <Icon size={18} className={`flex-shrink-0 ${on ? 'text-[var(--green)]' : 'text-slate-400'}`} />
                    <div className="min-w-0">
                      <p className={`text-[12.5px] font-bold ${on ? 'text-[var(--green)]' : 'text-slate-500'}`}>{label}</p>
                      <p className="text-[12.5px] sm:text-[13px] font-semibold text-[var(--navy)] truncate">{on ? 'Provided' : 'Not provided'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-5 sm:space-y-6 lg:sticky lg:top-[92px] self-start min-w-0">

            <section className="dash-surface dash-surface--pad">
              <h3 className="text-[15px] font-bold text-[var(--navy)] mb-1">Job at a glance</h3>
              <dl className="divide-y divide-[#F3EFE7] text-[13.5px]">
                {[
                  job.sector && { icon: Factory, k: 'Industry', v: job.sector },
                  job.subsector && { icon: Tag, k: 'Role', v: job.subsector },
                  { icon: GraduationCap, k: 'Education', v: job.qualificationRequired || 'Any' },
                  { icon: Briefcase, k: 'Experience', v: job.experienceRequired && job.experienceRequired !== 'Not specified' ? job.experienceRequired : 'Any' },
                  job.joiningTimeline && { icon: Clock, k: 'Joining', v: job.joiningTimeline },
                  job.workingHours && { icon: Clock, k: 'Working hours', v: job.workingHours },
                  { icon: User, k: 'Openings', v: `${job.numberOfOpenings || 1} ${(job.numberOfOpenings || 1) === 1 ? 'vacancy' : 'vacancies'}` },
                  { icon: Calendar, k: 'Posted', v: niceDate(job.createdAt) || 'Recently' },
                  job.deadline && { icon: Calendar, k: 'Apply by', v: niceDate(job.deadline), warn: true },
                ].filter(Boolean).map((row: any) => (
                  <div key={row.k} className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-slate-400 flex items-center gap-1.5 flex-shrink-0"><row.icon size={13} />{row.k}</dt>
                    <dd className={`font-semibold text-right min-w-0 break-words ${row.warn ? 'text-amber-600' : 'text-[var(--navy)]'}`}>{row.v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {job.recruiterName && (
              <section className="dash-surface dash-surface--pad">
                <h3 className="text-[15px] font-bold text-[var(--navy)] mb-3">Contact person</h3>
                <p className="flex items-center gap-2.5 font-semibold text-[var(--navy)] text-[13.5px]">
                  <span className="dash-avatar w-9 h-9 !rounded-full text-[12px]" aria-hidden="true">{job.recruiterName.charAt(0).toUpperCase()}</span>
                  {job.recruiterName}
                </p>
                <p className="mt-2 text-[12px] text-[var(--charcoal)]">Apply here and the hiring team will reach out to you.</p>
              </section>
            )}

            {employer && (
              <section className="dash-surface dash-surface--pad">
                <h3 className="text-[15px] font-bold text-[var(--navy)] mb-2">About {employer.companyName}</h3>
                {aboutCompany && (
                  <p className="text-[12.5px] text-[var(--charcoal)] mb-3 leading-relaxed">{aboutCompany}.</p>
                )}
                <div className="space-y-2 text-[12.5px] text-[var(--charcoal)]">
                  {(employer.city || employer.state) && (
                    <p className="flex items-start gap-2">
                      <MapPin size={13} className="text-slate-400 flex-shrink-0 mt-0.5" /> {[employer.address, employer.city, employer.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {employer.website && (
                    <a
                      href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[var(--orange)] hover:underline break-all"
                    >
                      <Globe size={13} className="flex-shrink-0" /> {employer.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  )}
                  {!aboutCompany && !employer.city && !employer.state && !employer.website && (
                    <p className="text-slate-400">The employer has not added company details yet.</p>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* ═══ SIMILAR JOBS ═══ */}
        {similarJobs.length > 0 && (
          <section className="pt-7 sm:pt-8 border-t border-[#E7E2D9]">
            <div className="ap-section-head">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--navy)]">More jobs like this</h2>
              <Link to="/jobs" className="ap-section-head__action hover:underline">View all <ChevronRight size={14} /></Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {similarJobs.map(simJob => (
                <JobCard
                  key={simJob.id}
                  job={simJob}
                  view="grid"
                  isSaved={savedIds.includes(simJob.id)}
                  isApplied={appliedJobIds.has(simJob.id)}
                  onToggleSave={(jobId) => toggleSavedId(jobId)}
                  onApply={() => navigate(`/jobs/${simJob.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ═══ MOBILE STICKY APPLY BAR ═══ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E2D9] px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_-12px_rgba(16,26,54,0.18)] animate-[ap-rise_480ms_cubic-bezier(0.16,1,0.3,1)_backwards]">
        <div className="flex items-center gap-2.5 max-w-2xl mx-auto">
          <button
            onClick={toggleBookmark}
            aria-pressed={isSaved}
            aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
            className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl border active:scale-90 transition-[transform,background-color,color] ${isSaved ? 'bg-[var(--orange)]/10 border-[var(--orange)]/30 text-[var(--orange)]' : 'border-[#E7E2D9] text-slate-500'}`}
          >
            <Bookmark size={19} className={isSaved ? 'fill-[var(--orange)]' : ''} />
          </button>
          <div className="min-w-0 flex-shrink hidden min-[400px]:block">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 leading-none">Pay / month</p>
            <p className="text-[14px] font-extrabold text-[var(--navy)] truncate mt-1 tabular-nums">{payRange(job.salaryMin, job.salaryMax)}</p>
          </div>
          <div className="flex-1 min-w-0"><ApplyCTA full /></div>
        </div>
      </div>

      {/* ═══ APPLY CONFIRMATION MODAL ═══ */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => { if (!applying) setShowApplyModal(false); }}
        title="Confirm your application"
        size="md"
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowApplyModal(false)} disabled={applying}>Cancel</Button>
            <Button onClick={handleConfirmApply} loading={applying} variant="success">
              {!applying && <UserCheck size={16} />} {applying ? 'Submitting…' : 'Confirm application'}
            </Button>
          </div>
        }
      >
        {user && (
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
              <p className="text-[11px] text-[var(--orange)] font-bold uppercase tracking-wider">Applying for</p>
              <h3 className="text-lg font-bold text-[var(--navy)] mt-0.5 break-words">{job.jobTitle}</h3>
              <p className="text-sm font-medium text-[var(--charcoal)] flex items-center gap-1.5 mt-1 min-w-0">
                <Building2 size={14} className="flex-shrink-0" /> <span className="truncate">{[job.companyName, [job.city, job.state].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}</span>
              </p>
            </div>

            <dl className="rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-100 text-sm">
              {[
                { k: 'Name', v: profile?.full_name || 'Not added' },
                { k: 'Qualification', v: candidate?.qualification || 'Not added' },
                { k: 'Experience', v: `${candidate?.total_experience_years ?? 0} yrs` },
              ].map(row => (
                <div key={row.k} className="bg-white px-4 py-2.5 min-w-0">
                  <dt className="text-[11px] text-slate-400">{row.k}</dt>
                  <dd className="font-semibold text-[var(--navy)] truncate">{row.v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-[var(--charcoal)] leading-relaxed">
              Your profile and resume go to {job.companyName}'s hiring team. Your phone number and email stay private.
            </p>
          </div>
        )}
      </Modal>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
