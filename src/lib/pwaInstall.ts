/**
 * Captures the `beforeinstallprompt` event at module-import time (main.tsx imports
 * this before React renders), not inside a component's useEffect. In a SPA, the
 * event can fire before any given route's component has mounted its own listener,
 * which permanently loses it — that was the root cause of the "Get App" button
 * always falling back to opening a new tab instead of showing the install prompt.
 */

type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<(available: boolean) => void>();

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)').matches;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(displayModeStandalone || iosStandalone);
}

installed = detectStandalone();

function notify() {
  const available = Boolean(deferredPrompt) && !installed;
  listeners.forEach(cb => cb(available));
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    installed = false;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installed = true;
    notify();
  });
}

export function onPwaInstallAvailabilityChange(callback: (available: boolean) => void): () => void {
  listeners.add(callback);
  callback(Boolean(deferredPrompt) && !installed);
  return () => listeners.delete(callback);
}

export function isPwaInstallAvailable(): boolean {
  return Boolean(deferredPrompt) && !installed;
}

export function isPwaInstalled(): boolean {
  return installed;
}

export async function promptPwaInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  const promptEvent = deferredPrompt;
  await promptEvent.prompt();
  const { outcome } = await promptEvent.userChoice;
  if (outcome === 'accepted') {
    deferredPrompt = null;
  }
  notify();
  return outcome;
}

export function getManualInstallInstructions(): string {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  const isFirefox = /firefox|fxios/i.test(ua);

  if (isIOS && isSafari) {
    return 'Tap the Share icon in Safari, then choose "Add to Home Screen" to install Rojgaar Hai.';
  }
  if (isIOS) {
    return 'Open this page in Safari, tap the Share icon, then choose "Add to Home Screen" to install the app.';
  }
  if (isFirefox) {
    return 'Open the browser menu (⋮) and select "Install" to add Rojgaar Hai to your device.';
  }
  return 'Open your browser menu and select "Install App" (or "Add to Home Screen") to install Rojgaar Hai.';
}
