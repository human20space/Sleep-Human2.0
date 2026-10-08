# Technical Analysis & Implementation Blueprint: Service Worker, Caching Strategy & Update Flow

**Agent:** `teamwork_preview_explorer` (Milestone 1 Explorer 2)  
**Date:** 2026-10-08  
**Working Directory:** `C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_m1_2`  
**Target Project:** `Human 2.0` (`C:\Users\annak\.gemini\antigravity\scratch\human2`)  
**Mission:** Formulate a concrete, production-ready implementation plan for Vanilla Service Worker (`public/sw.js`), client-side registration bridge (`src/pwa/registerServiceWorker.ts`), and non-intrusive Update Toast UI (`src/components/UpdateToast.tsx`), with explicit hazard guards against caching large media (>650MB).

---

## 1. Executive Summary & Scope Definition

The Human 2.0 application is a pure client-side Single Page Application (SPA) built with React 19, TypeScript ~6.0.2, Vite 8 (using Rolldown), and Tailwind CSS v4. The application is designed to function as an installable Progressive Web App (PWA) and "Sleep Supporting Mobile App" for iOS, Android, and native wrappers (Capacitor/Cordova).

This report establishes the technical blueprints for three interdependent subsystems of Milestone 1:
1. **Vanilla Service Worker (`public/sw.js`)**: An autonomous caching engine providing instant offline boot, app shell resilience, stale cache eradication, and a hardened multi-layer Hazard Guard.
2. **Client-Side Registration Bridge (`src/pwa/registerServiceWorker.ts`)**: A resilient TypeScript bridge managing the service worker lifecycle, detecting background updates, checking for new versions on window visibility, and coordinating atomic reloads.
3. **Non-Intrusive Update Toast (`src/components/UpdateToast.tsx`)**: A floating top-mounted notification pill ("New version available · Tap to refresh") styled to match Human 2.0's Night Sanctuary aesthetic, triggering instant skip-waiting and controller-change reloads without interrupting user meditation or audio sessions.

### Scope Boundaries:
- **Read-Only Explorer Mandate**: No source code files in `public/` or `src/` are modified during this phase.
- **Delivery**: Production-grade architecture, complete code implementations, failure analysis, and verifiable step-by-step testing protocols.

---

## 2. Hazard Audit: Media Asset Inventory & Failure Modes

### 2.1 Static Asset Audit in `public/`
A comprehensive inspection of the `public/` directory reveals large static media files copied verbatim into `dist/` during the Vite build:

| Path | File Count | Size | Type / Purpose |
| :--- | :--- | :--- | :--- |
| `public/audio/` | 48 files | ~600 MB | Audiobook MP3 recordings (Chapters 1–45 + samples) |
| `public/videos/` | 1 file (`intro.mp4`) | 48.8 MB | Brand intro video |
| `public/video_2026-10-03_17-42-43.mp4` | 1 file | 48.8 MB | Legacy staging video |
| `public/human2_process_flow_diagram.pdf` | 1 file | 1.9 MB | Architecture diagram document |
| `public/process_flow.html` | 1 file | 48.5 kB | Process flow HTML document |
| `public/favicon.svg` | 1 file | 9.5 kB | Browser tab favicon |
| `public/icons.svg` | 1 file | 5.0 kB | SVG sprite sheet |

**Total media weight in `public/`:** **~700 MB**.

### 2.2 Critical Failure Modes of Unbounded Caching
If a standard service worker attempts to precache or aggressively runtime-cache `public/` assets:

1. **Storage Quota Depletion & Eviction**:
   Mobile browsers (especially iOS WebKit with a ~50MB to 1GB partition limit) will throw a fatal `QuotaExceededError`. WebKit may purge the entire origin's storage—wiping out user journals, bookmarks, and local settings in `localStorage`.
2. **HTTP 206 Partial Content Crash (`TypeError`)**:
   HTML5 `<audio>` and `<video>` elements issue HTTP Range requests (`Range: bytes=0-`). Servers respond with `HTTP 206 Partial Content`.
   According to the W3C CacheStorage specification:
   ```
   Calling cache.put(request, response) with a 206 response throws a TypeError:
   "Failed to execute 'put' on 'Cache': Partial response (status code 206) is not supported."
   ```
   Attempting to cache a 206 response causes an unhandled exception in the Service Worker fetch handler, terminating the fetch event and freezing audio/video playback entirely.
3. **Install Phase Timeout**:
   If `cache.addAll()` is supplied with media files, the service worker install step will attempt to download ~700MB over the network. On 3G/4G mobile connections, this results in network timeouts, high cellular data costs, battery drain, and guaranteed Service Worker installation failure.

### 2.3 Multi-Layer Hazard Guard Architecture
To ensure 100% immunity from these failure modes, `public/sw.js` must implement a multi-layer defense in its `fetch` handler:

```
[ Incoming Request in Fetch Handler ]
                 │
                 ├── 1. Non-GET Method? ──────────────────────────► Return (Bypass SW)
                 │
                 ├── 2. Contains `Range` Header? ────────────────► Return (Bypass SW)
                 │
                 ├── 3. Destination is 'audio' or 'video'? ──────► Return (Bypass SW)
                 │
                 ├── 4. Path matches /audio/** or /videos/**? ───► Return (Bypass SW)
                 │
                 ├── 5. File extension matches media/doc list? ──► Return (Bypass SW)
                 │      (.mp3, .mp4, .wav, .ogg, .pdf, .zip, etc.)
                 │
                 └── 6. External streaming host? ────────────────► Return (Bypass SW)
                        (drive.google.com, drive.usercontent.google.com)
                 │
                 ▼
      [ Proceed to App Shell Caching Routes ]
```

**Crucial Architecture Decision: `return;` vs `event.respondWith(fetch(request))`**:
When the Hazard Guard matches a media or range request, it must execute a bare `return;` without calling `event.respondWith()`.
- Returning without calling `event.respondWith()` instructs the browser to bypass the Service Worker completely and handle the request natively.
- This allows the browser's native C++ media stack to handle HTTP Range requests, audio buffering, hardware decoding, and OS lockscreen media controls with zero JavaScript thread latency.

---

## 3. Service Worker Architecture: `public/sw.js`

### 3.1 Design Principles
1. **Zero External Dependencies**: Pure vanilla JavaScript implementation. Immune to bundler or Vite 8 plugin version incompatibilities.
2. **App Shell Precaching**: Only HTML, CSS, JS, critical fonts, and brand icons are precached.
3. **Network-First Navigation with Offline Fallback**: Guarantees that online users immediately receive the latest code push, while offline users are served the cached `index.html`.
4. **Cache-First for Immutable Assets**: Hashed Vite bundles (`/assets/*`) are immutable; once fetched, they are served from cache for instant response times.
5. **Atomic Stale Cache Eviction**: Purges all previous cache buckets on `activate`.
6. **Skip-Waiting Coordination**: Listens for `{ type: 'SKIP_WAITING' }` messages to take immediate control.

### 3.2 Complete Implementation: `public/sw.js`

```javascript
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
        // Atomic precache of essential assets
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Do NOT call skipWaiting() here automatically;
        // Wait for user confirmation via the Update Toast.
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
            // Delete old versions of human2 caches
            if (key.startsWith('human2-') && key !== CACHE_NAME) {
              console.log('[ServiceWorker] Purging stale cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        // Take immediate control of all open clients
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

  // 1. Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  // =========================================================================
  // HAZARD GUARD: Strictly exclude media, video, audio & range requests
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
```

---

## 4. Client-Side Registration Bridge: `src/pwa/registerServiceWorker.ts`

### 4.1 Lifecycle State Machine
The client-side registration bridge coordinates the following state transitions:

```
[ Page Load Event ]
       │
       ▼
[ navigator.serviceWorker.register('/sw.js') ]
       │
       ├── Case A: registration.waiting exists on load
       │        └──► Fire `onUpdateAvailable(registration)`
       │
       └── Case B: registration.addEventListener('updatefound')
                │
                ▼
       [ worker = registration.installing ]
                │
                ▼
       [ worker.addEventListener('statechange') ]
                │
                ├── state === 'installed' && navigator.serviceWorker.controller
                │        └──► Fire `onUpdateAvailable(registration)`
                │
                └── state === 'installed' && !navigator.serviceWorker.controller
                         └──► Fire `onInstalled()` (Precached for the first time)
```

### 4.2 Key Resiliency Requirements
1. **Deferred Execution**: Invoked strictly inside `window.addEventListener('load')` to prevent contention with critical hydration and font loading.
2. **Double-Trigger Prevention**: Includes a `refreshing` guard on `controllerchange` to guarantee that the page reloads exactly once.
3. **App Resumption Checks**: Adds a `visibilitychange` listener that calls `registration.update()` whenever the app returns to the foreground, ensuring immediate detection of new deploys.
4. **React Hook Ergonomics**: Provides both a classic registration callback API and a React hook (`useServiceWorkerUpdate`) for declarative component integration.

### 4.3 Complete Implementation: `src/pwa/registerServiceWorker.ts`

```typescript
/**
 * Human 2.0 — Service Worker Registration Bridge
 * Provides lifecycle coordination, update detection, and reload triggering.
 */

import { useState, useEffect } from 'react';

export interface ServiceWorkerHooks {
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;
  onInstalled?: () => void;
  onError?: (error: Error) => void;
}

// Global reference to the active registration
let swRegistration: ServiceWorkerRegistration | null = null;
let updateAvailableCallback: ((reg: ServiceWorkerRegistration) => void) | null = null;

/**
 * Registers the Service Worker and sets up update listeners.
 */
export function registerServiceWorker(hooks?: ServiceWorkerHooks): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Defer registration until window load to optimize initial render and TTI
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        swRegistration = registration;

        // Check if an updated worker is already waiting in the background
        if (registration.waiting) {
          hooks?.onUpdateAvailable?.(registration);
          updateAvailableCallback?.(registration);
        }

        // Listen for new updates discovered during the session
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // An active controller exists; this installed worker is an update
                hooks?.onUpdateAvailable?.(registration);
                updateAvailableCallback?.(registration);
              } else {
                // First-time app shell precache completed
                hooks?.onInstalled?.();
              }
            }
          });
        });

        // Periodic background update check (every 60 minutes)
        const hourlyInterval = setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        // Check for updates when app returns to foreground (tab switch or mobile unlock)
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup if window unloads
        window.addEventListener('unload', () => {
          clearInterval(hourlyInterval);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        });
      })
      .catch((error) => {
        console.warn('[SW Bridge] ServiceWorker registration failed:', error);
        hooks?.onError?.(error instanceof Error ? error : new Error(String(error)));
      });

    // Handle controller change: Reload page once new worker activates
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

/**
 * Tells the waiting Service Worker to skip waiting and activate immediately.
 */
export function applyServiceWorkerUpdate(registration?: ServiceWorkerRegistration | null): void {
  const targetReg = registration || swRegistration;
  if (!targetReg || !targetReg.waiting) {
    // If no waiting worker is found, attempt fallback reload
    window.location.reload();
    return;
  }

  // Post message to waiting service worker
  targetReg.waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * React Hook for consuming Service Worker update states.
 */
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    updateAvailableCallback = (reg) => {
      setRegistration(reg);
      setUpdateAvailable(true);
    };

    // If an update was already detected prior to hook mounting
    if (swRegistration?.waiting) {
      setRegistration(swRegistration);
      setUpdateAvailable(true);
    }

    return () => {
      updateAvailableCallback = null;
    };
  }, []);

  const triggerUpdate = () => {
    applyServiceWorkerUpdate(registration);
  };

  return {
    updateAvailable,
    triggerUpdate,
    dismissUpdate: () => setUpdateAvailable(false),
  };
}
```

---

## 5. Non-Intrusive Update Toast: `src/components/UpdateToast.tsx`

### 5.1 UX & Visual Hierarchy Design
1. **Positioning**:
   Top of the screen: `top-[max(env(safe-area-inset-top),14px)]`.
   - **Why top instead of bottom?**
     The bottom of the Human 2.0 viewport contains two high-priority interactive layers:
     - `BottomTabBar` (`z-40`, height ~64px + safe-area bottom)
     - `MiniPlayerBar` (`z-30`, floating directly above `BottomTabBar`)
     Placing the toast at the bottom risks obscuring active playback controls (play/pause, scrubber, chapter titles) or overlapping navigation tabs.
     Positioning the toast at the top presents it as an elegant status capsule (resembling the iOS Dynamic Island / notification banner) that remains completely clear of audio controls.
2. **Palette Coordination**:
   - Background: `#101b22` / `rgba(16, 27, 34, 0.95)` with `backdrop-blur-md`
   - Border: `#d9a44a` (gold) with 35% opacity
   - Monogram / Accent: `#e8b98a` (warm champagne gold)
   - Action Button: `#17495e` (deep sanctuary teal) with gold text
   - Typography: Crisp Inter font matching the Human 2.0 design system
3. **Motion & Interaction**:
   - Powered by Framer Motion (`framer-motion: ^14.0.0`).
   - Springs into view from `y: -32` with opacity fade.
   - User tap on "Tap to refresh" triggers `triggerUpdate()`, transitions the button into a spinning refresh state, and dismisses the banner prior to reload.
   - An optional close icon allows users in deep meditation or sleep listening to defer the refresh until their session ends.

### 5.2 Complete Implementation: `src/components/UpdateToast.tsx`

```tsx
/**
 * Human 2.0 — UpdateToast Component
 * Surfaces a sleek, non-intrusive notification when a new app version is ready.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles, X } from 'lucide-react';

interface UpdateToastProps {
  show: boolean;
  onRefresh: () => void;
  onDismiss?: () => void;
}

export const UpdateToast: React.FC<UpdateToastProps> = ({
  show,
  onRefresh,
  onDismiss,
}) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          role="status"
          aria-live="polite"
          aria-label="Update notification"
          initial={{ y: -32, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -32, opacity: 0, scale: 0.96 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            mass: 0.8,
          }}
          className="absolute top-[max(env(safe-area-inset-top),14px)] left-3 right-3 z-50 flex justify-center pointer-events-none"
        >
          <div className="bg-[#101b22]/95 text-[#f2ede4] backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-[#d9a44a]/40 shadow-[0_12px_32px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 pointer-events-auto max-w-sm w-full transition-colors">
            {/* Left Status Glyph & Message */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#17495e]/80 border border-[#e8b98a]/30 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-[#e8b98a] animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#f2ede4] leading-tight truncate">
                  New version available
                </p>
                <p className="text-[11px] text-[#9eb2be] leading-tight truncate">
                  Tap to refresh app
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-[#17495e] hover:bg-[#1f5f78] active:scale-95 text-[#e8b98a] text-xs font-semibold border border-[#d9a44a]/30 shadow-xs cursor-pointer transition-all disabled:opacity-70"
                title="Refresh application with new version"
              >
                <RefreshCw
                  size={12}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
                <span>{isRefreshing ? 'Refreshing…' : 'Refresh'}</span>
              </button>

              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="p-1.5 min-w-[32px] min-h-[32px] rounded-lg text-[#9eb2be] hover:text-[#f2ede4] hover:bg-white/5 active:scale-90 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Dismiss update notification"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
```

---

## 6. Integration Architecture in React Root

### 6.1 Wiring Plan
To connect `registerServiceWorker` and `UpdateToast`:

1. **Initialization in `src/main.tsx`**:
   Call `registerServiceWorker()` right after mounting the React root:
   ```typescript
   // src/main.tsx
   import { StrictMode } from 'react'
   import { createRoot } from 'react-dom/client'
   import './index.css'
   import App from './App.tsx'
   import { registerServiceWorker } from './pwa/registerServiceWorker'

   createRoot(document.getElementById('root')!).render(
     <StrictMode>
       <App />
     </StrictMode>,
   )

   // Initialize PWA Service Worker engine
   registerServiceWorker();
   ```

2. **Mounting `UpdateToast` in `src/App.tsx`**:
   Inside `AppContent` in `src/App.tsx`:
   ```tsx
   import { useServiceWorkerUpdate } from './pwa/registerServiceWorker';
   import { UpdateToast } from './components/UpdateToast';

   export function AppContent() {
     // ... other existing state ...
     const { updateAvailable, triggerUpdate, dismissUpdate } = useServiceWorkerUpdate();

     return (
       <PhoneFrame ...>
         <div className="relative w-full h-full flex flex-col overflow-hidden">
           {/* Update Toast Floats at top level */}
           <UpdateToast
             show={updateAvailable}
             onRefresh={triggerUpdate}
             onDismiss={dismissUpdate}
           />

           {/* ... existing AnimatePresence screen router ... */}
           {/* ... MiniPlayerBar ... */}
           {/* ... BottomTabBar ... */}
         </div>
       </PhoneFrame>
     );
   }
   ```

---

## 7. Verification & Testing Protocol

The following validation procedures ensure strict adherence to all acceptance criteria:

### 7.1 Hazard Guard & Storage Quota Verification
- **Test Objective**: Verify that media files in `public/` are NEVER precached or cached by the service worker.
- **Verification Steps**:
  1. Open Chrome DevTools > Application > Cache Storage > `human2-shell-v1`.
  2. Inspect cached URLs.
  3. **Pass Criteria**:
     - Total cached entries <= 25 items.
     - Zero `.mp3` entries.
     - Zero `.mp4` entries.
     - Zero `.pdf` entries.
     - Total cache size is under 2 MB.
  4. Play Chapter 1 audiobook audio and open Network tab:
     - Response status is `206 Partial Content`.
     - Request initiator is native browser media engine.
     - Service worker console emits zero `TypeError` exceptions.

### 7.2 Offline Navigation Verification
- **Test Objective**: Verify that the app shell loads completely offline.
- **Verification Steps**:
  1. Load the app in Chrome.
  2. In DevTools Network tab, select "Offline".
  3. Refresh the page (`F5`).
  4. **Pass Criteria**:
     - The page loads cleanly from CacheStorage.
     - React initializes the UI with zero network error screens.
     - Offline procedural audio synthesizer (Solfeggio tones, Delta binaurals, Rain soundscapes) plays audio without network connection.

### 7.3 Instant Update Flow Verification
- **Test Objective**: Verify that the Update Toast surfaces on new code pushes and triggers an immediate reload upon tap.
- **Verification Steps**:
  1. With the app running, modify `CACHE_VERSION` in `public/sw.js` to `'v2'`.
  2. In Chrome DevTools > Application > Service Workers, observe that the new worker installs and enters the `waiting to activate` state.
  3. The `UpdateToast` appears at the top of the viewport with the text "New version available".
  4. Click "Refresh".
  5. **Pass Criteria**:
     - The waiting worker receives `{ type: 'SKIP_WAITING' }`.
     - The new worker activates.
     - Cache storage purges `human2-shell-v1` and establishes `human2-shell-v2`.
     - The page automatically reloads with the new version.

### 7.4 Build & Lint Verification
- **Build command**: `cmd.exe /c "npm run build"` (`tsc -b && vite build`)
- **Lint command**: `cmd.exe /c "npm run lint"` (`oxlint`)
- **Pass Criteria**: Exit code 0, single `dist/` directory output.

---
*Blueprint formulated by Teamwork Preview Explorer (M1 Explorer 2).*
