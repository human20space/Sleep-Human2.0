# Handoff Report: Codebase & Build Baseline Survey

**Agent:** Survey Explorer 1 (`teamwork_preview_explorer_survey_1`)  
**Mission:** Technical baseline survey of codebase structure, build setup, dependencies, entry points, and environment setup for PWA and Sleep Supporting mobile conversion.  
**Report Type:** Hard Handoff (Task Complete)  
**Date:** 2026-10-08  

---

## 1. Observation

1. **Framework & Dependencies (`package.json:12-30`):**
   - React: `^19.2.8`, `react-dom`: `^19.2.8`
   - Vite: `^8.3.0` (installed runtime: Vite `8.3.2`)
   - TypeScript: `~6.0.2`
   - Tailwind CSS: `@tailwindcss/vite` (`^4.3.3`), `tailwindcss` (`^4.3.3`)
   - Animation & Icons: `framer-motion` (`^14.0.0`), `lucide-react` (`^1.51.0`), `canvas-confetti` (`^1.9.4`)
   - Zero existing PWA packages (`vite-plugin-pwa` is not installed; no Workbox in `package.json`).
   - Zero Capacitor packages currently present.

2. **Build Tooling & Configuration (`vite.config.ts:1-12`, `tsconfig.app.json:1-26`):**
   - `vite.config.ts`:
     ```typescript
     import { defineConfig } from 'vite'
     import react from '@vitejs/plugin-react'
     import tailwindcss from '@tailwindcss/vite'
     export default defineConfig({
       plugins: [react(), tailwindcss()],
       server: { host: true, allowedHosts: true },
     })
     ```
   - TypeScript options: `"moduleResolution": "bundler"`, `"target": "es2023"`, `"erasableSyntaxOnly": true`, `"verbatimModuleSyntax": true`.
   - Output directory: Defaults to single `dist/` directory.

3. **Build Execution Command & Tool Output:**
   - Tool Command: `cmd.exe /c "npm run build"` (`tsc -b && vite build`)
   - Result: Exit code 0. Execution time: 14.22s.
   - Verbatim Build Output:
     ```
     dist/index.html                   0.88 kB │ gzip:   0.51 kB
     dist/assets/index-DQBL7siA.css   72.96 kB │ gzip:  11.75 kB
     dist/assets/index-AO7QvTZG.js   665.06 kB │ gzip: 186.62 kB
     (!) Some chunks are larger than 500 kB after minification.
     ✓ built in 14.22s
     ```

4. **Linting Execution Command & Tool Output:**
   - Tool Command: `cmd.exe /c "npm run lint"` (`oxlint`)
   - Result: Exit code 0. Execution time: 619ms across 37 files.
   - Verbatim Output: `Found 15 warnings and 0 errors.` (Warnings relate to `Date.now()` within event handlers in `EbbCompanionScreen.tsx:150`, `MirrorScreen.tsx:60`, and download script parameters).

5. **Static Assets & Critical Size Hazard (`public/` directory):**
   - `public/audio/` contains 48 audiobook MP3 files (`Chapter 1.mp3` through `Chapter 45.mp3`), totaling > 600 MB.
   - `public/videos/intro.mp4` is 48,873,523 bytes (~48.8 MB).
   - `public/favicon.svg` is 9,522 bytes (48x46 purple/blue glyph, not matching Human 2.0 brand guidelines).
   - No `manifest.webmanifest`, `manifest.json`, or PWA icons (192, 512, apple-touch-icon) exist.

6. **Environment Variables & Runtime URLs:**
   - Grep for `import.meta.env` in `src/`: 0 results found.
   - Grep for `process.env` in `src/`: 0 results found.
   - No `.env` or `.env.example` files exist in project root.
   - `src/vite-env.d.ts` is absent.
   - External URLs identified in code:
     - `src/data/audioChaptersData.ts:3-4` and `src/context/AudioContext.tsx:113,210,233`: Google Drive stream URLs (`https://drive.usercontent.google.com/download?id=...`).
     - `src/components/ProfileScreen.tsx:39-46`: Amazon book store links.

7. **Viewport, Frame & Safe-Area Observations:**
   - `index.html:5`: `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />` is already present.
   - `index.html` lacks `<meta name="apple-mobile-web-app-capable" content="yes">`, status-bar styling, and `<link rel="manifest">`.
   - `src/components/PhoneFrame.tsx:23,117,141`: Checks `window.innerWidth < 640`. On screens >= 640px, it displays a simulated phone bezel and top header, even if running as a standalone PWA or on an iPad/tablet.
   - `src/components/BottomTabBar.tsx:23`: Implements `pb-[max(env(safe-area-inset-bottom),10px)]`. Screen top headers, however, use hardcoded `pt-3.5` without `env(safe-area-inset-top)`.

---

## 2. Logic Chain

1. **Step 1 (Architecture & Wrapper Compatibility):** From Observation 1, 2, and 3, the project compiles cleanly into `dist/` with a static `index.html`, one CSS bundle (72.96 kB), and one JS bundle (665.06 kB) with zero backend runtime or SSR dependencies. Therefore, the build output satisfies 100% of the prerequisite constraints for Capacitor packaging (`webDir: "dist"`), static web hosting, and PWA precaching.
2. **Step 2 (The Audio Precache Hazard):** From Observation 5, `public/audio/` contains over 600 MB of audio files and `public/videos/` contains 48 MB of video. Because Vite automatically copies all files from `public/` into `dist/`, any generic PWA service worker configuration that precaches `dist/**/*` would attempt to precache > 650 MB of binary media into CacheStorage upon first visit. On mobile browsers, this causes storage quota errors and install failures. Therefore, the service worker precache manifest MUST be strictly restricted to the core app shell (HTML, CSS, JS, icons, fonts) and explicitly exclude `**/audio/**` and `**/videos/**`.
3. **Step 3 (PWA Implementation Strategy):** From Observation 1 and 2, Vite 8.3.2 is deployed with Rolldown bundler integration. Third-party plugins like `vite-plugin-pwa` may encounter peer-dependency frictions or Rolldown differences with Vite 8. A clean, native custom service worker located in `public/sw.js` with an automated build-time precache list or a carefully verified `vite-plugin-pwa` setup can provide seamless app shell caching, update toasts (`SKIP_WAITING`), and offline fallbacks without dependency bloat.
4. **Step 4 (Safe Area & Tablet Experience):** From Observation 7, while `viewport-fit=cover` and bottom safe-area padding exist on `BottomTabBar.tsx`, top screen headers lack `env(safe-area-inset-top)`. In iOS standalone mode, this causes UI overlap with the notch/Dynamic Island. Furthermore, `PhoneFrame.tsx` forces a fake iPhone bezel for viewports >= 640px. Therefore, `PhoneFrame.tsx` must be augmented to detect standalone PWA mode (`window.matchMedia('(display-mode: standalone)').matches`) to render native edge-to-edge on tablets.
5. **Step 5 (Configuration Discipline):** From Observation 6, external URLs (Google Drive fallback, Amazon links) are hardcoded. Fulfilling Requirement R3 requires introducing `.env.example`, `src/vite-env.d.ts`, and referencing `import.meta.env.VITE_*`.

---

## 3. Caveats

1. **Audio Streaming over HTTPS:** Local audio files (`public/audio/Chapter *.mp3`) contain spaces in their filenames. `AudioContext.tsx` encodes them with `encodeURIComponent`, but browsers in standalone PWA mode require HTTP range request handling if service worker intercepts audio requests. Audio requests should either bypass the service worker or use Cache-Control network-first bypass.
2. **Offline Audio Playback Scope:** App shell precaching will allow the entire app UI, somatic practices, meditation timer, ambient drone synthesizer, and offline AI teacher to work completely offline. Full offline playback of all 45 audio chapters (>600 MB) is intentionally out-of-scope for the initial PWA shell install to respect device storage quotas.
3. **PowerShell Script Policy:** On Windows systems where `.ps1` execution is disabled, executing npm commands directly in PowerShell produces an authorization error. All automated commands should continue using `cmd.exe /c "..."`.

---

## 4. Conclusion

The Human 2.0 repository has a solid, clean, and modern codebase ready for PWA transformation and Sleep Supporting mobile streamlining:
1. **Build Baseline:** Fast (14.2s), clean static output in `dist/`, zero SSR code, zero build errors, zero lint errors.
2. **PWA Action Items:**
   - Create `public/manifest.webmanifest` matching brand specs.
   - Generate brand icon suite: 192x192, 512x512, maskable 512x512, and 180x180 apple-touch-icon.
   - Register a service worker with strict App Shell precaching (HTML/CSS/JS only) that strictly excludes `public/audio/` and `public/videos/`.
   - Implement update toast on `waiting` service worker and custom install sheets.
3. **Mobile & Capacitor Action Items:**
   - Add iOS PWA meta tags in `index.html`.
   - Add top safe-area padding (`env(safe-area-inset-top)`) across screen headers.
   - Support standalone mode in `PhoneFrame.tsx` for tablet/iPad edge-to-edge rendering.
   - Parameterize endpoints with `import.meta.env.VITE_*` and add `vite-env.d.ts`.

---

## 5. Verification Method

To independently reproduce and verify this baseline assessment:

1. **Verify Static Build:**
   ```powershell
   cmd.exe /c "npm run build"
   ```
   *Expected result:* Exit code 0, build succeeds in under 20 seconds, emitting `dist/index.html` (~0.88 kB), `dist/assets/index-*.css` (~73 kB), and `dist/assets/index-*.js` (~665 kB).

2. **Verify Linter:**
   ```powershell
   cmd.exe /c "npm run lint"
   ```
   *Expected result:* Exit code 0, 0 errors, 15 warnings across 37 files.

3. **Verify Audio Asset Footprint in `public/audio`:**
   Inspect `public/audio` to verify 48 files totaling ~600MB:
   ```powershell
   cmd.exe /c "dir public\audio"
   ```

4. **Verify Clean Static Output for Capacitor:**
   Inspect `dist/` to confirm that all assets are static HTML/JS/CSS without any server dependencies:
   ```powershell
   cmd.exe /c "dir dist"
   ```

5. **Invalidation Conditions:**
   - Any dependency update introducing server runtime dependencies.
   - A service worker configuration that attempts to precache `public/audio/*.mp3`.
   - Modification of `vite.config.ts` altering output directory away from `dist/`.
