/**
 * Service Worker — caches the app shell for offline loading.
 *
 * Strategy:
 * - Navigation requests (pages): network-first, fall back to cache
 * - Static assets (JS, CSS, fonts, images): cache-first, fall back to network
 * - API calls (Supabase): network-only (no caching of user data)
 *
 * Cache is versioned — increment CACHE_VERSION to bust old caches on deploy.
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `cycle-tracker-${CACHE_VERSION}`;

// App shell files to pre-cache on install
const PRECACHE_URLS = ["/", "/log", "/history"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  // Clean up old cache versions
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip Supabase API calls — never cache user data
  if (url.hostname.includes("supabase")) return;

  // Skip Next.js HMR / dev tools in development
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // Navigation requests (pages): network-first
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          // Only cache successful responses for same-origin assets
          if (response.ok && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
    )
  );
});
