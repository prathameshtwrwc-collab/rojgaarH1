// Shared "yyyy-mm-dd" helpers for <input type="date">, built from local date parts
// (not Date#toISOString, which is UTC and can land on the wrong day near midnight in
// India, UTC+5:30).

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Today, as a date input value. */
export function todayDateValue(): string {
  return toDateInputValue(new Date());
}

/** `daysAhead` days from today, as a date input value. */
export function maxDateValue(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return toDateInputValue(d);
}

/** A job's application deadline: no earlier than today, no later than 1.5 months out. */
export const DEADLINE_MAX_DAYS = 45;

/** `min`/`max` for a deadline date input: today through 1.5 months from today. */
export function deadlineDateRange(): { min: string; max: string } {
  return { min: todayDateValue(), max: maxDateValue(DEADLINE_MAX_DAYS) };
}

/** True if `value` (a date input's "yyyy-mm-dd", or '') is a valid deadline. Blank is valid — the deadline is optional. */
export function isValidDeadline(value: string): boolean {
  if (!value) return true;
  const { min, max } = deadlineDateRange();
  return value >= min && value <= max;
}
