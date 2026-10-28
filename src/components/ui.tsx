import { ReactNode, useState, useEffect, useRef, useId } from 'react';
import { lockBodyScroll } from '../lib/scrollLock';
import { X, CheckCircle, AlertCircle, ChevronDown, Info, Loader2 } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { cn } from '../utils/cn';
import { useModalBackButton } from '../hooks/useModalBackButton';
import { useMountTransition } from '../hooks/useMountTransition';
import { useSheetDrag } from '../hooks/useSheetDrag';
import { haptic } from '../lib/haptics';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
  /** Shows a spinner in place of the content's leading space and blocks further presses. */
  loading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', children, fullWidth, loading = false, className = '', disabled, ...props }: ButtonProps) {
  // focus-visible: keyboard users get a ring, a finger tap does not leave one behind
  const base = 'ui-btn inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97]';
  const variants: Record<string, string> = {
    primary: 'bg-[var(--orange)] hover:bg-[#d94d1a] text-white focus-visible:ring-[var(--orange)] shadow-md shadow-orange-600/20',
    secondary: 'bg-[var(--navy)] hover:bg-[#1a2540] text-white border border-[var(--navy)] focus-visible:ring-[var(--navy)]',
    outline: 'border-2 border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--bg-cream)] focus-visible:ring-[var(--navy)]',
    ghost: 'text-[var(--charcoal)] hover:bg-[var(--bg-cream)] focus-visible:ring-[var(--navy)]',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus-visible:ring-red-500 shadow-sm',
    success: 'bg-[var(--green)] hover:bg-[#0a4d3a] text-white focus-visible:ring-[var(--green)] shadow-sm',
  };
  const sizes: Record<string, string> = {
    sm: 'ui-btn--sm px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 size={size === 'lg' ? 18 : 15} className="animate-spin flex-shrink-0" aria-hidden="true" />}
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
  const autoId = useId();
  const inputId = id || autoId;
  const noteId = `${inputId}-note`;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--navy)] mb-1.5">
          {label}{props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? noteId : undefined}
        className={`ui-field w-full px-4 py-2.5 rounded-xl border ${
          error
            ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
            : 'border-slate-300 focus:ring-[var(--orange)]/25 focus:border-[var(--orange)]'
        } focus:outline-none focus:ring-4 focus:ring-offset-0 transition-[border-color,box-shadow] bg-white text-[var(--navy)] placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
        {...props}
      />
      {hint && !error && <p id={noteId} className="mt-1 text-xs text-[var(--charcoal)]">{hint}</p>}
      {error && <p id={noteId} role="alert" className="ui-field-error mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  /** Set false to size this to its content instead of stretching full width — for filter toolbars where several selects sit side by side. Defaults to true, matching every existing usage inside forms. */
  fullWidth?: boolean;
}

export function Select({ label, error, options, className = '', id, fullWidth = true, ...props }: SelectProps) {
  const autoId = useId();
  const selectId = id || autoId;
  return (
    <div className={fullWidth ? 'w-full' : 'inline-block'}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[var(--navy)] mb-1.5">
          {label}{props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={`ui-field ${fullWidth ? 'w-full' : ''} px-4 py-2.5 rounded-xl border ${
            error ? 'border-red-500' : 'border-slate-300'
          } focus:ring-4 focus:ring-[var(--orange)]/25 focus:border-[var(--orange)] focus:outline-none appearance-none bg-white text-[var(--navy)] pr-10 cursor-pointer transition-[border-color,box-shadow] ${className}`}
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
  const autoId = useId();
  const textareaId = id || autoId;
  const noteId = `${textareaId}-note`;
  const max = typeof props.maxLength === 'number' ? props.maxLength : null;
  const length = typeof props.value === 'string' ? props.value.length : null;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-[var(--navy)] mb-1.5">
          {label}{props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? noteId : undefined}
        className={`ui-field w-full px-4 py-2.5 rounded-xl border ${
          error ? 'border-red-500' : 'border-slate-300'
        } focus:ring-4 focus:ring-[var(--orange)]/25 focus:border-[var(--orange)] focus:outline-none transition-[border-color,box-shadow] bg-white text-[var(--navy)] placeholder:text-slate-400 resize-vertical min-h-[100px] ${className}`}
        {...props}
      />
      <div className="flex items-start justify-between gap-3">
        {hint && !error && <p id={noteId} className="mt-1 text-xs text-[var(--charcoal)]">{hint}</p>}
        {error && <p id={noteId} role="alert" className="ui-field-error mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
        {max !== null && length !== null && (
          <p className={`mt-1 ml-auto text-[11px] tabular-nums ${length >= max ? 'text-red-600' : 'text-slate-400'}`}>{length}/{max}</p>
        )}
      </div>
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
    <div className={`ui-card bg-white rounded-2xl shadow-sm border border-slate-200 ${padding ? 'p-6' : ''} ${className}`}>
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
// A centred dialog on tablets/desktops and a bottom sheet on phones: it slides up, can be
// swiped down to dismiss, and animates out instead of vanishing. See mobile-app.css.
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Pinned under the scrolling body (e.g. a primary action). */
  footer?: ReactNode;
  /** `full` keeps the sheet edge-to-edge and full height on phones, for long multi-step content. */
  variant?: 'sheet' | 'full';
}

const openModalStack: object[] = [];

export function Modal({ isOpen, onClose, title, children, size = 'md', footer, variant = 'sheet' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    return lockBodyScroll();
  }, [isOpen]);

  // On a phone, the back button closes this modal instead of leaving the page behind it.
  useModalBackButton(isOpen, onClose);

  const { mounted, state } = useMountTransition(isOpen, 260);
  const { wrapRef, backdropRef, handlers } = useSheetDrag(onClose, isOpen);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Escape closes it; focus moves into the dialog for screen readers and keyboards,
  // and goes back to whatever opened it once it closes.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      if (panelRef.current && !panelRef.current.contains(document.activeElement)) panelRef.current.focus({ preventScroll: true });
    }, 30);
    const token = {};
    openModalStack.push(token);
    // Only the top-most of several stacked dialogs reacts to Escape
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openModalStack[openModalStack.length - 1] === token) onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKey);
      const at = openModalStack.indexOf(token);
      if (at >= 0) openModalStack.splice(at, 1);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [isOpen]);

  if (!mounted) return null;
  const sizes: Record<string, string> = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    // Overlay: positions + backdrop only
    <div className="ui-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" data-state={state}>
      <div ref={backdropRef} className="ui-modal-backdrop fixed inset-0 bg-[#0b1226]/65 backdrop-blur-[6px]" onClick={onClose} />

      {/* Wrapper: carries the swipe-to-dismiss transform on phones; invisible to layout on desktop */}
      <div ref={wrapRef} className="ui-sheet-wrap">
        {/* Panel: owns the rounded boundary, clips content, never exceeds viewport */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={`ui-modal-panel ${variant === 'full' ? 'ui-modal-panel--full' : ''} relative flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${sizes[size]} max-h-[calc(100dvh-48px)] overflow-hidden outline-none`}
        >
          {/* Phone-only grabber: drag it (or the header) down to dismiss */}
          <div className="ui-sheet-grabber" aria-hidden="true" {...handlers} />

          {/* Header: non-scrolling */}
          <div className="ui-modal-header ui-sheet-drag flex-shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-200" {...handlers}>
            <h3 id={titleId} className="text-lg font-bold text-[var(--navy)] min-w-0">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="ui-modal-close flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-[var(--navy)] hover:bg-slate-100 active:scale-90 transition-[color,background-color,transform]"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={19} />
            </button>
          </div>

          {/* Body: the ONLY scrollable region */}
          <div className="ui-modal-body flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 text-[var(--navy)]" data-lenis-prevent>{children}</div>

          {footer && <div className="ui-sheet-footer flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-white">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

// Toast
// Top-right on desktop; a floating pill above the bottom navigation on phones.
interface ToastProps {
  message: string;
  /** Left out, the tone is read from the message itself (failures read as errors, nudges as info). */
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

/** Works out whether a message reports a success, a failure or just a nudge. */
export function toastTone(message: string): 'success' | 'error' | 'info' {
  const m = message.toLowerCase();
  if (/\b(fail(ed|ure)?|errors?|could not|couldn't|cannot|can't|unable|invalid|denied|went wrong|not allowed)\b/.test(m)) return 'error';
  if (/\b(please|first|awaiting|coming soon|not supported|not available|no saved|not applied|have not|has not|only|no resume|not uploaded|not yet|unlocks?)\b/.test(m)) return 'info';
  return 'success';
}

export function Toast({ message, type, onClose }: ToastProps) {
  const tone = type ?? toastTone(message);
  const [leaving, setLeaving] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  // Errors stay a little longer: they usually need reading
  const duration = tone === 'error' ? 5200 : 4000;

  // Restarts whenever the message changes, so a fresh toast always gets its full time on screen.
  useEffect(() => {
    setLeaving(false);
    if (tone === 'success') haptic('success');
    else if (tone === 'error') haptic('warn');
    const leave = setTimeout(() => setLeaving(true), duration - 350);
    const done = setTimeout(() => onCloseRef.current(), duration);
    return () => { clearTimeout(leave); clearTimeout(done); };
  }, [message, tone, duration]);

  // Swipe sideways to dismiss, like a phone notification. Uses the separate `translate`
  // property so it never fights the slide-in animation, which animates `transform`.
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  useEffect(() => { setDx(0); }, [message]);
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    startX.current = e.clientX;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    setDx(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (startX.current === null) return;
    startX.current = null;
    setDragging(false);
    if (Math.abs(dx) > 70) {
      setDx(dx > 0 ? 480 : -480);
      setTimeout(() => onCloseRef.current(), 180);
    } else {
      setDx(0);
    }
  };

  const icons = { success: <CheckCircle size={20} />, error: <AlertCircle size={20} />, info: <Info size={20} /> };
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-[#FFF6F1] border-[var(--orange)]/25 text-[var(--navy)]',
  };

  return (
    <div
      key={message}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      data-leaving={leaving ? 'true' : 'false'}
      data-tone={tone}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        translate: `${dx}px 0`,
        opacity: dx ? Math.max(0.15, 1 - Math.abs(dx) / 260) : undefined,
        transition: dragging ? 'none' : 'translate 240ms cubic-bezier(0.32,0.72,0,1), opacity 240ms ease',
        touchAction: 'pan-y',
      }}
      className={`ui-toast fixed z-[60] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-xl overflow-hidden select-none ${styles[tone]}`}
    >
      <span className="ui-toast__icon flex-shrink-0">{icons[tone]}</span>
      <p className="text-sm font-medium min-w-0 flex-1 leading-snug">{message}</p>
      <button onClick={() => onCloseRef.current()} aria-label="Dismiss" className="ui-toast__close -mr-1 w-8 h-8 flex items-center justify-center rounded-full opacity-70 hover:opacity-100 flex-shrink-0"><X size={16} /></button>
      <span className="ui-toast__timer" style={{ animationDuration: `${duration}ms` }} aria-hidden="true" />
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
  // A real switch: reachable by keyboard, announced as on/off, and the whole row is the hit area
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => { haptic('select'); onChange(!checked); }}
      className="flex items-center gap-3 cursor-pointer min-h-[40px] text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]"
    >
      <span
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-300 ${
          checked ? 'bg-[var(--orange)]' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </span>
      <span className="text-sm font-medium text-[var(--navy)]">{label}</span>
    </button>
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

// Progress Ring: a circular percentage, drawn once and filled with a calm sweep
export function ProgressRing({ value, size = 64, stroke = 6, label, tone = 'var(--orange)', track = 'rgba(255,255,255,0.14)', className = '' }: {
  value: number;
  size?: number;
  stroke?: number;
  /** Read out instead of the bare number, e.g. "Profile 72% complete". */
  label?: string;
  tone?: string;
  track?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - stroke) / 2;
  const full = 2 * Math.PI * r;
  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`} style={{ width: size, height: size }} role="img" aria-label={label || `${pct}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          className="ap-ring__value"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={full}
          strokeDashoffset={full * (1 - pct / 100)}
          style={{ ['--ring-full' as string]: full, transition: 'stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-extrabold tabular-nums" aria-hidden="true">{pct}%</span>
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
    // Eases out (fast start, gentle landing) on the display's own frame clock; no motion if asked
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setCount(end); return; }
    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(end * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);

  return <span className="tabular-nums">{count.toLocaleString('en-IN')}{suffix}</span>;
}

// FAQ Accordion
export function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls={panelId} className="w-full flex items-center justify-between py-5 px-5 text-left gap-4">
        <span className="font-semibold text-[var(--navy)] text-base sm:text-lg">{question}</span>
        <ChevronDown className={`flex-shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--orange)]' : ''}`} size={20} />
      </button>
      {/* Height animates open and closed instead of popping */}
      <div id={panelId} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-[var(--charcoal)] leading-relaxed text-sm sm:text-base">{answer}</p>
        </div>
      </div>
    </div>
  );
}
