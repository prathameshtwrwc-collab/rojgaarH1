import { X } from 'lucide-react';
import { Toggle } from './ui';

export interface JobFilterState {
  jobTypes: string[];
  experience: string;
  salaryMin: string;
  salaryMax: string;
  education: string[];
  industries: string[];
  skills: string[];
  verifiedOnly: boolean;
  datePosted: string;
}

export const emptyFilters: JobFilterState = {
  jobTypes: [],
  experience: '',
  salaryMin: '',
  salaryMax: '',
  education: [],
  industries: [],
  skills: [],
  verifiedOnly: false,
  datePosted: '',
};

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Freelance'];

export const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Any Experience' },
  { value: 'fresher', label: 'Fresher (0-1 yr)' },
  { value: '1to3', label: '1 – 3 Years' },
  { value: '3plus', label: '3+ Years' },
];

export const EDUCATION_OPTIONS = [
  { value: '10th-12th', label: '10th / 12th Pass' },
  { value: 'ITI-Diploma', label: 'ITI / Diploma' },
  { value: 'Graduate', label: 'Graduate' },
  { value: 'Post-Graduate', label: 'Post-Graduate' },
];

export const DATE_POSTED_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '24h', label: 'Past 24 hours' },
  { value: '3d', label: 'Past 3 days' },
  { value: '7d', label: 'Past week' },
  { value: '30d', label: 'Past month' },
];

export const SALARY_PRESETS = [
  { label: 'Under ₹15K', min: '', max: '15000' },
  { label: '₹15K – ₹25K', min: '15000', max: '25000' },
  { label: '₹25K – ₹40K', min: '25000', max: '40000' },
  { label: '₹40K+', min: '40000', max: '' },
];

function countActive(f: JobFilterState): number {
  let n = f.jobTypes.length + f.education.length + f.industries.length + f.skills.length;
  if (f.experience) n++;
  if (f.salaryMin || f.salaryMax) n++;
  if (f.verifiedOnly) n++;
  if (f.datePosted) n++;
  return n;
}

export { countActive };

function toggleInArray(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-[#EFEAE1] last:border-b-0">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--charcoal)] mb-3">{title}</p>
      {children}
    </div>
  );
}

function CheckRow({ checked, label, count, onClick }: { checked: boolean; label: string; count?: number; onClick: () => void }) {
  return (
    <label className="flex items-center justify-between gap-2 py-1.5 cursor-pointer group">
      <span className="flex items-center gap-2.5 min-w-0">
        <span
          onClick={onClick}
          className={`w-[17px] h-[17px] rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-colors ${
            checked ? 'bg-[var(--orange)] border-[var(--orange)]' : 'border-[#D8D2C6] group-hover:border-[var(--orange)]'
          }`}
        >
          {checked && <span className="w-1.5 h-1.5 bg-white rounded-[1px]" />}
        </span>
        <span onClick={onClick} className="text-[13px] font-medium text-[var(--navy)] truncate">{label}</span>
      </span>
      {count != null && <span className="text-[11px] text-slate-400 flex-shrink-0">{count}</span>}
    </label>
  );
}

function RadioRow({ checked, label, onClick }: { checked: boolean; label: string; onClick: () => void }) {
  return (
    <label onClick={onClick} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <span className={`w-[17px] h-[17px] rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'border-[var(--orange)]' : 'border-[#D8D2C6] group-hover:border-[var(--orange)]'}`}>
        {checked && <span className="w-2 h-2 bg-[var(--orange)] rounded-full" />}
      </span>
      <span className="text-[13px] font-medium text-[var(--navy)]">{label}</span>
    </label>
  );
}

interface JobFiltersPanelProps {
  filters: JobFilterState;
  onChange: (patch: Partial<JobFilterState>) => void;
  industries: string[];
  skillOptions: string[];
  onReset: () => void;
}

export function JobFiltersPanel({ filters, onChange, industries, skillOptions, onReset }: JobFiltersPanelProps) {
  const active = countActive(filters);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[15px] font-extrabold text-[var(--navy)]">Filters</h3>
        {active > 0 && (
          <button onClick={onReset} className="text-[12px] font-bold text-[var(--orange)] hover:underline flex items-center gap-1">
            <X size={12} /> Clear ({active})
          </button>
        )}
      </div>

      <FilterSection title="Verified Employers">
        <Toggle label="Show verified only" checked={filters.verifiedOnly} onChange={v => onChange({ verifiedOnly: v })} />
      </FilterSection>

      <FilterSection title="Date Posted">
        {DATE_POSTED_OPTIONS.map(opt => (
          <RadioRow key={opt.value} checked={filters.datePosted === opt.value} label={opt.label} onClick={() => onChange({ datePosted: opt.value })} />
        ))}
      </FilterSection>

      <FilterSection title="Job Type">
        {JOB_TYPES.map(t => (
          <CheckRow key={t} checked={filters.jobTypes.includes(t)} label={t} onClick={() => onChange({ jobTypes: toggleInArray(filters.jobTypes, t) })} />
        ))}
      </FilterSection>

      <FilterSection title="Experience Level">
        {EXPERIENCE_OPTIONS.map(opt => (
          <RadioRow key={opt.value} checked={filters.experience === opt.value} label={opt.label} onClick={() => onChange({ experience: opt.value })} />
        ))}
      </FilterSection>

      <FilterSection title="Salary Range (₹/month)">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.salaryMin}
            onChange={e => onChange({ salaryMin: e.target.value })}
            className="w-full px-2.5 py-2 rounded-[10px] border border-[#D8D2C6] text-[13px] font-medium text-[var(--navy)] focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
          />
          <span className="text-slate-400 text-xs flex-shrink-0">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.salaryMax}
            onChange={e => onChange({ salaryMax: e.target.value })}
            className="w-full px-2.5 py-2 rounded-[10px] border border-[#D8D2C6] text-[13px] font-medium text-[var(--navy)] focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SALARY_PRESETS.map(p => {
            const isActive = filters.salaryMin === p.min && filters.salaryMax === p.max;
            return (
              <button
                key={p.label}
                onClick={() => onChange(isActive ? { salaryMin: '', salaryMax: '' } : { salaryMin: p.min, salaryMax: p.max })}
                className={`px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors ${
                  isActive ? 'bg-[var(--navy)] border-[var(--navy)] text-white' : 'border-[#D8D2C6] text-[var(--charcoal)] hover:border-[var(--navy)]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Education">
        {EDUCATION_OPTIONS.map(opt => (
          <CheckRow key={opt.value} checked={filters.education.includes(opt.value)} label={opt.label} onClick={() => onChange({ education: toggleInArray(filters.education, opt.value) })} />
        ))}
      </FilterSection>

      {industries.length > 0 && (
        <FilterSection title="Industry">
          <div className="max-h-44 overflow-y-auto pr-1" data-lenis-prevent>
            {industries.map(ind => (
              <CheckRow key={ind} checked={filters.industries.includes(ind)} label={ind} onClick={() => onChange({ industries: toggleInArray(filters.industries, ind) })} />
            ))}
          </div>
        </FilterSection>
      )}

      {skillOptions.length > 0 && (
        <FilterSection title="Top Skills">
          <div className="flex flex-wrap gap-1.5">
            {skillOptions.map(skill => {
              const isActive = filters.skills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => onChange({ skills: toggleInArray(filters.skills, skill) })}
                  className={`px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors ${
                    isActive ? 'bg-[var(--orange)]/10 border-[var(--orange)]/40 text-[var(--orange)]' : 'border-[#D8D2C6] text-[var(--charcoal)] hover:border-[var(--orange)]'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
    </div>
  );
}

interface ChipDef {
  key: string;
  label: string;
  onRemove: () => void;
}

export function buildFilterChips(filters: JobFilterState, onChange: (patch: Partial<JobFilterState>) => void): ChipDef[] {
  const chips: ChipDef[] = [];
  filters.jobTypes.forEach(t => chips.push({ key: `jt-${t}`, label: t, onRemove: () => onChange({ jobTypes: filters.jobTypes.filter(v => v !== t) }) }));
  if (filters.experience) {
    const label = EXPERIENCE_OPTIONS.find(o => o.value === filters.experience)?.label || filters.experience;
    chips.push({ key: 'exp', label, onRemove: () => onChange({ experience: '' }) });
  }
  if (filters.salaryMin || filters.salaryMax) {
    chips.push({
      key: 'sal',
      label: `₹${filters.salaryMin || '0'} – ${filters.salaryMax ? '₹' + filters.salaryMax : 'Any'}`,
      onRemove: () => onChange({ salaryMin: '', salaryMax: '' }),
    });
  }
  filters.education.forEach(e => {
    const label = EDUCATION_OPTIONS.find(o => o.value === e)?.label || e;
    chips.push({ key: `ed-${e}`, label, onRemove: () => onChange({ education: filters.education.filter(v => v !== e) }) });
  });
  filters.industries.forEach(i => chips.push({ key: `ind-${i}`, label: i, onRemove: () => onChange({ industries: filters.industries.filter(v => v !== i) }) }));
  filters.skills.forEach(s => chips.push({ key: `sk-${s}`, label: s, onRemove: () => onChange({ skills: filters.skills.filter(v => v !== s) }) }));
  if (filters.verifiedOnly) chips.push({ key: 'ver', label: 'Verified only', onRemove: () => onChange({ verifiedOnly: false }) });
  if (filters.datePosted) {
    const label = DATE_POSTED_OPTIONS.find(o => o.value === filters.datePosted)?.label || filters.datePosted;
    chips.push({ key: 'date', label, onRemove: () => onChange({ datePosted: '' }) });
  }
  return chips;
}
