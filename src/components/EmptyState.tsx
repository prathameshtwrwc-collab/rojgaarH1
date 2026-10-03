import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}

/** A calm, consistent "nothing here yet" panel. Says what is missing and what to do next. */
export default function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="dash-enter flex flex-col items-center text-center px-6 py-10 rounded-2xl border border-dashed border-[#D8D2C6] bg-[var(--bg-warm)]/60">
      <span className="w-12 h-12 rounded-2xl bg-white border border-[#E7E2D9] shadow-sm flex items-center justify-center text-[var(--orange)]">
        {icon}
      </span>
      <p className="mt-3 text-sm font-extrabold text-[var(--navy)]">{title}</p>
      {body && <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--charcoal)]">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
