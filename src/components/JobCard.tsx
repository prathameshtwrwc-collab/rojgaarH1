import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, IndianRupee, ShieldCheck, Bookmark, ArrowRight,
  CheckCircle, GraduationCap, Users, Briefcase, Clock,
} from 'lucide-react';
import { haptic } from '../lib/haptics';

export interface JobCardData {
  id: string;
  employerId: string;
  jobTitle: string;
  companyName: string;
  city: string;
  state: string;
  salaryMin: string;
  salaryMax: string;
  employmentType: string;
  qualificationRequired: string;
  experienceRequired: string;
  skillsRequired: string[];
  jobDescription: string;
  numberOfOpenings: number;
  createdAt: string;
  isVerified: boolean;
  status?: string;
}

export function timeAgo(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (Number.isNaN(diffMs)) return 'Recently';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return days === 1 ? 'Yesterday' : `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function money(v: string) {
  const n = parseInt(v || '0', 10) || 0;
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
  return `₹${n}`;
}

/** "₹15K–20K", "₹15K+", "Up to ₹20K" or "Not disclosed": never "₹0–₹0". */
export function payRange(min: string, max: string) {
  const lo = parseInt(min || '0', 10) || 0;
  const hi = parseInt(max || '0', 10) || 0;
  if (lo && hi && lo !== hi) return `${money(min)}–${money(max).replace('₹', '')}`;
  if (lo && hi) return money(min);
  if (lo) return `${money(min)}+`;
  if (hi) return `Up to ${money(max)}`;
  return 'Not disclosed';
}

function isNewListing(dateStr?: string) {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 1000 * 60 * 60 * 48;
}

interface JobCardProps {
  job: JobCardData;
  view?: 'list' | 'grid';
  isSaved: boolean;
  isApplied: boolean;
  matchScore?: number;
  onToggleSave: (jobId: string, e: React.MouseEvent) => void;
  onApply: (job: JobCardData, e?: React.MouseEvent) => void;
}

export function JobCard({ job, view = 'list', isSaved, isApplied, matchScore, onToggleSave, onApply }: JobCardProps) {
  const navigate = useNavigate();
  const isFresh = isNewListing(job.createdAt);
  const pay = payRange(job.salaryMin, job.salaryMax);
  const place = [job.city, job.state].filter(Boolean).join(', ') || 'Location not set';
  const initial = (job.companyName || '?').trim().charAt(0).toUpperCase() || '?';
  const openJob = () => navigate(`/jobs/${job.id}`);

  const matchColor = matchScore == null ? ''
    : matchScore >= 80 ? 'bg-[rgba(13,96,74,0.08)] border-[rgba(13,96,74,0.25)] text-[var(--green)]'
    : matchScore >= 60 ? 'bg-[rgba(241,90,36,0.08)] border-[rgba(241,90,36,0.22)] text-[var(--orange)]'
    : matchScore >= 40 ? 'bg-amber-50 border-amber-200 text-amber-700'
    : 'bg-slate-50 border-slate-200 text-slate-500';

  // The card itself opens the job; its buttons must not also do that
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic('select');
    onToggleSave(job.id, e);
  };
  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onApply(job, e);
  };

  const SaveButton = (
    <button
      type="button"
      onClick={handleSave}
      title={isSaved ? 'Remove from saved' : 'Save job'}
      aria-label={isSaved ? `Remove ${job.jobTitle} from saved jobs` : `Save ${job.jobTitle}`}
      aria-pressed={isSaved}
      className={`flex-shrink-0 w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-full sm:rounded-[10px] border transition-[color,background-color,border-color,transform] active:scale-90 ${
        isSaved
          ? 'bg-[var(--orange)]/10 border-[var(--orange)]/25 text-[var(--orange)]'
          : 'border-[#E7E2D9] text-slate-400 hover:text-[var(--navy)] hover:bg-[var(--bg-warm)]'
      }`}
    >
      <Bookmark size={16} className={`transition-transform duration-300 ${isSaved ? 'fill-[var(--orange)] scale-110' : ''}`} />
    </button>
  );

  const ApplyButton = isApplied ? (
    <span className="dash-status dash-status--success flex-shrink-0 whitespace-nowrap">
      <CheckCircle size={12} /> Applied
    </span>
  ) : (
    <button
      type="button"
      onClick={handleApply}
      className="dash-btn dash-btn-primary dash-btn--compact flex-shrink-0 whitespace-nowrap"
    >
      Apply<span className="hidden sm:inline">&nbsp;Now</span> <ArrowRight size={13} />
    </button>
  );

  const titleRow = (
    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
      <Link
        to={`/jobs/${job.id}`}
        onClick={e => e.stopPropagation()}
        className="font-bold text-[15px] text-[var(--navy)] hover:text-[var(--orange)] transition-colors leading-snug break-words min-w-0"
      >
        {job.jobTitle}
      </Link>
      {job.isVerified !== false && <ShieldCheck size={14} className="text-[var(--green)] flex-shrink-0" aria-label="Verified employer" />}
      {isFresh && (
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--purple)] bg-[var(--purple)]/10 border border-[var(--purple)]/20 px-1.5 py-0.5 rounded-full">
          New
        </span>
      )}
    </div>
  );

  const metaPills = (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="ap-pill ap-pill--pay"><IndianRupee size={11} className="flex-shrink-0" /><span>{pay}{pay !== 'Not disclosed' ? '/mo' : ''}</span></span>
      <span className="ap-pill"><MapPin size={11} className="text-slate-400 flex-shrink-0" /><span>{place}</span></span>
      {job.employmentType && <span className="ap-pill"><Briefcase size={11} className="text-slate-400 flex-shrink-0" /><span>{job.employmentType}</span></span>}
      {job.experienceRequired && job.experienceRequired !== 'Not specified' && <span className="ap-pill"><span>{job.experienceRequired}</span></span>}
    </div>
  );

  const shownSkills = view === 'grid' ? 3 : 4;
  const skillsRow = job.skillsRequired.length > 0 && (
    <div className="flex flex-wrap gap-1.5">
      {job.skillsRequired.slice(0, shownSkills).map(skill => (
        <span key={skill} className="px-2 py-0.5 bg-white border border-[#EFEAE1] text-[var(--charcoal)] rounded-md text-[11px] font-semibold max-w-[160px] truncate">
          {skill}
        </span>
      ))}
      {job.skillsRequired.length > shownSkills && (
        <span className="px-1.5 py-0.5 text-slate-400 rounded-md text-[11px] font-semibold">
          +{job.skillsRequired.length - shownSkills} more
        </span>
      )}
    </div>
  );

  if (view === 'grid') {
    return (
      <article onClick={openJob} className="job-card dash-surface dash-surface--lift flex flex-col h-full">
        <div className="p-5 flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="dash-avatar" aria-hidden="true">{initial}</div>
            {SaveButton}
          </div>

          {titleRow}
          <p className="text-[13px] text-[var(--charcoal)] font-semibold mt-0.5 truncate">{job.companyName}</p>

          <div className="mt-3">{metaPills}</div>

          {job.jobDescription && (
            <p className="text-[12.5px] text-[var(--charcoal)] leading-relaxed mt-3 line-clamp-2">
              {job.jobDescription}
            </p>
          )}

          {skillsRow && <div className="mt-3">{skillsRow}</div>}

          {matchScore != null && (
            <div className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg border text-[11.5px] font-extrabold ${matchColor}`}>
              {matchScore}% Match
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-[#EFEAE1] flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 inline-flex items-center gap-1 min-w-0 truncate">
            <Users size={12} className="flex-shrink-0" /> {job.numberOfOpenings || 1} {job.numberOfOpenings === 1 ? 'opening' : 'openings'} · {timeAgo(job.createdAt)}
          </span>
          {ApplyButton}
        </div>
      </article>
    );
  }

  // Phone: a self-contained card (logo, title, save in the corner; pills; then time + Apply).
  // Desktop (sm+): one compact row, Save and Apply on the right.
  return (
    <article
      onClick={openJob}
      className="job-card px-4 pt-4 pb-3.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0 sm:hover:bg-[var(--bg-warm)] transition-colors"
    >
      <div className="flex items-start gap-3 min-w-0 sm:flex-1">
        <div className="dash-avatar flex-shrink-0" aria-hidden="true">{initial}</div>
        <div className="min-w-0 flex-1">
          {titleRow}
          <p className="text-[13px] text-[var(--charcoal)] font-semibold mt-0.5 truncate">
            {job.companyName}
          </p>
          <div className="mt-2">{metaPills}</div>
          {skillsRow && <div className="mt-2 hidden sm:block">{skillsRow}</div>}
        </div>

        {matchScore != null && (
          <div className={`hidden sm:flex flex-shrink-0 flex-col items-center justify-center w-14 h-14 rounded-xl border text-center ${matchColor}`} title="Match score based on your skills, experience, salary expectation and location">
            <span className="text-sm font-extrabold leading-none">{matchScore}%</span>
            <span className="text-[8px] font-bold uppercase tracking-wide mt-0.5">Match</span>
          </div>
        )}

        {/* Save sits in the card's corner on phones */}
        <div className="sm:hidden -mt-1 -mr-1">{SaveButton}</div>
      </div>

      {/* Phone footer: how well it matches (or when it was posted) + the action */}
      <div className="flex sm:hidden items-center justify-between gap-3 pt-3 border-t border-[#F3EFE7]">
        {matchScore != null ? (
          <span className={`inline-flex items-center px-2 py-1 rounded-lg border text-[11px] font-extrabold ${matchColor}`}>
            {matchScore}% match for you
          </span>
        ) : (
          <span className="text-[11.5px] text-slate-400 font-semibold inline-flex items-center gap-1 min-w-0 truncate">
            <Clock size={12} className="flex-shrink-0" /> {timeAgo(job.createdAt)}
            {job.numberOfOpenings > 1 && <> · {job.numberOfOpenings} openings</>}
          </span>
        )}
        {ApplyButton}
      </div>

      <div className="hidden sm:flex items-center gap-2 sm:flex-shrink-0 min-w-0">
        <span className="text-[11px] text-slate-400 hidden md:inline-flex items-center gap-1 mr-1 min-w-0 max-w-[150px] truncate">
          <GraduationCap size={12} className="flex-shrink-0" />
          <span className="truncate">{job.qualificationRequired || 'Any'} · {timeAgo(job.createdAt)}</span>
        </span>
        {SaveButton}
        {ApplyButton}
      </div>
    </article>
  );
}
