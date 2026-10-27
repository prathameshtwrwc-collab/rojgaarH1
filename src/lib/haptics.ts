// Tiny tactile feedback for touch devices (Android Chrome and installed PWAs).
// Silently does nothing anywhere it isn't supported, so it is safe to call freely.
const patterns = {
  tap: 8,
  select: 12,
  success: [10, 40, 14],
  warn: [18, 30, 18],
} as const;

export function haptic(kind: keyof typeof patterns = 'tap') {
  try {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    navigator.vibrate(patterns[kind] as number | number[]);
  } catch {
    /* not supported */
  }
}
