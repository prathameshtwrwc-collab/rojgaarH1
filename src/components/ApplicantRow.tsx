import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Star, XCircle } from 'lucide-react';
import { Badge, Button } from './ui';

/** Newest applications first. Applicants without a date keep their order at the end. */
export function sortLatestFirst(a: any, b: any) {
  return new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime();
}

interface ApplicantRowProps {
  applicant: any;
  matchScore: number;
  onView: () => void;
  onShortlist: (e: React.MouseEvent) => void;
  onReject: (e: React.MouseEvent) => void;
}

/**
 * One applicant, compact by default: name, experience, location, match and actions.
 * "Show details" adds skills, qualification and expected salary.
 */
export default function ApplicantRow({ applicant, matchScore, onView, onShortlist, onReject }: ApplicantRowProps) {
  const [open, setOpen] = useState(false);
  const isShortlisted = applicant.applicationStatus === 'shortlisted';
  const isRejected = applicant.applicationStatus === 'rejected';
  const name = `${applicant.firstName} ${applicant.lastName}`.trim() || 'Applicant';
  const initials = `${applicant.firstName?.[0] || ''}${applicant.lastName?.[0] || ''}` || '?';

  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-4 bg-[var(--white)] transition-shadow hover:shadow-md ${
        isRejected ? 'opacity-60 border-red-200' : isShortlisted ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="dash-avatar w-10 h-10 text-[12px] flex-shrink-0">{initials}</div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <p className="font-bold text-sm text-[var(--navy)] truncate">{name}</p>
            {isShortlisted && (
              <span className="hidden sm:inline text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 whitespace-nowrap">★ Shortlisted</span>
            )}
            {isRejected && (
              <span className="hidden sm:inline text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full whitespace-nowrap">Rejected</span>
            )}
          </div>
          <p className="text-xs text-[var(--charcoal)] truncate">
            {applicant.totalExperience} • {applicant.location || 'Location not set'}
          </p>
        </div>

        <div className="text-center px-2.5 py-1 rounded-lg bg-[var(--orange)]/10 text-[var(--orange)] flex-shrink-0">
          <p className="text-base font-extrabold leading-tight">{matchScore}%</p>
          <p className="text-[9px] font-bold uppercase tracking-wider">Match</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--orange)] hover:underline"
        >
          {open ? <>Hide details <ChevronUp size={14} /></> : <>Show details <ChevronDown size={14} /></>}
        </button>

        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" onClick={onView} className="text-xs">
            <Eye size={12} className="mr-1" /> View
          </Button>
          <Button size="sm" variant="secondary" onClick={onShortlist} className="text-xs">
            <Star size={12} className="mr-1" /> {isShortlisted ? 'Shortlisted' : 'Shortlist'}
          </Button>
          <button type="button" onClick={onReject} title="Reject" aria-label="Reject applicant" className="p-2 text-slate-400 hover:text-red-600 rounded-lg">
            <XCircle size={16} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-[#EFEAE1] space-y-2.5 text-xs text-[var(--charcoal)]">
          {applicant.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {applicant.skills.slice(0, 8).map((s: string) => (
                <Badge key={s} variant="info" className="text-[10px]">{s}</Badge>
              ))}
            </div>
          ) : (
            <p>No skills listed.</p>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <p><span className="text-slate-400">Qualification:</span> <span className="font-semibold text-[var(--navy)]">{applicant.qualification || '—'}</span></p>
            <p><span className="text-slate-400">Expected:</span> <span className="font-semibold text-[var(--navy)]">{Number(applicant.expectedSalary) ? `₹${Number(applicant.expectedSalary).toLocaleString()}/mo` : '—'}</span></p>
            <p className="col-span-2"><span className="text-slate-400">Status:</span> <span className="font-semibold text-[var(--navy)] capitalize">{String(applicant.applicationStatus || 'applied').replace(/_/g, ' ')}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
