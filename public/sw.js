// Bump this when the caching rules change; old caches are deleted on activate.
const CACHE_NAME = 'rojgaar-hai-v3';
const APP_SHELL = '/index.html';
const urlsToCache = [
  '/',
  APP_SHELL,
  '/favicon_io/favicon.ico',
  '/favicon_io/favicon-16x16.png',
  '/favicon_io/favicon-32x32.png',
  '/favicon_io/apple-touch-icon.png',
  '/favicon_io/android-chrome-192x192.png',
  '/favicon_io/android-chrome-512x512.png',
  '/favicon_io/site.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

function putInCache(request, response) {
  if (response && response.status === 200 && response.type === 'basic') {
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only same-origin GETs. Supabase, fonts, the QR API and every POST pass straight through.
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Page loads: network first, so a new deploy shows up at once. The cached shell is
  // only used offline. (Serving old HTML first pointed at code files that a new
  // deploy had removed, which left a blank screen.)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => putInCache(APP_SHELL, response))
        .catch(() => caches.match(APP_SHELL).then((cached) => cached || caches.match('/')).then((cached) => cached || Response.error()))
    );
    return;
  }

  // Built code and styles have a content hash in their name and never change: cache first.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => putInCache(request, response)))
    );
    return;
  }

  // Everything else (icons, images, manifest): show the cached copy, refresh it in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => putInCache(request, response))
        .catch(() => cached || Response.error());
      return cached || networkFetch;
    })
  );
});
