// KNM Japan 2026 — service worker
// Strategy: cache the app shell (same-origin) with stale-while-revalidate so the
// app opens instantly and offline, but never gets stuck on a stale build.
// The Apps Script API is cross-origin and is NOT intercepted here — the app
// already keeps its own data copy in localStorage for offline viewing.

const CACHE = 'knm-japan-v5';
const SHELL = [
  './',
  './index.html',
  './fuji.jpg',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  // Also cache the icon-font CDN so icons render offline (subway, airplane mode).
  // The data API (script.google.com) and other hosts pass through untouched.
  const isIconCDN = url.hostname === 'cdnjs.cloudflare.com';
  if (!sameOrigin && !isIconCDN) return;

  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && (res.status === 200 || res.type === 'opaque')) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});
