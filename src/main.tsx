import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./design-system.css";
import "./App.css";
import "./section04.css";
import "./features.css";
import "./stats.css";
import "./testimonials.css";
import "./final-section.css";
import "./mobile-app.css";
import "./app-polish.css";
import "./lib/pwaInstall";
import "./lib/scrollState";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";

// After a deploy, an open tab may ask for a code file that no longer exists.
// Reload once to pick up the new version instead of failing on that page.
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (sessionStorage.getItem('rh.chunkReload') === '1') return;
    sessionStorage.setItem('rh.chunkReload', '1');
  } catch { /* storage blocked: still try once */ }
  event.preventDefault();
  window.location.reload();
});
// A page that loaded fine clears the flag, so a later deploy can reload again
window.addEventListener('load', () => {
  setTimeout(() => { try { sessionStorage.removeItem('rh.chunkReload'); } catch { /* blocked */ } }, 10000);
});

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  } else {
    // A service worker from an earlier production build (or a previous dev
    // session) can keep intercepting and caching Vite's dev-only requests
    // (/src/*.tsx, /node_modules/.vite/deps/*, the HMR websocket's page
    // shell), which breaks HMR and throws "Failed to convert value to
    // 'Response'" when a stale cache entry misses. Never run the SW in dev.
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => reg.unregister());
    });
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
    }
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);
