# Project: Human 2.0 PWA & Sleep Supporting Mobile App

## Architecture
- **Framework & Runtime**: Pure client-side Single Page Application (SPA) built with React 19 (`react: ^19.2.8`), TypeScript (~6.0.2), Vite 8 (`vite: ^8.3.2` with Rolldown), Tailwind CSS v4 (`@tailwindcss/vite: ^4.3.3`), and Framer Motion (`^14.0.0`).
- **Build Output**: Clean static files compiled to `dist/` via `tsc -b && vite build`. Zero server-side rendering or backend runtime dependencies. Fully compatible with native wrappers (Capacitor / Cordova).
- **Navigation & Screen Routing**: State-driven routing via `currentScreen` in `src/App.tsx` wrapped in `<AnimatePresence mode="wait">`. Top-level bottom navigation trimmed to 5 high-contrast tabs:
  1. `sleep` (Sleep Sanctuary Home)
  2. `listen` (Dedicated 45-chapter Audiobook Section)
  3. `pause` / `reset` (Center Hero: 90s Acute SOS Racing Mind Silencer)
  4. `ebb` (Somatic AI Wind-Down Companion)
  5. `vault` (Favourites, Continue Listening, MAMs & Sovereign Status)
- **Audio Architecture**: Unified polymorphic audio layer in `AudioContext.tsx`:
  - HTML5 audio playback for 45 audiobook chapters (`public/audio/*.mp3`).
  - Offline procedural Web Audio API synthesizers in `src/utils/audioEngine.ts` for Solfeggio tones (432Hz, 528Hz), Delta wave binaurals (2Hz beat on 200Hz carrier), pink noise ocean rain, and SOS breathing pacers.
  - Global `MiniPlayerBar.tsx` integration with sleep timer auto-fadeout.
- **PWA Engine & Service Worker**:
  - `manifest.webmanifest` & `manifest.json` conforming to W3C PWA specifications (`display: standalone`, `orientation: portrait`, theme `#05070a` / `#f7f3ec`).
  - Brand icon suite in `public/icons/` (192x192, 512x512, maskable 512x512, apple-touch-icon 180x180) featuring the gold 2.0 monogram (`#e8b98a`) with stardust halo.
  - Vanilla Service Worker (`public/sw.js`) precaching the core app shell only (HTML, CSS, JS, critical fonts, icons), explicitly excluding large media (`public/audio/**`, `public/videos/**`).
  - Instant update toast ("New version available · Tap to refresh") upon code push via `SKIP_WAITING`.
  - Custom install prompt for Android/Chrome and custom instructions sheet for iOS Safari, automatically suppressed in standalone mode.
- **Mobile & Safe Areas**:
  - `viewport-fit=cover`, safe-area insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`) clearing notch and home indicator.
  - 360px viewport minimum width with zero horizontal scrolling.
  - Touch targets minimum 44x44px.
  - Form input and textarea font size minimum 16px to prevent iOS Safari auto-zoom.

---

## Feature Inventory
Every feature identified from `ORIGINAL_REQUEST.md` and the Survey phase is mapped to a milestone below.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Web App Manifest | Validated `manifest.webmanifest` and `manifest.json` (name, short_name, standalone, portrait, colors #05070a / #f7f3ec) | M1 | Survey / R1 |
| F2 | Brand Icons Suite | Generated 192x192, 512x512, maskable 512x512, and 180x180 apple-touch-icon with gold 2.0 brand monogram | M1 | Survey / R1 |
| F3 | iOS Standalone Meta Tags | Meta tags in `index.html` (apple-mobile-web-app-capable, status-bar-style, apple-touch-icon, theme-color) | M1 | Survey / R1 |
| F4 | Service Worker App Shell Precache | Vanilla SW precaching HTML, CSS, JS, critical fonts; explicitly excluding audio and video; offline navigation fallback | M1 | Survey / R1 |
| F5 | Instant Update Flow | SW update detection surfacing non-intrusive toast "New version available · Tap to refresh" with immediate reload | M1 | Survey / R1 |
| F6 | Custom Install Experience | Custom Android beforeinstallprompt handling and iOS Safari "Tap Share -> Add to Home Screen" sheet, hidden in standalone | M1 | Survey / R1 |
| F7 | Curated Sleep Catalog | 16 sleep recordings (sleepcasts, solfeggio drone soundscapes, emergency SOS reset) with metadata and duration | M2 | Survey / R2 |
| F8 | Frictionless Free Tier | 4 free sleep recordings playable immediately with zero login or sign-up walls | M2 | Survey / R2 |
| F9 | Single Sovereign Paid Plan | Unified membership unlock flow simulating purchase, setting `human2_is_premium`, unlocking all locked content with 528Hz chime | M2 | Survey / R2 |
| F10 | Sleep Sanctuary Home Screen | Redesigned default screen focused entirely on nighttime unwinding, bedtime immersion, quick sleep timers, and curated shelves | M2 | Survey / R2 |
| F11 | Standalone Audiobook "Listen" Section | Relocate 45-chapter Human 2.0 Audiobook into dedicated "Listen" tab; Ch 1-3 Free, Ch 4-45 Sovereign | M2 | Survey / R2 |
| F12 | Procedural Web Audio Engine | Offline synthesis for 528Hz Solfeggio, 2Hz Delta wave binaural beats, pink noise ocean rain, and SOS breathing pacing in `audioEngine.ts` | M2 | Survey / R2 |
| F13 | Unified Audio Context | Polymorphic audio player playing both MP3 files and Web Audio synthesizers, driving `MiniPlayerBar` and sleep timers | M2 | Survey / R2 |
| F14 | Favourites & Continue Listening | Persistent local storage keys (`human2_favorites`, `human2_continue_listening`) saving/restoring progress in User Vault | M2 | Survey / R2 |
| F15 | 360px Viewport Zero-Scroll | Rigorous layout verification ensuring zero horizontal scroll at 360px width (`overflow-x: hidden`) | M3 | Survey / R3 |
| F16 | Touch Targets >= 44px | Touch target padding and hit boxes expanded to >= 44x44px across all controls, buttons, icons, and tabs | M3 | Survey / R3 |
| F17 | Form Inputs >= 16px Font | Enforce minimum 16px font size on inputs and textareas to eliminate iOS Safari viewport auto-zoom | M3 | Survey / R3 |
| F18 | Notch & Home Indicator Safe Areas | Top and bottom safe-area insets applied to `PhoneFrame`, `MiniPlayerBar`, `BottomTabBar`, and headers | M3 | Survey / R3 |
| F19 | Tablet / Standalone Frame Behavior | `PhoneFrame.tsx` detection of standalone mode and tablets to expand edge-to-edge without artificial bezel | M3 | Survey / R3 |
| F20 | Environment Driven URLs | External endpoints bound via `import.meta.env.VITE_*` with `.env.example` and typing in `src/vite-env.d.ts` | M3 | Survey / R3 |
| F21 | Clean Static Build Output | Verified `tsc -b && vite build` clean exit 0 outputting single `dist/` folder ready for Capacitor native wrapper | M3 | Survey / R3 |
| F22 | E2E Testing Suite (Tiers 1-4) | Comprehensive test suite covering PWA, Sleep App features, mobile responsiveness, and build validation | M4 | E2E Track |
| F23 | Adversarial Coverage Hardening (Tier 5) | White-box stress testing and edge-case hardening verified by Challengers and Auditors | M4 | Final Phase |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | PWA Engine, Manifest, Icons & Instant Update | F1, F2, F3, F4, F5, F6 | None | DONE |
| M2 | Sleep Supporting Mobile App Transformation | F7, F8, F9, F10, F11, F12, F13, F14 | M1 (contracts defined) | PLANNED |
| M3 | Mobile UI Hardening & Native Wrapper Readiness | F15, F16, F17, F18, F19, F20, F21 | M2 | PLANNED |
| M4 | Final Milestone (100% E2E Pass + Tier 5 Hardening) | F22, F23 (All Acceptance Criteria) | M3, TEST_READY.md | PLANNED |

---

## Interface Contracts

### 1. PWA Engine & Service Worker (`M1`)
- **Manifest Paths**: `public/manifest.webmanifest`, `public/manifest.json`.
- **Icon Paths**: `public/icons/icon-192x192.png`, `public/icons/icon-512x512.png`, `public/icons/icon-maskable-512x512.png`, `public/icons/apple-touch-icon-180x180.png`.
- **Service Worker**: `public/sw.js` listens for `message` event with `{ type: 'SKIP_WAITING' }`.
- **Client Bridge**: `src/pwa/registerServiceWorker.ts` exposes `registerServiceWorker(onUpdate: (registration: ServiceWorkerRegistration) => void)`.
- **Update Toast**: `src/components/UpdateToast.tsx` renders a bottom toast with "New version available · Tap to refresh" calling `registration.waiting.postMessage({ type: 'SKIP_WAITING' })` and reloading the page upon controllerchange.
- **Install Hook**: `src/pwa/usePwaInstall.ts` returns `{ isInstallable: boolean, isInstalled: boolean, isIOS: boolean, promptInstall: () => Promise<void> }`.

### 2. Sleep Catalog & Audio Engine (`M2`)
- **Types** (`src/types/index.ts`):
  ```ts
  export interface SleepTrack {
    id: string;
    title: string;
    subtitle: string;
    category: 'sleepcast' | 'solfeggio' | 'soundscape' | 'sos' | 'body_scan';
    durationSeconds: number;
    isPremium: boolean;
    audioEngineType?: 'solfeggio_432' | 'solfeggio_528' | 'delta_binaural' | 'ocean_rain' | 'sos_reset';
    audioUrl?: string;
    tags: string[];
    description: string;
  }

  export interface ContinueListeningItem {
    id: string;
    type: 'sleep_track' | 'audiobook';
    title: string;
    subtitle: string;
    positionSeconds: number;
    durationSeconds: number;
    updatedAt: number;
  }
  ```
- **Unified Audio Context** (`src/context/AudioContext.tsx`):
  ```ts
  interface AudioContextType {
    currentTrack: PlayableTrack | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    playTrack: (track: PlayableTrack) => void;
    pauseTrack: () => void;
    resumeTrack: () => void;
    seekTrack: (seconds: number) => void;
    sleepTimerMinutes: number | null;
    setSleepTimer: (minutes: number | null) => void;
    isFavorite: (trackId: string) => boolean;
    toggleFavorite: (trackId: string) => void;
  }
  ```
- **Local Storage Vault Keys**:
  - `human2_is_premium`: `'true'` | `'false'`
  - `human2_favorites`: `string[]` (JSON array of track IDs)
  - `human2_continue_listening`: `ContinueListeningItem[]` (JSON array)

### 3. Mobile UI & CSS Hardening (`M3`)
- **Global CSS** (`src/index.css`):
  - `overflow-x: hidden` on root and body.
  - Safe-area fallback custom properties:
    `--sat: env(safe-area-inset-top, 0px);`
    `--sab: env(safe-area-inset-bottom, 0px);`
  - Input auto-zoom guard:
    `input, select, textarea { font-size: 16px !important; }`
- **Component Touch Targets**:
  - All clickable buttons and interactive items must satisfy `min-w-[44px] min-h-[44px]` or have transparent hit slop padding.

---

## Code Layout
```
human2/
├── public/
│   ├── manifest.webmanifest      # W3C Web App Manifest (M1)
│   ├── manifest.json             # Manifest alias for legacy Android (M1)
│   ├── sw.js                     # Core app shell Service Worker (M1)
│   ├── icons/                    # PWA Brand icons suite (M1)
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   ├── icon-maskable-512x512.png
│   │   └── apple-touch-icon-180x180.png
│   ├── audio/                    # 45 Chapter MP3 files (Untouched)
│   └── videos/                   # Video assets (Untouched)
├── src/
│   ├── pwa/                      # PWA registration & install logic (M1)
│   │   ├── registerServiceWorker.ts
│   │   └── usePwaInstall.ts
│   ├── components/
│   │   ├── UpdateToast.tsx       # Instant update notification toast (M1)
│   │   ├── InstallPromptModal.tsx# Custom Android/iOS install modal (M1)
│   │   ├── BottomTabBar.tsx      # 5-tab navigation (M2, M3)
│   │   ├── HomeScreen.tsx        # Sleep Sanctuary Home (M2)
│   │   ├── AudioChaptersScreen.tsx# Dedicated "Listen" Audiobook section (M2)
│   │   ├── VaultScreen.tsx       # Favourites, Continue Listening, Vault (M2)
│   │   ├── MiniPlayerBar.tsx     # Unified audio transport bar (M2, M3)
│   │   ├── PhoneFrame.tsx        # Safe areas & standalone detection (M3)
│   │   └── SubscriptionScreen.tsx# Sovereign simulation unlock (M2)
│   ├── context/
│   │   └── AudioContext.tsx      # Polymorphic MP3 + Web Audio player (M2)
│   ├── data/
│   │   ├── sleepCatalogData.ts   # 16 Curated sleep recordings (M2)
│   │   └── audioChaptersData.ts  # 45 Audiobook chapters
│   ├── utils/
│   │   └── audioEngine.ts        # Procedural Solfeggio, Delta binaurals, Rain, SOS (M2)
│   ├── types/
│   │   └── index.ts              # SleepTrack, PlayableTrack, ContinueListening (M2)
│   └── index.css                 # 360px zero-scroll, 16px inputs, safe areas (M3)
├── .env.example                  # Environment variable reference (M3)
└── index.html                    # PWA meta tags, apple-mobile-web-app-capable (M1)
```
