import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, RotateCw } from 'lucide-react';

// Small shared pieces for the admin "detail" pages (employer, recruiter, job)

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1.5 h-9 pr-3 -ml-1 pl-1 rounded-full text-sm font-semibold text-[var(--charcoal)] hover:text-[var(--navy)] hover:bg-white transition-colors"
    >
      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> {children}
    </Link>
  );
}

/** Label + value cell. Empty values show a quiet dash instead of "N/A", "undefined" or a bare comma */
export function InfoItem({ label, value, href, external }: { label: string; value?: ReactNode; href?: string; external?: boolean }) {
  const empty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-[var(--charcoal)] font-semibold">{label}</p>
      {empty ? (
        <p className="text-sm font-semibold text-slate-400 mt-0.5">—</p>
      ) : href ? (
        <a
          href={href}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
          className="block text-sm font-semibold text-[var(--orange)] hover:underline mt-0.5 truncate"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-semibold text-[var(--navy)] mt-0.5 break-words">{value}</p>
      )}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-40 rounded-full bg-slate-200/70 animate-pulse" />
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-1/2 rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-1/4 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3">
        {[0, 1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
      </div>
    </div>
  );
}

export function DetailProblem({ title, body, backTo, backLabel, onRetry }: { title: string; body: string; backTo: string; backLabel: string; onRetry?: () => void }) {
  return (
    <div className="max-w-md mx-auto text-center py-16 px-4 dash-enter">
      <span className="inline-flex w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 items-center justify-center border border-amber-100">
        <AlertTriangle size={24} />
      </span>
      <p className="mt-4 text-lg font-extrabold text-[var(--navy)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--charcoal)]">{body}</p>
      <div className="mt-5 flex justify-center gap-2">
        {onRetry && (
          <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-[var(--navy)] text-white text-sm font-bold active:scale-[0.97] transition">
            <RotateCw size={14} /> Try again
          </button>
        )}
        <Link to={backTo} className="inline-flex items-center h-10 px-4 rounded-full border border-slate-300 text-sm font-bold text-[var(--navy)] hover:bg-white">
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

export const fmtDate = (v?: string | null) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const payText = (min?: number | null, max?: number | null) => {
  const a = Number(min) || 0;
  const b = Number(max) || 0;
  const f = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  if (!a && !b) return 'Pay not disclosed';
  if (a && b && a !== b) return `${f(a)} – ${f(b)}/month`;
  if (a && b) return `${f(a)}/month`;
  return a ? `${f(a)}+/month` : `Up to ${f(b)}/month`;
};

export const candidateStatusVariant = (s?: string): 'default' | 'success' | 'warning' | 'info' | 'danger' =>
  s === 'Placed' ? 'success' : s === 'Contacted' ? 'warning' : s === 'Inactive' ? 'danger' : s === 'Interviewed' ? 'default' : 'info';
