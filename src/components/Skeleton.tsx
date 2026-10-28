export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} aria-hidden="true" />;
}

/**
 * Placeholder in the shape of a dashboard: top bar, greeting, a highlight card, metric tiles
 * and a list. Matching the real layout means nothing jumps around when the data arrives.
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg-warm)]" role="status" aria-busy="true" aria-label="Loading your dashboard">
      <div className="h-[calc(56px+env(safe-area-inset-top,0px))] md:h-16 pt-[env(safe-area-inset-top,0px)] bg-white border-b border-[#E7E2D9]">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-24 hidden sm:block" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2.5 flex-1">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-7 w-3/4 max-w-[280px]" />
            <Skeleton className="h-3.5 w-2/3 max-w-[320px]" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl hidden sm:block" />
        </div>

        <Skeleton className="h-[120px] w-full rounded-2xl" />

        <div className="flex sm:grid sm:grid-cols-4 gap-3 overflow-hidden">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="min-w-[118px] flex-1 bg-white rounded-2xl p-4 space-y-2 border border-[#EFEAE1]">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#EFEAE1] divide-y divide-[#F3EFE7]">
          {[0, 1, 2].map(i => (
            <div key={i} className="p-4 sm:p-5 flex items-center gap-3.5">
              <Skeleton className="h-10 w-10 rounded-[10px] flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/2 sm:w-1/3" />
                <Skeleton className="h-3 w-3/4 sm:w-2/3" />
              </div>
              <Skeleton className="h-9 w-20 rounded-xl hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden" role="status" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3.5 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
