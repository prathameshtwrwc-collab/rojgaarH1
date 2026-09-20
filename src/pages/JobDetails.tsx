import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, MapPin, Briefcase, IndianRupee, Clock, ShieldCheck, Bookmark, Building2,
  CheckCircle, Mail, Phone, UserCheck, AlertCircle, Share2, Link2, Calendar, GraduationCap,
  Home, Car, Sparkles,
} from 'lucide-react';
import { Badge, Button, Modal, Toast } from '../components/ui';
import PageLoader from '../components/PageLoader';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import {
  getJobPostingById, getOpenJobsPublic, getJobSkills,
  getJobRequirements, getJobResponsibilities, createApplication, getAllEmployers, getAllJobSkills,
} from '../lib/supabase/data';
import { computeMatch } from '../lib/matching';
import { JobCard, JobCardData, timeAgo } from '../components/JobCard';
import { useAppTranslation } from '../hooks/useAppTranslation';

function formatExperience(min: number | null, max: number | null): string {
  if (min != null && max != null) return `${min}-${max} years`;
  if (min != null) return `${min}+ years`;
  return 'Not specified';
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
  const { user } = useAuth();
  const { candidate, profile, applications, refresh } = useDatabase();
  const isCandidateLoggedIn = user?.role === 'candidate';

  const [job, setJob] = useState<any | null>(null);
  const [employer, setEmployer] = useState<any | null>(null);
  const [similarRaw, setSimilarRaw] = useState<any[]>([]);
  const [employersMap, setEmployersMap] = useState<Map<string, any>>(new Map());
  const [similarSkillsMap, setSimilarSkillsMap] = useState<Record<string, string[]>>({});
  const [jobLoading, setJobLoading] = useState(true);
  const [rawJobForMatch, setRawJobForMatch] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    setJobLoading(true);
    window.scrollTo(0, 0);
    (async () => {
      const [rawJob, allOpenJobs, allEmployers] = await Promise.all([getJobPostingById(id), getOpenJobsPublic(), getAllEmployers()]);
      const empMap = new Map(allEmployers.map((e: any) => [e.id, e]));
      setEmployersMap(empMap);
      if (!rawJob) { setJob(null); setJobLoading(false); return; }
      const [skills, requirements, responsibilities] = await Promise.all([
        getJobSkills(id),
        getJobRequirements(id),
        getJobResponsibilities(id),
      ]);
      const employerData = empMap.get(rawJob.employer_id);
      setJob(mapJob(rawJob, skills, requirements, responsibilities, employerData?.company_name || 'Company'));
      setEmployer(mapEmployer(employerData));
      setRawJobForMatch({ ...rawJob, skills_required: skills });

      const others = allOpenJobs.filter((j: any) => j.id !== id);
      const similar = others
        .filter((j: any) => j.city === rawJob.city || j.qualification_required === rawJob.qualification_required)
        .slice(0, 3);
      setSimilarRaw(similar);
      const skillsMap = await getAllJobSkills(similar.map((j: any) => j.id));
      setSimilarSkillsMap(skillsMap);
      setJobLoading(false);
    })();
  }, [id]);

  const appliedJobIds = new Set(applications.map((a: any) => a.job_id));

  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rojgaarhai_saved_jobs') || '[]');
      return id ? saved.includes(id) : false;
    } catch {
      return false;
    }
  });

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const matchScore = useMemo(() => {
    if (!isCandidateLoggedIn || !candidate || !rawJobForMatch) return undefined;
    return computeMatch(candidate, rawJobForMatch).score;
  }, [isCandidateLoggedIn, candidate, rawJobForMatch]);

  if (jobLoading) {
    return <PageLoader label="Loading job details..." />;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[var(--bg-warm)] py-16 flex items-center justify-center" style={{ fontFamily: "var(--font)" }}>
        <div className="dash-surface dash-surface--pad text-center max-w-md">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[var(--navy)]">Job Opening Not Found</h2>
          <p className="text-[var(--charcoal)] text-sm mt-1">The job listing you are looking for may have been closed or removed.</p>
          <Link to="/jobs"><Button className="mt-4">Back to All Jobs</Button></Link>
        </div>
      </div>
    );
  }

  const isApplied = appliedJobIds.has(job.id);

  const toggleBookmark = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('rojgaarhai_saved_jobs') || '[]');
      let updated: string[];
      if (saved.includes(job.id)) {
        updated = saved.filter((i: string) => i !== job.id);
        setIsSaved(false);
        setToastMessage('Removed from saved jobs');
      } else {
        updated = [...saved, job.id];
        setIsSaved(true);
        setToastMessage('Saved job successfully!');
      }
      localStorage.setItem('rojgaarhai_saved_jobs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: `${job.jobTitle} at ${job.companyName}`, text: `Check out this job opening on ${t('app.name')}`, url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setToastMessage('Job link copied to clipboard!');
    } catch {
      setToastMessage('Could not copy link. Please copy the URL manually.');
    }
  };

  const handleApplyClick = () => {
    if (!isCandidateLoggedIn) {
      navigate('/login/candidate');
      return;
    }
    setShowApplyModal(true);
  };

  const handleConfirmApply = async () => {
    if (!user) return;
    setApplying(true);
    try {
      await createApplication({ candidate_id: user.id, job_id: job.id, status: 'applied' } as any);
      await refresh();
      setShowApplyModal(false);
      setToastMessage(`Application for ${job.jobTitle} submitted successfully!`);
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

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
    <div className="min-h-screen bg-[var(--bg-warm)] pb-24 lg:pb-10 transition-colors duration-300" style={{ fontFamily: "var(--font)" }}>
      <div className="dash-container py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--charcoal)] mb-5 flex-wrap">
          <Link to="/" className="hover:text-[var(--orange)] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/jobs" className="hover:text-[var(--orange)] transition-colors">Jobs</Link>
          <ChevronRight size={12} />
          <span className="text-[var(--navy)] font-semibold truncate max-w-[200px]">{job.jobTitle}</span>
        </div>

        {/* ═══ TOP HERO BANNER ═══ */}
        <div className="dash-surface dash-surface--pad mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0">
              <div className="dash-avatar w-14 h-14 !rounded-2xl text-xl flex-shrink-0">
                {job.companyName.charAt(0)}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-[28px] font-extrabold text-[var(--navy)] tracking-tight">
                    {job.jobTitle}
                  </h1>
                  {job.isVerified !== false && (
                    <span className="dash-status dash-status--success">
                      <ShieldCheck size={13} /> Verified
                    </span>
                  )}
                  {matchScore != null && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[12px] font-extrabold ${matchColor}`}>
                      <Sparkles size={12} /> {matchScore}% Match
                    </span>
                  )}
                </div>

                <p className="text-[15px] font-semibold text-[var(--charcoal)] flex items-center gap-2">
                  <Building2 size={16} className="text-[var(--orange)]" />
                  {job.companyName}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[var(--charcoal)] mt-3">
                  <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" />{job.city}, {job.state}</span>
                  <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-slate-400" />{job.employmentType}</span>
                  <span className="flex items-center gap-1.5 text-[var(--green)] font-bold"><IndianRupee size={14} />₹{parseInt(job.salaryMin).toLocaleString()} - ₹{parseInt(job.salaryMax).toLocaleString()} / mo</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" />{job.numberOfOpenings} openings</span>
                  <span className="flex items-center gap-1.5 text-slate-400">Posted {timeAgo(job.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={handleShare}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-[#E7E2D9] text-slate-500 hover:bg-[var(--bg-warm)] transition-colors"
                title="Share this job"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={toggleBookmark}
                className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-colors ${
                  isSaved ? 'bg-[var(--orange)]/10 border-[var(--orange)]/30 text-[var(--orange)]' : 'border-[#E7E2D9] text-slate-500 hover:bg-[var(--bg-warm)]'
                }`}
                title={isSaved ? 'Saved' : 'Save Job'}
              >
                <Bookmark size={18} className={isSaved ? 'fill-[var(--orange)]' : ''} />
              </button>
              <ApplyCTA />
            </div>
          </div>
        </div>

        {/* ═══ MAIN CONTENT GRID ═══ */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            <div className="dash-surface dash-surface--pad">
              <h2 className="text-[17px] font-bold text-[var(--navy)] mb-3 flex items-center gap-2">
                <Briefcase size={18} className="text-[var(--orange)]" /> Job Overview & Description
              </h2>
              <p className="text-[var(--charcoal)] leading-relaxed text-[14px] whitespace-pre-line">
                {job.jobDescription}
              </p>
            </div>

            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="dash-surface dash-surface--pad">
                <h2 className="text-[17px] font-bold text-[var(--navy)] mb-3">Key Responsibilities</h2>
                <ul className="space-y-2.5 text-[14px] text-[var(--charcoal)]">
                  {job.responsibilities.map((resp: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] mt-[7px] flex-shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="dash-surface dash-surface--pad">
              <h2 className="text-[17px] font-bold text-[var(--navy)] mb-3">Requirements & Qualifications</h2>
              {job.requirements && job.requirements.length > 0 ? (
                <ul className="space-y-2.5 text-[14px] text-[var(--charcoal)] mb-4">
                  {job.requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={15} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[14px] text-[var(--charcoal)] mb-4">
                  Candidate should have {job.qualificationRequired} qualification with minimum {job.experienceRequired} of relevant practical experience.
                </p>
              )}

              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">Required Technical & Soft Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill: string) => (
                  <Badge key={skill} variant="info" className="px-3 py-1 text-[12.5px] font-medium">{skill}</Badge>
                ))}
              </div>
            </div>

            <div className="dash-surface dash-surface--pad">
              <h2 className="text-[17px] font-bold text-[var(--navy)] mb-3">Benefits, Perks & Facilities</h2>
              <p className="text-[14px] text-[var(--charcoal)] mb-4">
                {job.benefits || 'Provident Fund (PF), Employee State Insurance (ESI), annual performance bonus.'}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${job.accommodationProvided ? 'bg-[rgba(13,96,74,0.06)] border-[rgba(13,96,74,0.2)]' : 'bg-[var(--bg-warm)] border-[#E7E2D9]'}`}>
                  <Home size={18} className={job.accommodationProvided ? 'text-[var(--green)]' : 'text-slate-400'} />
                  <div>
                    <p className={`text-[12.5px] font-bold ${job.accommodationProvided ? 'text-[var(--green)]' : 'text-slate-500'}`}>Accommodation</p>
                    <p className="text-[13px] font-semibold text-[var(--navy)]">{job.accommodationProvided ? 'Provided by employer' : 'Not provided'}</p>
                  </div>
                </div>
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${job.transportationProvided ? 'bg-[rgba(13,96,74,0.06)] border-[rgba(13,96,74,0.2)]' : 'bg-[var(--bg-warm)] border-[#E7E2D9]'}`}>
                  <Car size={18} className={job.transportationProvided ? 'text-[var(--green)]' : 'text-slate-400'} />
                  <div>
                    <p className={`text-[12.5px] font-bold ${job.transportationProvided ? 'text-[var(--green)]' : 'text-slate-500'}`}>Transportation</p>
                    <p className="text-[13px] font-semibold text-[var(--navy)]">{job.transportationProvided ? 'Provided by employer' : 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-[92px] self-start">

            <div className="dash-surface dash-surface--pad">
              <h3 className="text-[15px] font-bold text-[var(--navy)] mb-3 pb-3 border-b border-[#EFEAE1]">Job Overview</h3>
              <div className="space-y-3 text-[13.5px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 flex items-center gap-1.5"><GraduationCap size={13} />Education</span>
                  <span className="font-semibold text-[var(--navy)] text-right">{job.qualificationRequired || 'Any'}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Experience</span>
                  <span className="font-semibold text-[var(--navy)]">{job.experienceRequired}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Joining Timeline</span>
                  <span className="font-semibold text-[var(--navy)]">{job.joiningTimeline || 'Immediate'}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Working Hours</span>
                  <span className="font-semibold text-[var(--navy)] text-right">{job.workingHours || 'Standard Shift'}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">Openings</span>
                  <span className="font-semibold text-[var(--navy)]">{job.numberOfOpenings} Vacancies</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={13} />Posted</span>
                  <span className="font-semibold text-[var(--navy)]">{job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                </div>
                {job.deadline && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Deadline</span>
                    <span className="font-semibold text-amber-600">{job.deadline}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="dash-surface dash-surface--pad">
              <h3 className="text-[15px] font-bold text-[var(--navy)] mb-3">Hiring Recruiter Contact</h3>
              <div className="space-y-2.5 text-[13.5px]">
                <p className="font-bold text-[var(--navy)] flex items-center gap-2">
                  <UserCheck size={15} className="text-[var(--orange)]" />
                  {job.recruiterName || employer?.contactName || 'HR Team'}
                </p>
                <p className="text-[var(--charcoal)] flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  {job.recruiterEmail || employer?.contactEmail || 'hr@company.com'}
                </p>
                <p className="text-[var(--charcoal)] flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  {job.recruiterPhone || employer?.contactPhone || '+91-9800000000'}
                </p>
              </div>
            </div>

            {employer && (
              <div className="dash-surface dash-surface--pad">
                <h3 className="text-[15px] font-bold text-[var(--navy)] mb-3">About {employer.companyName}</h3>
                <p className="text-[12.5px] text-[var(--charcoal)] mb-3 leading-relaxed">
                  Established in {employer.yearEstablished}, {employer.companyName} is a leading organization in the {employer.industry} sector with {employer.companySize} employees.
                </p>
                <div className="text-[12.5px] space-y-1.5 text-[var(--charcoal)]">
                  <p><span className="text-slate-400">Address:</span> {employer.address}, {employer.city}</p>
                  {employer.website && (
                    <p><span className="text-slate-400">Website:</span> <a href={`https://${employer.website}`} target="_blank" rel="noreferrer" className="text-[var(--orange)] hover:underline">{employer.website}</a></p>
                  )}
                </div>
              </div>
            )}

            {/* Mobile share/save row (desktop CTAs live in the hero banner) */}
            <div className="flex lg:hidden items-center gap-2.5">
              <button onClick={handleShare} className="flex-1 dash-btn dash-btn-secondary justify-center">
                <Link2 size={15} /> Share
              </button>
              <button
                onClick={toggleBookmark}
                className={`flex-1 dash-btn justify-center ${isSaved ? 'bg-[var(--orange)]/10 text-[var(--orange)] border border-[var(--orange)]/30' : 'dash-btn-secondary'}`}
              >
                <Bookmark size={15} className={isSaved ? 'fill-[var(--orange)]' : ''} /> {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* ═══ SIMILAR JOBS ═══ */}
        {similarJobs.length > 0 && (
          <div className="pt-8 border-t border-[#E7E2D9]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[var(--navy)]">Similar Job Openings</h2>
              <Link to="/jobs" className="text-[13px] font-semibold text-[var(--orange)] hover:underline">View All →</Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarJobs.map(simJob => (
                <JobCard
                  key={simJob.id}
                  job={simJob}
                  view="grid"
                  isSaved={false}
                  isApplied={appliedJobIds.has(simJob.id)}
                  onToggleSave={() => {}}
                  onApply={() => navigate(`/jobs/${simJob.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ MOBILE STICKY APPLY BAR ═══ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7E2D9] p-3 flex items-center gap-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          onClick={toggleBookmark}
          className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl border ${isSaved ? 'bg-[var(--orange)]/10 border-[var(--orange)]/30 text-[var(--orange)]' : 'border-[#E7E2D9] text-slate-500'}`}
        >
          <Bookmark size={19} className={isSaved ? 'fill-[var(--orange)]' : ''} />
        </button>
        <div className="flex-1"><ApplyCTA full /></div>
      </div>

      {/* ═══ APPLY CONFIRMATION MODAL ═══ */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Confirm Application" size="md">
        {user && (
          <div className="space-y-5">
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-xs text-[var(--orange)] font-semibold uppercase tracking-wider">Applying For</p>
              <h3 className="text-lg font-bold text-[var(--navy)] mt-0.5">{job.jobTitle}</h3>
              <p className="text-sm font-medium text-[var(--charcoal)] flex items-center gap-1 mt-1">
                <Building2 size={14} /> {job.companyName} • {job.city}, {job.state}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm space-y-2">
              <p><span className="text-slate-400">Candidate Name:</span> <strong className="text-[var(--navy)]">{profile?.full_name || 'N/A'}</strong></p>
              <p><span className="text-slate-400">Email:</span> <span className="text-[var(--navy)]">{user.email}</span></p>
              <p><span className="text-slate-400">Qualification:</span> <span className="text-[var(--navy)]">{candidate?.qualification || 'N/A'}</span></p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowApplyModal(false)}>Cancel</Button>
              <Button onClick={handleConfirmApply} disabled={applying} variant="success" className="gap-1.5">
                <UserCheck size={16} /> {applying ? 'Submitting...' : 'Confirm Application'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {toastMessage && <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />}
    </div>
  );
}
