import { ChevronLeft, ChevronRight } from 'lucide-react';

export function pageCountOf(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Page numbers to show, with gaps marked: 1 … 4 5 6 … 12.
 * Short lists show every page.
 */
export function pageWindow(page: number, pageCount: number): Array<number | '…'> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const keep = new Set([1, pageCount, page - 1, page, page + 1].filter(p => p >= 1 && p <= pageCount));
  const sorted = Array.from(keep).sort((a, b) => a - b);
  const out: Array<number | '…'> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Noun for the count, e.g. "jobs" or "applicants". */
  label?: string;
}

/**
 * Numbered pager. Phones get Previous / "Page x of y" / Next. Desktop gets page numbers.
 * Renders nothing when everything fits on one page.
 */
export default function Pagination({ page, pageSize, total, onPageChange, label = 'results' }: PaginationProps) {
  if (total <= pageSize) return null;
  const pageCount = pageCountOf(total, pageSize);
  const current = Math.min(Math.max(1, page), pageCount);
  const from = (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);

  const arrow = 'inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E7E2D9] bg-white text-[var(--navy)] transition-colors hover:border-[var(--orange)] hover:text-[var(--orange)] disabled:opacity-40 disabled:pointer-events-none';

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs text-[var(--charcoal)]">
        Showing <span className="font-bold text-[var(--navy)]">{from}–{to}</span> of <span className="font-bold text-[var(--navy)]">{total}</span> {label}
      </p>

      <div className="flex items-center gap-1.5">
        <button type="button" className={arrow} onClick={() => onPageChange(current - 1)} disabled={current === 1} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {pageWindow(current, pageCount).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="px-1.5 text-sm text-slate-400" aria-hidden="true">…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === current ? 'page' : undefined}
                className={`min-w-9 h-9 px-3 rounded-xl text-sm font-bold border transition-colors ${
                  p === current
                    ? 'bg-[var(--navy)] text-white border-[var(--navy)] shadow-sm'
                    : 'bg-white text-[var(--charcoal)] border-[#E7E2D9] hover:border-[var(--orange)] hover:text-[var(--orange)]'
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <span className="sm:hidden px-3 text-sm font-bold text-[var(--navy)]">Page {current} of {pageCount}</span>

        <button type="button" className={arrow} onClick={() => onPageChange(current + 1)} disabled={current === pageCount} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
