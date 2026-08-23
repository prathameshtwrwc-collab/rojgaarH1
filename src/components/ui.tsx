import { ReactNode, useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { cn } from '../utils/cn';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', size = 'md', children, fullWidth, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  const variants: Record<string, string> = {
    primary: 'bg-[var(--orange)] hover:bg-[#d94d1a] text-white focus:ring-[var(--orange)] shadow-md shadow-orange-600/20 active:scale-[0.98]',
    secondary: 'bg-[var(--navy)] hover:bg-[#1a2540] text-white border border-[var(--navy)] focus:ring-[var(--navy)]',
    outline: 'border-2 border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--bg-cream)] focus:ring-[var(--navy)]',
    ghost: 'text-[var(--charcoal)] hover:bg-[var(--bg-cream)] focus:ring-[var(--navy)]',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500 shadow-sm',
    success: 'bg-[var(--green)] hover:bg-[#0a4d3a] text-white focus:ring-[var(--green)] shadow-sm',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)} {...props}>
      {children}
    </button>
  );
}

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--navy)] mb-1.5">
          {label}{props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 rounded-lg border ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-slate-300 focus:ring-[var(--orange)] focus:border-[var(--orange)]'
        } focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors bg-white text-[var(--navy)] placeholder:text-slate-400 ${className}`}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-[var(--charcoal)]">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[var(--navy)] mb-1.5">
          {label}{props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            error ? 'border-red-500' : 'border-slate-300'
          } focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none appearance-none bg-white text-[var(--navy)] pr-10 ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-white text-[var(--navy)]">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = '', id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-[var(--navy)] mb-1.5">
          {label}{props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-4 py-2.5 rounded-lg border ${
          error ? 'border-red-500' : 'border-slate-300'
        } focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none transition-colors bg-white text-[var(--navy)] placeholder:text-slate-400 resize-vertical min-h-[100px] ${className}`}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-[var(--charcoal)]">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// Card
interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow border border-slate-200 ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

// Badge
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-red-50 text-red-800 border border-red-200',
    info: 'bg-[var(--orange)]/10 text-[var(--orange)] border border-[var(--orange)]/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;
  const sizes: Record<string, string> = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    // Overlay: positions + backdrop only
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel: owns the rounded boundary, clips content, never exceeds viewport */}
      <div className={`relative flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${sizes[size]} max-h-[calc(100dvh-48px)] overflow-hidden`}>
        {/* Header: non-scrolling */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-[var(--navy)]">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-[var(--navy)] hover:bg-slate-100 transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={19} />
          </button>
        </div>

        {/* Body: the ONLY scrollable region */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 text-[var(--navy)]" data-lenis-prevent>{children}</div>
      </div>
    </div>
  );
}

// Toast
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = { success: <CheckCircle size={20} />, error: <AlertCircle size={20} />, info: <AlertCircle size={20} /> };
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-[var(--orange)]/10 border-[var(--orange)]/20 text-[var(--navy)]',
  };

  return (
    <div className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-xl ${styles[type]} animate-slide-in`}>
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={16} /></button>
    </div>
  );
}

// Toggle
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-[var(--orange)]' : 'bg-slate-300'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </div>
      <span className="text-sm font-medium text-[var(--navy)]">{label}</span>
    </label>
  );
}

// Progress Bar
export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-[var(--charcoal)]">Step {current} of {total}</span>
        <span className="text-sm font-bold text-[var(--orange)]">{pct}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div className="bg-[var(--orange)] h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Step Indicator
export function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
              i + 1 <= currentStep
                ? 'bg-[var(--orange)] text-white'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            {i + 1}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-1 ${
                i + 1 < currentStep ? 'bg-[var(--orange)]' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Stat Card
export function StatCard({ icon, label, value, change, color = 'orange' }: { icon: ReactNode; label: string; value: string | number; change?: string; color?: string }) {
  const colors: Record<string, string> = {
    orange: 'bg-[var(--orange)]/10 text-[var(--orange)] border border-[var(--orange)]/20',
    green: 'bg-[var(--green)]/10 text-[var(--green)] border border-[var(--green)]/20',
    navy: 'bg-[var(--navy)]/10 text-[var(--navy)] border border-[var(--navy)]/20',
    purple: 'bg-[var(--purple)]/10 text-[var(--purple)] border border-[var(--purple)]/20',
    red: 'bg-red-50 text-red-600 border border-red-200',
    amber: 'bg-amber-50 text-amber-600 border border-amber-200',
  };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--charcoal)]">{label}</p>
          <p className="text-2xl font-bold text-[var(--navy)] mt-1">{value}</p>
          {change && <p className="text-xs font-semibold text-[var(--green)] mt-1">{change}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
    </Card>
  );
}

// Empty State
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-slate-100 rounded-2xl mb-4 text-slate-400">{icon}</div>
      <h3 className="text-lg font-bold text-[var(--navy)]">{title}</h3>
      <p className="text-sm text-[var(--charcoal)] mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// File Upload
interface FileUploadProps {
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  hint?: string;
}

export function FileUpload({ label, accept, onChange, hint }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('');
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-[var(--navy)] mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-lg border border-slate-300 hover:border-[var(--orange)] hover:bg-[var(--bg-cream)] transition-colors text-sm font-medium text-[var(--navy)] bg-white">
          Choose File
          <input type="file" accept={accept} className="hidden" onChange={e => {
            const file = e.target.files?.[0] || null;
            setFileName(file?.name || '');
            onChange(file);
          }} />
        </label>
        {fileName && (
          <span className="text-sm text-[var(--navy)] flex items-center gap-1 font-medium">
            <CheckCircle size={14} className="text-[var(--green)]" />{fileName}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-[var(--charcoal)]">{hint}</p>}
    </div>
  );
}

// Skill Tags Input
interface SkillTagsProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function SkillTags({ label, value, onChange, suggestions = [], placeholder }: SkillTagsProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const filtered = suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s));

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-[var(--navy)] mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 p-2 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-[var(--orange)] focus-within:border-[var(--orange)] transition-colors bg-white min-h-[42px]">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--orange)]/10 text-[var(--navy)] border border-[var(--orange)]/20 rounded-md text-sm font-medium">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-[var(--orange)] hover:text-red-500 ml-1"><X size={14} /></button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(input); } }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none text-sm text-[var(--navy)] placeholder:text-slate-400 bg-transparent py-0.5"
        />
      </div>
      {showSuggestions && filtered.length > 0 && (
        <div className="mt-1 border border-slate-200 rounded-lg bg-white shadow-xl max-h-40 overflow-y-auto z-20 relative" data-lenis-prevent>
          {filtered.slice(0, 8).map(s => (
            <button key={s} type="button" onClick={() => addTag(s)} className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-cream)] text-[var(--navy)]">{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// Animated Counter
export function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// FAQ Accordion
export function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between py-5 px-5 text-left gap-4">
        <span className="font-semibold text-[var(--navy)] text-base sm:text-lg">{question}</span>
        <ChevronDown className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>
      {isOpen && <p className="px-5 pb-5 text-[var(--charcoal)] leading-relaxed text-sm sm:text-base">{answer}</p>}
    </div>
  );
}
