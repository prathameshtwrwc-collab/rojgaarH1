import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from './ui';
import Pagination from './Pagination';

const PAGE_SIZE = 8;
import ApplicantRow, { sortLatestFirst } from './ApplicantRow';

type StatusChip = 'all' | 'shortlisted' | 'rejected' | 'request_cv';

const CHIPS: { id: StatusChip; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'request_cv', label: 'CV requested' },
  { id: 'rejected', label: 'Rejected' },
];

interface AllApplicantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  applicants: any[];
  matchFor: (candidateId: string) => number;
  onView: (applicant: any) => void;
  onShortlist: (applicant: any, e: React.MouseEvent) => void;
  onReject: (applicant: any, e: React.MouseEvent) => void;
}

/** Every applicant for one job, newest first, with search and status filters. */
export function AllApplicantsModal({ isOpen, onClose, jobTitle, applicants, matchFor, onView, onShortlist, onReject }: AllApplicantsModalProps) {
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<StatusChip>('all');
  const [page, setPage] = useState(1);

  const counts = useMemo(() => ({
    all: applicants.length,
    shortlisted: applicants.filter(a => a.applicationStatus === 'shortlisted').length,
    request_cv: applicants.filter(a => a.applicationStatus === 'request_cv').length,
    rejected: applicants.filter(a => a.applicationStatus === 'rejected').length,
  }), [applicants]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applicants
      .filter(a => chip === 'all' || a.applicationStatus === chip)
      .filter(a => {
        if (!q) return true;
        const haystack = [`${a.firstName} ${a.lastName}`, a.location, a.state, ...(a.skills || [])].join(' ').toLowerCase();
        return haystack.includes(q);
      })
      .sort(sortLatestFirst);
  }, [applicants, chip, query]);

  // Back to the first page whenever the list changes
  useEffect(() => { setPage(1); }, [chip, query]);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`All applicants · ${jobTitle}`} size="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, location or skill"
            className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-[var(--navy)] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter applicants">
          {CHIPS.map(c => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={chip === c.id}
              onClick={() => setChip(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                chip === c.id ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'bg-white text-[var(--charcoal)] border-slate-200 hover:border-slate-300'
              }`}
            >
              {c.label} ({counts[c.id]})
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--charcoal)]">
            {applicants.length === 0 ? 'No candidate has applied to this job yet.' : 'No applicants match these filters.'}
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[var(--charcoal)]">{visible.length} of {applicants.length} applicants, newest first</p>
            {pageItems.map(applicant => (
              <ApplicantRow
                key={applicant.applicationId || applicant.id}
                applicant={applicant}
                matchScore={matchFor(applicant.id)}
                onView={() => onView(applicant)}
                onShortlist={e => onShortlist(applicant, e)}
                onReject={e => onReject(applicant, e)}
              />
            ))}
          </div>
        )}
        <Pagination page={currentPage} pageSize={PAGE_SIZE} total={visible.length} onPageChange={setPage} label="applicants" />
      </div>
    </Modal>
  );
}

export default AllApplicantsModal;
