import { useState } from 'react';
import { X } from 'lucide-react';
import { canonicalSkill, dedupeSkills, filterSkillSuggestions, parseSkillList, skillKey } from '../constants/skills';

interface SkillTagInputProps {
  label: string;
  value: string[];
  onChange: (skills: string[]) => void;
  /** Ranked suggestions, e.g. from skillsForSubsector(sector, subsector). */
  suggestions: string[];
  placeholder?: string;
  hint?: string;
  max?: number;
}

/**
 * Tag input for skills. A comma, Enter or Tab turns the typed text into a tag,
 * pasted comma-separated lists become several tags, and Backspace on an empty
 * box removes the last tag. Duplicates are ignored case-insensitively.
 */
export function SkillTagInput({ label, value, onChange, suggestions, placeholder, hint, max = 25 }: SkillTagInputProps) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);

  const full = value.length >= max;

  const addTags = (raw: string[]) => {
    if (full) return;
    const merged = dedupeSkills([...value, ...raw]).slice(0, max);
    if (merged.length !== value.length) onChange(merged);
  };

  const commitInput = () => {
    const parts = parseSkillList(input);
    if (parts.length) addTags(parts);
    setInput('');
  };

  const removeTag = (tag: string) => {
    const k = skillKey(tag);
    onChange(value.filter(t => skillKey(t) !== k));
  };

  const handleChange = (text: string) => {
    if (text.includes(',')) {
      // Everything before the last comma becomes tags; the tail stays in the box.
      const idx = text.lastIndexOf(',');
      addTags(parseSkillList(text.slice(0, idx)));
      setInput(text.slice(idx + 1));
      return;
    }
    setInput(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || (e.key === 'Tab' && input.trim())) {
      e.preventDefault();
      commitInput();
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const matches = filterSkillSuggestions(input, suggestions, value).slice(0, 8);
  const quickPicks = filterSkillSuggestions('', suggestions, value).slice(0, 10);
  const showMenu = focused && !full && matches.length > 0;

  return (
    <div className="w-full min-w-0">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <label className="block text-sm font-medium text-[var(--navy)]">{label}</label>
        <span className={`text-[11px] font-semibold ${full ? 'text-red-500' : 'text-slate-400'}`}>{value.length}/{max}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 p-2 border border-slate-300 rounded-lg bg-white min-h-[44px] focus-within:ring-2 focus-within:ring-[var(--orange)] focus-within:border-[var(--orange)] transition-colors">
        {value.map(tag => (
          <span key={skillKey(tag)} className="inline-flex max-w-full items-center gap-1 pl-2.5 pr-1 py-1 bg-[var(--orange)]/10 text-[var(--navy)] border border-[var(--orange)]/20 rounded-md text-[13px] font-medium">
            <span className="truncate">{canonicalSkill(tag)}</span>
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`} className="p-0.5 rounded text-[var(--orange)] hover:text-red-500 flex-shrink-0">
              <X size={13} />
            </button>
          </span>
        ))}
        <input
          value={input}
          disabled={full}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); commitInput(); }}
          placeholder={full ? `Maximum ${max} skills` : value.length === 0 ? placeholder : 'Add more…'}
          className="flex-1 min-w-[110px] outline-none text-[16px] sm:text-sm text-[var(--navy)] placeholder:text-slate-400 bg-transparent py-0.5"
        />
      </div>

      {showMenu && (
        <div className="mt-1 border border-slate-200 rounded-lg bg-white shadow-xl max-h-48 overflow-y-auto z-20 relative" data-lenis-prevent>
          {matches.map(s => (
            <button
              key={skillKey(s)}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { addTags([s]); setInput(''); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-cream)] text-[var(--navy)]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {!full && quickPicks.length > 0 && (
        <div className="mt-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Suggested for this role</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPicks.map(s => (
              <button
                key={skillKey(s)}
                type="button"
                onClick={() => addTags([s])}
                className="max-w-full text-left px-2.5 py-1 rounded-full border border-slate-200 bg-white text-[12px] font-medium text-[var(--charcoal)] hover:border-[var(--orange)] hover:text-[var(--orange)] transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {hint && <p className="text-[11px] text-slate-500 mt-1.5">{hint}</p>}
    </div>
  );
}
