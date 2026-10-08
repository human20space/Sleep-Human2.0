# Handoff Report: Service Worker, Caching Strategy & Update Toast

**From:** `teamwork_preview_explorer` (Milestone 1 Explorer 2)  
**To:** Orchestrator & Milestone 1 Implementers  
**Date:** 2026-10-08  
**Scope:** Vanilla Service Worker (`public/sw.js`), Client Bridge (`src/pwa/registerServiceWorker.ts`), Update Toast (`src/components/UpdateToast.tsx`), and Media Hazard Exclusion.

---

## 1. Observation

1. **Static Media Weight in `public/`**:
   - `public/audio/` contains 48 audiobook chapter MP3 files totaling ~600 MB (`public/audio/Ch01_*.mp3` through `Ch45_*.mp3`).
   - `public/videos/intro.mp4` measures 48,873,523 bytes (~48.8 MB).
   - `public/video_2026-10-03_17-42-43.mp4` measures 48,873,523 bytes (~48.8 MB).
   - `public/human2_process_flow_diagram.pdf` measures 1,917,706 bytes (~1.9 MB).
   - Total uncompressed non-app-shell media copied by Vite into `dist/` is ~700 MB.
2. **Browser Media & CacheStorage Specification Constraint**:
   - Audio playback in `AudioContext.tsx` lines 112–114 issues HTTP Range requests: `Range: bytes=0-`.
   - The server responds with `HTTP 206 Partial Content`.
   - The W3C CacheStorage specification prohibits storing 206 responses: calling `cache.put(request, response)` throws `TypeError: Failed to execute 'put' on 'Cache': Partial response (status code 206) is not supported.`
3. **Current Entry Point & Routing Baseline**:
   - `src/main.tsx` (lines 6–10) mounts `<App />` with `createRoot(document.getElementById('root')!)`. No service worker registration exists.
   - `src/App.tsx` (lines 403–421) defines bottom-anchored components:
     - `MiniPlayerBar` anchored at `bottom-[66px]` (`z-30`).
     - `BottomTabBar` anchored at `bottom-0` (`z-40`).
   - `PhoneFrame.tsx` (lines 140–150) establishes a simulated desktop frame (`w-[390px] h-[844px]`) on screens `>= 640px` and edge-to-edge view (`window.innerWidth < 640`).
4. **Build and Lint Verification**:
   - Command `cmd.exe /c "npm run build"` (`tsc -b && vite build`) executes cleanly with **Exit Code 0** in 16.30s.
     Outputs: `dist/index.html` (0.88 kB), `dist/assets/index-T_uxuKi_.css` (74.88 kB), `dist/assets/index-CG5kvjOB.js` (665.06 kB).
   - Command `cmd.exe /c "npm run lint"` (`oxlint`) passes with **Exit Code 0** (15 warnings, 0 errors across 38 files).

---

## 2. Logic Chain

1. **Hazard Exclusion (Observations 1 & 2)**:
   Because `public/audio/` and `public/videos/` hold ~700 MB of media, and because `<audio>` Range requests trigger `HTTP 206` which crashes `cache.put()` with a fatal `TypeError`:
   The Service Worker `fetch` handler in `public/sw.js` must implement an airtight Hazard Guard that matches Range headers (`request.headers.has('range')`), media destinations (`request.destination === 'audio' || request.destination === 'video'`), and media paths/extensions (`/audio/`, `/videos/`, `.mp3`, `.mp4`, `.pdf`).
   Crucially, when matched, it must immediately `return;` without calling `event.respondWith()`. This bypasses the Service Worker execution thread and hands control directly to the browser's native media engine for smooth audio buffering and zero quota consumption.
2. **Offline Resilience & App Shell Caching (Observations 1, 3, & 4)**:
   Because Human 2.0 is an SPA with all code packaged into static bundles, caching the app shell (`/`, `/index.html`, `/manifest.webmanifest`, `/favicon.svg`, `/icons/*`, and same-origin `/assets/*`) is sufficient to guarantee 100% offline startup.
   Navigation requests (`request.mode === 'navigate'`) use Network-First with a cached `/index.html` fallback. If offline, the cached HTML loads, fetches cached CSS and JS bundles, and renders the UI instantly without server contact.
3. **Instant Update Coordination**:
   To satisfy the requirement of zero stale versions:
   `public/sw.js` listens for `{ type: 'SKIP_WAITING' }`. On `activate`, it purges all previous `human2-*` caches and claims clients via `self.clients.claim()`.
   `src/pwa/registerServiceWorker.ts` registers `/sw.js` on `window.load`, monitors `registration.waiting` and `updatefound`, checks updates on `visibilitychange`, and coordinates with `navigator.serviceWorker.addEventListener('controllerchange')` with a single-execution `refreshing` guard.
4. **Update Toast UI Placement (Observation 3)**:
   Because `BottomTabBar` (`z-40`) and `MiniPlayerBar` (`z-30`) occupy the bottom 120px of the mobile viewport, placing an update toast at the bottom would collide with audio controls.
   Placing `UpdateToast.tsx` at `top-[max(env(safe-area-inset-top),14px)]` (`z-50`) positions it as an elegant floating status pill (similar to iOS Dynamic Island) that stays clear of audio controls, clears device notches, and remains constrained within `PhoneFrame` on desktop simulators.

---

## 3. Caveats

1. **PWA Icons Dependency**: The Service Worker precache list in `public/sw.js` references `/icons/icon-192x192.png`, `/icons/icon-512x512.png`, etc. These files are being generated under Milestone 1 Explorer 1. If `/sw.js` is installed before those icons are landed in `public/icons/`, `cache.addAll()` could reject. Implementers must ensure icon generation or landing precedes or is co-committed with `sw.js`.
2. **Audio Offline Limitation**: Because audio files are explicitly excluded from the Service Worker cache, the 45 MP3 audiobook chapters will not play offline unless the device has network connectivity. However, the procedural Web Audio engine (`audioEngine.ts`) provides Solfeggio 432Hz/528Hz, Delta wave binaurals, and ocean rain synthesizers that work 100% offline without network requests.
3. **Self-Signed / HTTP Localhost**: Service workers only register on secure origins (`https://` or `http://localhost`). Network testing on local mobile devices over Wi-Fi requires an HTTPS tunnel or localhost port-forwarding via Chrome remote debugging (`chrome://inspect`).

---

## 4. Conclusion

A robust, production-ready blueprint has been formulated and documented in:
`C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_m1_2\analysis.md`

Key deliverables specified:
1. `public/sw.js`: Vanilla Service Worker with multi-layer media Hazard Guard, app shell precaching, stale cache eviction, and `SKIP_WAITING` handler.
2. `src/pwa/registerServiceWorker.ts`: Resilient client bridge with visibility-based update checks, `controllerchange` auto-reload, and `useServiceWorkerUpdate` React hook.
3. `src/components/UpdateToast.tsx`: Non-intrusive floating top capsule with Night Sanctuary styling, Framer Motion spring physics, and tap-to-refresh execution.

---

## 5. Verification Method

To independently verify the implementation once landed:

1. **Build and Lint Verification**:
   ```powershell
   cmd.exe /c "npm run build"
   cmd.exe /c "npm run lint"
   ```
   Both commands must exit with code 0.
2. **Hazard Guard & CacheStorage Quota Verification**:
   - Launch app: `cmd.exe /c "npm run preview"` (or `npm run dev`).
   - Open Chrome DevTools > Application > Cache Storage > `human2-shell-v1`.
   - Confirm: Total cache size is < 2 MB; zero `.mp3`, `.mp4`, or `.pdf` entries are present.
   - Play an audiobook chapter; verify in Network tab that requests return `206 Partial Content` without throwing `TypeError` in the Service Worker console.
3. **Offline Navigation Verification**:
   - In DevTools Network tab, toggle throttling to "Offline".
   - Reload page (`F5`).
   - Confirm: App shell boots successfully and procedural audio in `audioEngine.ts` plays.
4. **Update Toast Verification**:
   - In `public/sw.js`, bump `CACHE_VERSION` to `'v2'`.
   - Observe in DevTools that the new service worker enters the `waiting to activate` state.
   - Confirm: `UpdateToast` appears at the top of the viewport.
   - Click "Refresh"; verify that `self.skipWaiting()` is invoked and the page reloads under `human2-shell-v2`.
