import { Link } from 'react-router-dom';
import {
  MapPin, IndianRupee, ShieldCheck, Bookmark, ArrowRight,
  CheckCircle, GraduationCap, Users,
} from 'lucide-react';

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
  return `${months}mo ago`;
}

function money(v: string) {
  const n = parseInt(v || '0', 10);
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
  return `₹${n}`;
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
  const isFresh = isNewListing(job.createdAt);

  const matchColor = matchScore == null ? ''
    : matchScore >= 80 ? 'bg-[rgba(13,96,74,0.08)] border-[rgba(13,96,74,0.25)] text-[var(--green)]'
    : matchScore >= 60 ? 'bg-[rgba(241,90,36,0.08)] border-[rgba(241,90,36,0.22)] text-[var(--orange)]'
    : matchScore >= 40 ? 'bg-amber-50 border-amber-200 text-amber-700'
    : 'bg-slate-50 border-slate-200 text-slate-500';

  const SaveButton = (
    <button
      onClick={e => onToggleSave(job.id, e)}
      title={isSaved ? 'Remove from saved' : 'Save job'}
      className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[10px] border transition-colors ${
        isSaved
          ? 'bg-[var(--orange)]/10 border-[var(--orange)]/25 text-[var(--orange)]'
          : 'border-[#E7E2D9] text-slate-400 hover:text-[var(--navy)] hover:bg-[var(--bg-warm)]'
      }`}
    >
      <Bookmark size={15} className={isSaved ? 'fill-[var(--orange)]' : ''} />
    </button>
  );

  const ApplyButton = isApplied ? (
    <span className="dash-status dash-status--success flex-shrink-0 whitespace-nowrap">
      <CheckCircle size={12} /> Applied
    </span>
  ) : (
    <button
      onClick={e => onApply(job, e)}
      className="dash-btn dash-btn-primary dash-btn--compact flex-shrink-0 whitespace-nowrap"
    >
      Apply Now <ArrowRight size={13} />
    </button>
  );

  const metaLine = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-[var(--charcoal)] font-medium">
      <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-slate-400" />{job.city}{job.state ? `, ${job.state}` : ''}</span>
      <span className="text-[#D8D2C6]">·</span>
      <span className="font-bold text-[var(--green)] inline-flex items-center gap-0.5"><IndianRupee size={11} />{money(job.salaryMin)}–{money(job.salaryMax)}/mo</span>
      <span className="text-[#D8D2C6]">·</span>
      <span>{job.employmentType}</span>
      <span className="text-[#D8D2C6]">·</span>
      <span>{job.experienceRequired}</span>
    </div>
  );

  const titleRow = (
    <div className="flex items-center gap-2 flex-wrap">
      <Link to={`/jobs/${job.id}`} className="font-bold text-[15px] text-[var(--navy)] hover:text-[var(--orange)] transition-colors leading-snug break-words min-w-0">
        {job.jobTitle}
      </Link>
      {job.isVerified !== false && <ShieldCheck size={13} className="text-[var(--green)] flex-shrink-0" />}
      {isFresh && (
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--purple)] bg-[var(--purple)]/10 border border-[var(--purple)]/20 px-1.5 py-0.5 rounded-full">
          New
        </span>
      )}
    </div>
  );

  const skillsRow = job.skillsRequired.length > 0 && (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {job.skillsRequired.slice(0, view === 'grid' ? 3 : 4).map(skill => (
        <span key={skill} className="px-2 py-0.5 bg-[var(--bg-warm)] border border-[#EFEAE1] text-[var(--charcoal)] rounded-md text-[11px] font-semibold max-w-[160px] truncate">
          {skill}
        </span>
      ))}
      {job.skillsRequired.length > (view === 'grid' ? 3 : 4) && (
        <span className="px-2 py-0.5 text-slate-400 rounded-md text-[11px] font-semibold">
          +{job.skillsRequired.length - (view === 'grid' ? 3 : 4)} more
        </span>
      )}
    </div>
  );

  if (view === 'grid') {
    return (
      <div className="dash-surface flex flex-col h-full hover:border-[#D8D2C6] hover:shadow-sm transition-all">
        <div className="p-5 flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="dash-avatar">{job.companyName.charAt(0)}</div>
            {SaveButton}
          </div>

          {titleRow}
          <p className="text-[13px] text-[var(--charcoal)] font-semibold mt-0.5 truncate">{job.companyName}</p>

          <div className="mt-3">{metaLine}</div>

          <p className="text-[12.5px] text-[var(--charcoal)] leading-relaxed mt-3 line-clamp-2">
            {job.jobDescription}
          </p>

          {skillsRow}

          {matchScore != null && (
            <div className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg border text-[11.5px] font-extrabold ${matchColor}`}>
              {matchScore}% Match
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-[#EFEAE1] flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
            <Users size={12} /> {job.numberOfOpenings} openings · {timeAgo(job.createdAt)}
          </span>
          {ApplyButton}
        </div>
      </div>
    );
  }

  return (
    <div className="dash-row px-4 sm:px-5 py-4 items-start sm:items-center flex-col sm:flex-row gap-3">
      <div className="flex items-start gap-3.5 min-w-0 w-full sm:w-auto sm:flex-1">
        <div className="dash-avatar flex-shrink-0">{job.companyName.charAt(0)}</div>
        <div className="min-w-0 flex-1">
          {titleRow}
          <p className="text-[13px] text-[var(--charcoal)] font-semibold mt-0.5 truncate">
            {job.companyName}
          </p>
          <div className="mt-1.5">{metaLine}</div>
          {skillsRow}
        </div>

        {matchScore != null && (
          <div className={`hidden sm:flex flex-shrink-0 flex-col items-center justify-center w-14 h-14 rounded-xl border text-center ${matchColor}`} title="Match score based on your skills, experience, salary expectation and location">
            <span className="text-sm font-extrabold leading-none">{matchScore}%</span>
            <span className="text-[8px] font-bold uppercase tracking-wide mt-0.5">Match</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-shrink-0 justify-between sm:justify-end pl-[52px] sm:pl-0 min-w-0">
        <span className="text-[11px] text-slate-400 hidden md:inline-flex items-center gap-1 mr-1 min-w-0 max-w-[150px] truncate">
          <GraduationCap size={12} className="flex-shrink-0" />
          <span className="truncate">{job.qualificationRequired || 'Any'} · {timeAgo(job.createdAt)}</span>
        </span>
        {SaveButton}
        {ApplyButton}
      </div>
    </div>
  );
}
