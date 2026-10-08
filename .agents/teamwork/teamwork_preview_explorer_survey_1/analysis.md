# Technical Baseline Analysis Report: Codebase Structure & Build Baseline

**Author:** Survey Explorer 1 (`teamwork_preview_explorer_survey_1`)  
**Target Application:** Human 2.0 (`C:\Users\annak\.gemini\antigravity\scratch\human2`)  
**Mission:** Establish the technical baseline for converting Human 2.0 to a high-performance Progressive Web App (PWA) and Sleep Supporting mobile app with Capacitor readiness.  
**Date:** 2026-10-08  

---

## 1. Executive Summary

Human 2.0 is a modern, purely client-side Single Page Application (SPA) built with **React 19**, **TypeScript ~6.0.2**, **Vite 8.3.2** (utilizing Rolldown bundler engine), and **Tailwind CSS v4** (`@tailwindcss/vite`). 

The application architecture has zero server-side rendering (SSR) dependencies and compiles into a clean static distribution directory (`dist/`). This provides an ideal foundation for both PWA deployment and native wrapper packaging via Capacitor/Cordova.

However, the baseline lacks any existing PWA infrastructure (no `manifest.webmanifest`, no service worker, no PWA icons, missing iOS safe-area insets). Additionally, there is a **major asset hazard**: `public/audio/` contains 48 audiobook MP3 files exceeding 600 MB. Without strict glob exclusions in the service worker, any automated PWA generator would attempt to precache gigabytes of media into CacheStorage, crashing mobile devices.

The build and lint systems were independently verified:
- `npm run build` (`tsc -b && vite build`) executes cleanly with **exit code 0** (14.22s build time).
- `npm run lint` (`oxlint`) passes with **exit code 0** (15 benign warnings, 0 errors across 37 files).

---

## 2. Codebase Structure & Directory Layout

### 2.1 Project Root Layout
```
human2/
├── .agents/                 # Teamwork multi-agent orchestration metadata
├── .git/                    # Git repository (active branch: feature/pwa)
├── .gitignore               # Excludes node_modules, dist, logs, IDE configs
├── .oxlintrc.json           # Fast Rust-based linter config
├── index.html               # Main HTML entry point (viewport-fit=cover present)
├── package.json             # Project manifest & scripts
├── package-lock.json        # Pinned dependency tree
├── public/                  # Static assets copied directly to dist/
│   ├── audio/               # 48 Audiobook MP3 chapters (approx. 600MB total)
│   ├── favicon.svg          # Temporary purple/blue SVG favicon (48x46)
│   ├── icons.svg            # UI SVG symbols
│   ├── process_flow.html    # Standalone stakeholder process flow doc
│   ├── human2_process_flow_diagram.pdf # Architecture diagram PDF
│   └── videos/              # intro.mp4 (48.8MB)
├── scripts/                 # Audio download & Drive extraction utility scripts
├── src/                     # React / TypeScript source code
│   ├── assets/              # hero.png, react.svg, vite.svg
│   ├── components/          # 21 React screen & UI components
│   ├── context/             # AudioContext.tsx (stateful audio provider)
│   ├── data/                # Content models, audio metadata, practices
│   ├── services/            # aiTeacherService.ts (on-device AI guidance)
│   ├── types/               # TypeScript interfaces (Screen, AudioChapter, etc.)
│   ├── utils/               # audioEngine.ts (Web Audio synthesis), haptics.ts
│   ├── App.css              # Unused starter CSS (candidate for removal)
│   ├── App.tsx              # Root app component & state-driven router
│   ├── index.css            # Tailwind v4 import, CSS custom variables, keyframes
│   └── main.tsx             # ReactDOM root mount point
├── tsconfig.app.json        # Frontend TypeScript compiler configuration
├── tsconfig.node.json       # Node / Vite configuration TypeScript setup
├── tsconfig.json            # Solution tsconfig referencing app & node configs
└── vite.config.ts           # Vite 8 build & dev server configuration
```

### 2.2 Component Inventory (`src/components/`)
The app utilizes a screen-level state router (`currentScreen` in `App.tsx`) with 21 components:
- **Core Navigation & Frames:** `PhoneFrame.tsx`, `BottomTabBar.tsx`, `MiniPlayerBar.tsx`
- **Primary Screens:**
  - `SplashScreen.tsx` (entry loading with 2.0 monogram)
  - `HomeScreen.tsx` (awareness hub, daily ritual, situational chips)
  - `PauseScreen.tsx` (30-second Sovereign Pause guided breath)
  - `MirrorScreen.tsx` (Fact vs. Story 5-step cognitive deconstruction)
  - `PracticeScreen.tsx` (somatic micro-practices: 30s, 3min, 10min)
  - `JourneyScreen.tsx` (multi-day awareness inquiries)
  - `AudioChaptersScreen.tsx` (45-chapter Human 2.0 audiobook player)
  - `HumanAiScreen.tsx` / `EbbCompanionScreen.tsx` (conversational AI dialogue)
  - `UnguidedTimerScreen.tsx` (interval chime meditation timer)
  - `ExploreLibraryScreen.tsx` (category-based catalog, includes sleep category)
  - `LiveCommunityScreen.tsx` (community sanghas & circles)
  - `VaultScreen.tsx` (private encrypted local insights & MAM storage)
  - `ProfileScreen.tsx` (author bio, book links, settings)
  - `SubscriptionScreen.tsx` (Sovereign Tier unlock flow)
  - `AudioConstructionPlayer.tsx` / `VideoPlayer.tsx` (media preview modals)
  - `StakeholderPreviewSection.tsx` (toggleable feature extensions preview)

---

## 3. Build Setup, Configuration & Dependencies

### 3.1 Dependencies Overview (`package.json`)
```json
{
  "name": "human2",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@types/canvas-confetti": "^1.9.0",
    "canvas-confetti": "^1.9.4",
    "framer-motion": "^14.0.0",
    "lucide-react": "^1.51.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "tailwindcss": "^4.3.3"
  },
  "devDependencies": {
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "@vitejs/plugin-react": "^6.1.1",
    "oxlint": "^1.81.0",
    "typescript": "~6.0.2",
    "vite": "^8.3.0"
  }
}
```

### 3.2 Vite Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
  },
})
```
- **Vite 8 Engine:** Vite `8.3.2` uses Rolldown under the hood for bundler transformations.
- **Tailwind CSS v4:** Directly integrated via `@tailwindcss/vite` plugin without requiring `tailwind.config.js` or `postcss.config.js`. All design tokens are configured in CSS using `@custom-variant dark` and custom properties in `src/index.css`.
- **Server:** Configured with `host: true` and `allowedHosts: true`, enabling remote testing on mobile devices across the local Wi-Fi network.

### 3.3 TypeScript Configuration
- `tsconfig.app.json`:
  - `target`: `es2023`, `lib`: `["ES2023", "DOM"]`
  - `module`: `esnext`, `moduleResolution`: `bundler`
  - `allowImportingTsExtensions`: `true`
  - `verbatimModuleSyntax`: `true`
  - `erasableSyntaxOnly`: `true` (strict TypeScript 5.8+ compatibility)
  - `noEmit`: `true`
  - `jsx`: `react-jsx`
  - Strict linting flags: `noUnusedLocals: true`, `noUnusedParameters: true`

---

## 4. Verification & Baseline Execution Results

### 4.1 Production Build (`npm run build`)
Command executed: `tsc -b && vite build`  
Result: **Exit Code 0 (Success)**  
Time: **14.22 seconds**  
Output artifacts in `dist/`:
- `dist/index.html` — 0.88 kB (gzip: 0.51 kB)
- `dist/assets/index-DQBL7siA.css` — 72.96 kB (gzip: 11.75 kB)
- `dist/assets/index-AO7QvTZG.js` — 665.06 kB (gzip: 186.62 kB)

*Note on Bundle Size:* Vite emitted a warning: `(!) Some chunks are larger than 500 kB after minification`. The single JS bundle is 665 kB (186 kB gzipped). Because the app is an SPA with instant state transitions, this is completely acceptable for offline PWA precaching (under 200 kB gzipped), though code-splitting heavy screens via `React.lazy` can optimize initial parse time.

### 4.2 Linter Execution (`npm run lint`)
Command executed: `oxlint`  
Result: **Exit Code 0 (Success)**  
Time: **619ms across 37 files**  
Findings: **0 errors, 15 warnings**. The warnings relate to calling `Date.now()` inside event callbacks/renders and unused variables in utility download scripts in `scripts/`. No blocking syntax or type errors.

### 4.3 Windows Execution Policy Constraint
When running npm directly in Windows PowerShell (`npm run build`), PowerShell errors out if `.ps1` execution is restricted:
`npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.`
**Solution for automated commands:** Always invoke via `cmd.exe /c "npm run ..."` or `node`.

---

## 5. Entry Points & Architecture

### 5.1 Main Mount Point (`src/main.tsx` & `index.html`)
- `index.html` has `<div id="root"></div>` and loads `<script type="module" src="/src/main.tsx"></script>`.
- `main.tsx` renders `<App />` inside `<StrictMode>`.
- `App.tsx` wraps `<AppContent />` in `<AudioProvider>`.

### 5.2 Routing & Navigation Flow
Routing is client-state driven:
- `currentScreen` state in `src/App.tsx` controls screen rendering using `<AnimatePresence>` from Framer Motion.
- Supported screens typed in `Screen` (`src/types/index.ts`):
  `'splash'`, `'home'`, `'pause'`, `'mirror'`, `'practice'`, `'journey'`, `'human_ai'`, `'vault'`, `'profile'`, `'audio_chapters'`, `'reader'`, `'ebb'`, `'explore'`, `'timer'`, `'community'`, `'foundations'`, `'sleep'`, `'subscription'`.
- Notice: `'sleep'` is already declared in `Screen` enum, ready for dedicated routing.
- Transitions: Smooth sliding and fading transitions with instant back navigation (`onBack={() => setCurrentScreen('home')}`).

### 5.3 Audio Engine & Context (`src/context/AudioContext.tsx`)
- Audio playback utilizes HTML5 `<audio>` element with fallback:
  1. Primary: Local static path `/audio/${encodeURIComponent(chapter.fileName)}`.
  2. Fallback: Google Drive download stream (`https://drive.usercontent.google.com/download?id=${chapter.driveId}&export=download`).
- Sleep Timer: Built-in countdown timer (`sleepTimerMinutes`, `sleepTimerSecondsLeft`) with gradual audio fade-out over 2 seconds when expired.
- Ambient Synthesizer: `src/utils/audioEngine.ts` contains a 100% offline Web Audio API generator (432Hz harmonic drone, Tibetan singing bowl chimes, and breath pacing chimes). Zero network request required.

### 5.4 AI Guidance & Privacy (`src/services/aiTeacherService.ts`)
- Features the Vinay Kapoor AI Companion.
- 100% on-device deterministic synthesis engine that evaluates user mood/inquiry and returns empathetic somatic guidance.
- Safe, zero-latency, private, and functions completely offline without remote API keys.

---

## 6. Environment Variable Handling & Runtime Configuration Baseline

### 6.1 Current Status
- Zero `import.meta.env` references currently exist in `src/`.
- Zero `.env` or `.env.example` files exist in the project root.
- No `src/vite-env.d.ts` declaration file exists.

### 6.2 Requirement R3 Alignment
Requirement R3 states: *"All external endpoints driven via `import.meta.env.VITE_*`."*
Endpoints that must be parameterized:
1. `VITE_GOOGLE_DRIVE_AUDIO_BASE`: Base URL for streaming audio fallbacks.
2. `VITE_APP_NAME` / `VITE_APP_VERSION`: For display and update notifications.
3. `VITE_AMAZON_BOOK_URL`: Configurable link to author's published book.
4. Any future optional telemetry or AI proxy endpoints.

A `.env.example` file and typed `src/vite-env.d.ts` must be created during implementation.

---

## 7. PWA Technical Baseline & Critical Requirements

### 7.1 Web App Manifest (`manifest.webmanifest`)
- **Status:** MISSING.
- **Requirements (R1):**
  - Name: `"Human 2.0"`
  - Short name: `"Human 2.0"`
  - Start URL: `"/"`
  - Scope: `"/"`
  - Display: `"standalone"`
  - Orientation: `"portrait"`
  - Background color: `#05070a` (Night Sanctuary dark theme)
  - Theme color: `#0b1317` (Dark) / `#f7f3ec` (Daylight)
  - Categories: `["health", "lifestyle", "music"]`

### 7.2 Brand Icons Suite
- **Current Status:** Only `public/favicon.svg` exists, which contains a generic purple/blue icon (48x46).
- **Requirements (R1):**
  - `pwa-192x192.png` (Standard PWA icon)
  - `pwa-512x512.png` (High-res splash/store icon)
  - `maskable-icon-512x512.png` (Android adaptive icon with safe zone)
  - `apple-touch-icon.png` (180x180 iOS home screen icon)
  - Visual Design: Human 2.0 brand glyph (serene gold `2.0` monogram with stardust halo on deep night background `#05070a`).

### 7.3 Service Worker & App Shell Strategy
- **Status:** MISSING.
- **CRITICAL HAZARD: Large Audio & Video Files in `public/`**
  - `public/audio/` has 48 MP3 files totaling ~600MB.
  - `public/videos/intro.mp4` is 48.8MB.
  - When Vite builds, it copies all files from `public/` into `dist/`.
  - **Severe Risk:** If a standard service worker generator precaches `dist/**/*`, it will crash the browser cache, exhaust user mobile storage, and cause install timeouts.
  - **Mandatory Strategy:**
    1. **Precache ONLY the App Shell:** `dist/index.html`, `dist/assets/*.js`, `dist/assets/*.css`, fonts, and PWA icons. (Total payload: ~280 kB gzipped).
    2. **Explicit Exclusions:** Strictly exclude `audio/**`, `videos/**`, `*.mp4`, `*.mp3`, `*.pdf`.
    3. **Runtime Audio Strategy:** For audio, use standard streaming with HTTP range request support, or optional user-initiated "Download for Offline" saving to CacheStorage/IndexedDB with quota protection.

### 7.4 Service Worker Implementation: Plugin vs Custom
- **Option A (`vite-plugin-pwa`):**
  - Relies on Workbox.
  - *Risk:* Vite 8.3.2 is very new. Need to ensure `vite-plugin-pwa` peer dependencies do not conflict with Vite 8 / Rolldown. If installed, Workbox config must specify `globIgnores: ['**/audio/**', '**/videos/**', '**/*.mp4', '**/*.mp3', '**/*.pdf']`.
- **Option B (Custom Service Worker `public/sw.js` + Custom React Hook):**
  - Zero third-party build plugin dependencies; 100% immune to Vite 8 version incompatibilities.
  - Precise programmatic control over precache manifests, cache versioning (`human2-shell-v1`), activation cleanup, and `skipWaiting()` messaging.
  - Custom React hook (`useServiceWorker.ts`) listens to `registration.waiting` and broadcasts the update notification toast.
- **Recommendation:** Either `vite-plugin-pwa` (if dependency resolution is clean) or a robust custom service worker in `public/sw.js` with automated precache asset injection.

### 7.5 Update Notification Flow
- When a new build is deployed, the service worker detects updated asset hashes.
- Worker installs in background and enters `waiting` state.
- Client surfaces a non-intrusive toast: *"New version available · Tap to refresh"*.
- Tapping triggers `registration.waiting.postMessage({ type: 'SKIP_WAITING' })`, followed by `window.location.reload()`.

### 7.6 Install Experience (Android / iOS)
- Android / Chrome: Capture `beforeinstallprompt` event; surface sleek floating or in-menu "Install App" button; trigger `prompt()`.
- iOS Safari: Detect iOS standalone absence (`!navigator.standalone` && iOS userAgent); provide 1-tap sheet: *"Tap Share (box with arrow) → Add to Home Screen"*.
- Standalone suppression: Automatically hidden if `window.matchMedia('(display-mode: standalone)').matches` or `navigator.standalone === true`.

---

## 8. Capacitor & Native Mobile Readiness Baseline

### 8.1 Static Output Verification
- Vite outputs directly to `dist/`.
- No Node.js runtime or server dependencies exist.
- Capacitor configuration (`capacitor.config.ts`) simply targets `webDir: 'dist'`.

### 8.2 Viewport & Safe-Area Inset Handling
- `index.html` already has:
  `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />`
- **Missing iOS Meta Tags in `index.html`:**
  - `<meta name="apple-mobile-web-app-capable" content="yes">`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
  - `<meta name="apple-mobile-web-app-title" content="Human 2.0">`
- **Safe-Area Inset Gaps:**
  - `BottomTabBar.tsx` uses `pb-[max(env(safe-area-inset-bottom),10px)]`.
  - However, screen headers (`HomeScreen.tsx`, `PauseScreen.tsx`, etc.) use fixed padding (`pt-3.5` or `pt-4`), which collides with the iPhone Dynamic Island / notch in standalone mode.
  - Safe-area utility classes or CSS custom properties (e.g., `pt-[max(env(safe-area-inset-top),16px)]`) are required across all top headers.

### 8.3 PhoneFrame.tsx vs Native Wrapper
- `PhoneFrame.tsx` currently wraps the app:
  - If `window.innerWidth < 640px`, it renders edge-to-edge.
  - If `>= 640px`, it renders a simulated phone bezel with a top toolbar!
- **Issue for iPad / Tablets / Standalone:** If a user installs the PWA on an iPad or runs it via Capacitor on an iPad, `PhoneFrame.tsx` will display a fake iPhone bezel inside the tablet screen!
- **Fix:** Update `PhoneFrame.tsx` to detect standalone PWA mode (`window.matchMedia('(display-mode: standalone)').matches`) or native platform, rendering edge-to-edge full width without fake bezels.

### 8.4 360px Mobile Viewport & Touch Targets
- Mobile baseline check:
  - Primary bottom tabs have touch targets: button `w-10 h-10` with generous padding meeting the 44x44px touch target guideline.
  - Buttons throughout screens use `py-3 px-4` or rounded pills with >= 44px height.
  - Horizontal scroll prevention: `overflow-x-hidden` should be universally enforced on the root container.

---

## 9. Identified Conflicts, Build Constraints, and Recommendations

| Area | Current State / Hazard | Risk Level | Recommendation |
|---|---|---|---|
| **Audio Asset Caching** | `public/audio/` contains 48 MP3 files (>600 MB) | **CRITICAL** | Strictly exclude audio & video from service worker precache. Precache app shell only (HTML, JS, CSS, icons). |
| **PWA Manifest & Icons** | Missing manifest; only generic purple favicon exists | **HIGH** | Create `manifest.webmanifest` and generate 192x192, 512x512, maskable 512, and 180x180 gold monogram icons. |
| **iOS Meta & Safe-Areas** | Headers lack `safe-area-inset-top`; missing apple-mobile-web-app meta tags | **HIGH** | Add iOS meta tags to `index.html`; apply `pt-[env(safe-area-inset-top)]` to headers. |
| **Tablet / Standalone Display** | `PhoneFrame.tsx` forces fake phone bezel on screens >= 640px | **MEDIUM** | Bypass phone bezel if running in standalone display mode or native wrapper. |
| **Environment Variables** | No `.env`, no `import.meta.env`, no `vite-env.d.ts` | **MEDIUM** | Add `.env.example`, `src/vite-env.d.ts`, and bind external URLs to `VITE_*`. |
| **Vite 8 & Plugins** | Vite 8.3.2 uses Rolldown bundler | **MEDIUM** | Verify any PWA plugin compatibility with Vite 8 or use clean native Service Worker implementation. |
| **PowerShell npm execution** | `npm.ps1` restricted on user system | **LOW** | Use `cmd.exe /c "npm run ..."` for automated task execution. |
| **Dead Code Cleanup** | `src/App.css` is completely unreferenced | **LOW** | Remove or leave intact as harmless dead code. |

---

## 10. Conclusion

The Human 2.0 codebase is in prime technical health: clean architecture, zero SSR dependencies, rapid 14s static build output, and clean linting. The path to full PWA and Sleep Supporting mobile readiness is straightforward, provided that large media precaching is strictly prohibited and safe-area insets are systematically configured.
