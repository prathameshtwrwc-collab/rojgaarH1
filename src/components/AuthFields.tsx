import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2, Check } from 'lucide-react';
import { passwordStrength } from '../lib/authHelpers';

// Shared building blocks for the sign-in and sign-up screens, so every form
// gets the same 50px fields, real labels, autofill hints and error wiring.

const fieldBase =
  'auth-input w-full h-[50px] rounded-xl border bg-white text-[15px] sm:text-sm text-[var(--navy)] placeholder:text-slate-400 ' +
  'transition-[border-color,box-shadow,background-color] duration-200 focus:outline-none focus:ring-4 focus:ring-[var(--orange)]/15 focus:border-[var(--orange)] ' +
  'disabled:bg-slate-50 disabled:text-slate-500';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  hint?: ReactNode;
  error?: string;
  trailing?: ReactNode;
  prefix?: string;
}

export const AuthField = forwardRef<HTMLInputElement, FieldProps>(function AuthField(
  { label, icon, hint, error, trailing, prefix, className = '', id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id || autoId;
  const msgId = `${inputId}-msg`;
  const padLeft = prefix ? 'pl-[68px]' : icon ? 'pl-11' : 'pl-4';
  const padRight = trailing ? 'pr-12' : 'pr-4';
  return (
    <div className="auth-field">
      <label htmlFor={inputId} className="block text-[13px] font-bold text-[var(--navy)] mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && !prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none auth-field__icon">{icon}</span>
        )}
        {prefix && (
          <span className="absolute left-0 top-0 bottom-0 w-[56px] flex items-center justify-center gap-1 text-[14px] font-bold text-[var(--navy)] border-r border-slate-200 pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? msgId : undefined}
          className={`${fieldBase} ${padLeft} ${padRight} ${error ? 'border-red-300 bg-red-50/40' : 'border-slate-200'} ${className}`}
          {...rest}
        />
        {trailing && <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span>}
      </div>
      {error ? (
        <p id={msgId} className="auth-field__error mt-1.5 text-[12.5px] font-semibold text-red-600 flex items-center gap-1">
          <AlertCircle size={13} className="flex-shrink-0" /> {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="mt-1.5 text-[12px] text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});

interface PasswordProps extends Omit<FieldProps, 'type' | 'trailing'> {
  showStrength?: boolean;
}

export function PasswordField({ showStrength, value, ...rest }: PasswordProps) {
  const [visible, setVisible] = useState(false);
  const str = showStrength ? passwordStrength(String(value ?? '')) : null;
  const tones = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-lime-500', 'bg-green-600'];
  return (
    <div>
      <AuthField
        {...rest}
        value={value}
        type={visible ? 'text' : 'password'}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        trailing={
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-[var(--navy)] hover:bg-slate-100 active:scale-95 transition"
          >
            {visible ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        }
      />
      {str && str.score > 0 && (
        <div className="mt-2 flex items-center gap-2" aria-live="polite">
          <div className="flex-1 grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map(i => (
              <span
                key={i}
                className={`h-1 rounded-full transition-colors duration-300 ${i <= str.score ? tones[str.score] : 'bg-slate-200'}`}
              />
            ))}
          </div>
          <span className="text-[11.5px] font-bold text-slate-500 w-16 text-right">{str.label}</span>
        </div>
      )}
    </div>
  );
}

/** Error banner that announces itself and gives a small shake so the eye finds it */
export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      key={message}
      role="alert"
      className="auth-error mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-[13px] font-medium text-red-700 flex items-start gap-2.5"
    >
      <AlertCircle size={17} className="flex-shrink-0 mt-px" />
      <span>{message}</span>
    </div>
  );
}

export function AuthSubmit({
  loading,
  disabled,
  children,
  loadingText,
  tone = 'orange',
}: {
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  loadingText?: string;
  tone?: 'orange' | 'navy';
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={`auth-submit w-full h-[52px] inline-flex items-center justify-center gap-2 text-white text-[15px] font-bold rounded-full transition-all duration-200 active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--orange)]/30 ${
        tone === 'navy'
          ? 'bg-[var(--navy)] hover:bg-[#13204a] shadow-[0_10px_24px_-12px_rgba(14,26,61,0.6)]'
          : 'bg-[var(--orange)] hover:brightness-105 shadow-[0_10px_24px_-12px_rgba(232,93,31,0.75)]'
      }`}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {loading ? loadingText || 'Please wait…' : children}
    </button>
  );
}

/** Green confirmation line, used once a phone number has been verified */
export function AuthSuccessLine({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="auth-verified flex items-center gap-2.5 text-green-700">
      <span className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0">
        <Check size={15} strokeWidth={3} />
      </span>
      <span className="text-sm font-semibold">{children}</span>
      {action && <span className="ml-auto">{action}</span>}
    </div>
  );
}
