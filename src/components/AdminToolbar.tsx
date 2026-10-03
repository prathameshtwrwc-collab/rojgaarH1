import { ReactNode } from 'react';
import { Search, X } from 'lucide-react';

export function AdminSearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#D8D2C6] bg-white text-sm text-[var(--navy)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/40 focus:border-[var(--orange)] transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-[var(--navy)] hover:bg-slate-100"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export interface TabOption {
  value: string;
  label: string;
  count?: number;
}

export function SegmentedTabs({
  options,
  value,
  onChange,
}: {
  options: TabOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto bg-[var(--bg-warm)] border border-[#E7E2D9] rounded-xl p-1 gap-1">
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`h-9 px-3.5 rounded-lg text-[13px] font-semibold whitespace-nowrap inline-flex items-center gap-2 transition-colors ${
              active ? 'bg-white text-[var(--navy)] shadow-sm border border-[#E7E2D9]' : 'text-[var(--charcoal)] hover:text-[var(--navy)]'
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold ${active ? 'bg-[var(--orange)]/10 text-[var(--orange)]' : 'bg-slate-200/70 text-[var(--charcoal)]'}`}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function AdminToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 flex-wrap">{children}</div>
  );
}
