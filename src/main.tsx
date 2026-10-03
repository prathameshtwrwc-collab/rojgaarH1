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
import "./lib/pwaInstall";
import App from "./App";

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
    <App />
  </StrictMode>
);
