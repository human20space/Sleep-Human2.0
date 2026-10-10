/**
 * Human 2.0 — Production Service Worker
 * Focus: Sleep Supporting Mobile App PWA Shell & Instant Updates
 * Version: human2-shell-v1
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `human2-shell-${CACHE_VERSION}`;

// Core App Shell Assets (Always small, static, essential)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon-180x180.png'
];

// Media and Large Asset Exclusion Patterns (HAZARD GUARD)
const EXCLUDED_EXTENSIONS = /\.(mp3|mp4|wav|ogg|webm|m4a|aac|flac|pdf|zip|tar|gz)$/i;
const EXCLUDED_PATHS = ['/audio/', '/videos/', '/video_'];
const EXTERNAL_MEDIA_HOSTS = ['drive.google.com', 'drive.usercontent.google.com'];

/**
 * Install Event: Precache core app shell
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Wait for user confirmation via the Update Toast
      })
      .catch((err) => {
        console.error('[ServiceWorker] Precache failed:', err);
      })
  );
});

/**
 * Activate Event: Clean up stale caches and claim clients
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key.startsWith('human2-') && key !== CACHE_NAME) {
              console.log('[ServiceWorker] Purging stale cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

/**
 * Message Event: Handle control messages from client bridge
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * Fetch Event: Request routing, caching strategies & hazard guards
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Service Worker Bypass: Requests starting with /admin immediately bypass the service worker and go straight to network
  if (url.pathname.startsWith('/admin')) {
    return;
  }

  // 2. Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  // =========================================================================
  // HAZARD GUARD: Strictly exclude media, video, audio & range requests
  // Early return hands control directly to native browser media engine.
  // =========================================================================

  // A. Skip HTTP Range requests (crucial: avoids 206 TypeError in CacheStorage)
  if (request.headers.has('range')) {
    return;
  }

  // B. Skip explicit audio/video destinations
  if (request.destination === 'audio' || request.destination === 'video') {
    return;
  }

  // C. Skip excluded paths (audiobooks, video previews, documents)
  for (const path of EXCLUDED_PATHS) {
    if (url.pathname.includes(path)) {
      return;
    }
  }

  // D. Skip excluded file extensions
  if (EXCLUDED_EXTENSIONS.test(url.pathname)) {
    return;
  }

  // E. Skip external media streaming hosts
  if (EXTERNAL_MEDIA_HOSTS.some((host) => url.hostname.includes(host))) {
    return;
  }

  // =========================================================================
  // STRATEGY 1: Navigation Requests (SPA HTML) -> Network-First with Cache Fallback
  // =========================================================================
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: Serve cached index.html
          const cachedIndex = await caches.match('/index.html') || await caches.match('/');
          if (cachedIndex) {
            return cachedIndex;
          }

          // Emergency inline fallback if index.html is missing
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Human 2.0 — Offline</title>
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    background-color: #05070a;
                    color: #e8b98a;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    text-align: center;
                    padding: 24px;
                    box-sizing: border-box;
                  }
                  .card {
                    max-width: 320px;
                  }
                  h1 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
                  p { font-size: 14px; color: #9eb2be; line-height: 1.5; margin-bottom: 20px; }
                  button {
                    background-color: #17495e;
                    color: #e8b98a;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 9999px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                  }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>Human 2.0</h1>
                  <p>You are currently offline. Please reconnect to initialize Sleep Sanctuary.</p>
                  <button onclick="window.location.reload()">Retry Connection</button>
                </div>
              </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // =========================================================================
  // STRATEGY 2: Same-Origin Static Assets (/assets/*) -> Cache-First
  // =========================================================================
  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        });
      })
    );
    return;
  }

  // =========================================================================
  // STRATEGY 3: Google Fonts & CDNs -> Stale-While-Revalidate
  // =========================================================================
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // =========================================================================
  // STRATEGY 4: Other Same-Origin Requests -> Stale-While-Revalidate
  // =========================================================================
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
