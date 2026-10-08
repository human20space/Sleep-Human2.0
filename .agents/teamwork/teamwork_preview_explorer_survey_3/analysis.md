# Technical Analysis Report: PWA Engine, Manifest, Service Worker & Mobile UI Specifications

**Agent**: `teamwork_preview_explorer` (Survey Explorer 3)  
**Date**: 2026-10-08  
**Working Directory**: `C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_survey_3`  
**Target Project**: `Human 2.0` (`C:\Users\annak\.gemini\antigravity\scratch\human2`)  
**Mission**: Investigate all PWA infrastructure requirements, manifest specifications, brand icon suite, service worker caching strategies, update toast mechanics, custom install experiences, and mobile UI constraints (safe area, 360px viewport).

---

## Executive Summary & Audit Matrix

The Human 2.0 application is built with React 19 (`react: ^19.2.8`), Vite 8 (`vite: ^8.3.0`), TypeScript 6 (`typescript: ~6.0.2`), Tailwind CSS v4 (`@tailwindcss/vite: ^4.3.3`), and Framer Motion (`^14.0.0`). The production build compiles cleanly into a static Single Page Application (`dist/index.html`, `dist/assets/*.css`, `dist/assets/*.js`) with zero SSR dependencies.

However, the codebase currently possesses **zero PWA infrastructure**:
- No `manifest.webmanifest` or `manifest.json`.
- No `sw.js` (Service Worker) registered or configured.
- No brand icon suite (no 192x192, 512x512, maskable 512x512, or 180x180 apple-touch-icon). Existing icons are an unrelated purple SVG template (`public/favicon.svg`) and social links sprite (`public/icons.svg`).
- Missing iOS and Android PWA meta tags in `index.html`.
- Multiple mobile constraint vulnerabilities: safe area padding is omitted in headers and floating controls; touch targets in several key buttons measure under 32px (violating the >=44px constraint); and multiple `<input>` and `<textarea>` elements use `text-xs` (12px), which triggers destructive auto-zooming on iOS Safari.

### Current Status vs Requirements

| PWA & Mobile Dimension | Current State | Required Target State | Gap Severity |
| :--- | :--- | :--- | :--- |
| **Web App Manifest** | Completely missing | `public/manifest.webmanifest` + `public/manifest.json` with standalone mode, portrait orientation, theme `#05070a`, background `#05070a` | **Critical (Blocker)** |
| **Brand Icon Suite** | Missing all PNG icons; placeholder SVG | 192x192, 512x512, maskable 512x512, 180x180 apple-touch-icon with gold 2.0 monogram & stardust halo | **Critical (Blocker)** |
| **PWA Meta Tags** | Basic `viewport` only | `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`, `manifest` link | **High** |
| **Service Worker** | None registered | `public/sw.js` precaching app shell only, offline fallback, skipWaiting message handling | **Critical (Blocker)** |
| **Update Notification** | None | Non-intrusive toast: "New version available · Tap to refresh" with seamless skipWaiting + reload flow | **High** |
| **Custom Install UX** | None | Android/Chrome `beforeinstallprompt` trigger + iOS Safari "Add to Home Screen" instructions sheet, suppressed in standalone | **High** |
| **Safe Area Insets** | Only `BottomTabBar.tsx` has `pb-safe` | Header insets (`env(safe-area-inset-top)`), mini-player spacing, floating controls, modal sheets | **High** |
| **360px Viewport** | Root missing `overflow-x: hidden` | Guaranteed 0 horizontal scroll at 360px width, fluid responsive cards | **Medium** |
| **Touch Targets** | Buttons at 24px–36px (`MiniPlayerBar`, `PauseScreen`, `BottomTabBar`) | All interactive targets >= 44x44px touch bounding box | **High** |
| **Form Inputs** | Inputs at `text-xs` (12px) | All inputs >= 16px to prevent iOS Safari auto-zoom | **High** |

---

## 1. Baseline Audit of Existing Codebase & Assets

### 1.1 Existing Files Inspected
- `index.html`: Contains `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />` and Google Fonts (`Inter`, `Lora`, `Playfair Display`). Missing all PWA, manifest, and iOS web app tags.
- `public/favicon.svg`: A 48x46 SVG featuring purple/blue lightning geometry (`#863bff`). Unrelated to the Human 2.0 gold monogram brand.
- `public/icons.svg`: An SVG symbol sprite sheet containing social media icons (Bluesky, Discord, GitHub, X). No app launcher icons.
- `vite.config.ts`: Configured solely with `@vitejs/plugin-react` and `@tailwindcss/vite`. No PWA plugin or service worker build step.
- `package.json`: Dependencies do not include `vite-plugin-pwa` or Workbox.
- `src/index.css`: Defines CSS color variables for Daylight (`--cream: #f7f3ec; --page-bg: #dcd3c2; --teal: #1f5f78; --gold: #d9a44a;`) and Night Sanctuary (`--cream: #0b1317; --page-bg: #070c0e; --teal: #3ba2c7; --gold: #e8b98a;`). Defines base viewport `height: 100dvh; overscroll-behavior: none;`.
- `src/components/PhoneFrame.tsx`: Provides desktop phone simulator (`w-[390px] h-[844px]`) and mobile edge-to-edge view (`window.innerWidth < 640`). Mobile ambient sound button is positioned statically at `top-2 right-3` without notch safety.
- `src/components/BottomTabBar.tsx`: Line 23 uses `pb-[max(env(safe-area-inset-bottom),10px)]`. This is currently the **only** safe area inset in the entire repository.
- `src/components/MiniPlayerBar.tsx`: Statically positioned at `bottom-[66px]`, which collides with `BottomTabBar` on iPhones with a 34px bottom home indicator. Several controls are sized at 24px–32px.
- Form inputs in `src/components/MirrorScreen.tsx`, `src/components/PauseScreen.tsx`, `src/components/HumanAiScreen.tsx`, `src/components/PracticeScreen.tsx`, and `src/components/JourneyScreen.tsx` use `text-xs` (12px), causing iOS viewport zoom distortion.

---

## 2. Web App Manifest Specification (`manifest.webmanifest`)

### 2.1 File Location & MIME Types
- Primary file: `public/manifest.webmanifest`
- Compatibility symlink / duplicate: `public/manifest.json` (for legacy Android / tooling)
- Declared in `index.html`:
  ```html
  <link rel="manifest" href="/manifest.webmanifest" />
  ```

### 2.2 Complete Manifest Schema & Values
```json
{
  "id": "/",
  "name": "Human 2.0",
  "short_name": "Human 2.0",
  "description": "Sleep Supporting Mobile App & Personal Awareness Platform for the AI Age",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "display_override": ["standalone", "minimal-ui"],
  "orientation": "portrait",
  "theme_color": "#05070a",
  "background_color": "#05070a",
  "lang": "en-US",
  "dir": "ltr",
  "categories": ["health", "lifestyle", "music", "productivity"],
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/apple-touch-icon-180x180.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Night Sleep Reset",
      "short_name": "Sleep",
      "description": "Acute 90-second racing mind silencer & sleep induction",
      "url": "/?action=sos",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Sleep Soundscapes",
      "short_name": "Soundscapes",
      "description": "432Hz solfeggio drone and delta wave binaurals",
      "url": "/?action=soundscapes",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Audiobook",
      "short_name": "Audiobook",
      "description": "45-Chapter Human 2.0 Audiobook",
      "url": "/?action=audiobook",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    }
  ],
  "prefer_related_applications": false
}
```

### 2.3 Rationale for Specific Key Values
- **`theme_color: "#05070a"`**: Matches the Night Sanctuary sleep background, ensuring the Android system status bar and multitasking header blend seamlessly into the dark palette without jarring light borders.
- **`background_color: "#05070a"`**: Sets the splash launch canvas color during initial app load on Android.
- **`orientation: "portrait"`**: Locks mobile sleep experience to portrait orientation, preventing accidental landscape rotation in bed.
- **`display: "standalone"`**: Hides the browser URL bar, navigation buttons, and bottom sheet chrome, delivering a true native app appearance.

### 2.4 Index.html Meta Tag Suite
To support iOS Safari, Android, and Capacitor native wrappers, `index.html` requires the following `<head>` tags:
```html
<!-- Character Set & Viewport -->
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />

<!-- PWA Primary Manifest -->
<link rel="manifest" href="/manifest.webmanifest" />

<!-- Theme Colors (Dark & Light Palette Coordination) -->
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#05070a" />
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f7f3ec" />
<meta name="theme-color" content="#05070a" />

<!-- iOS Safari Mobile Web App Support -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Human 2.0" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180x180.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />

<!-- Android & Windows Mobile App Meta -->
<meta name="mobile-web-app-capable" content="yes" />
<meta name="application-name" content="Human 2.0" />
<meta name="msapplication-TileColor" content="#05070a" />
<meta name="msapplication-tap-highlight" content="no" />

<!-- Favicons -->
<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

---

## 3. Brand Icon Suite & Visual Glyph Specifications

### 3.1 Visual Glyph Composition
The brand mark directly reproduces the Human 2.0 identity seen in `SplashScreen.tsx` (lines 101–107) and `PhoneFrame.tsx` (lines 40–42):
- **Base Canvas**: Deep obsidian midnight black (`#05070a`).
- **Inner Astral Disc / Nebula**: Radial gradient transitioning from `#17495e` (deep sanctuary teal) to `#1f5f78` (luminous oceanic teal).
- **Stardust Halo**: Soft radial luminescence (`rgba(232, 185, 138, 0.35)` to `rgba(31, 95, 120, 0.22)`) with micro-stardust particles (`#e8b98a` gold and `#8fd0ff` astral blue).
- **Core Monogram**: Bold typographic glyph **"2.0"** set in *Playfair Display* serif, rendered in warm champagne gold (`#e8b98a` / `#d9a44a`).
- **Sparkle Accent**: A delicate 4-point celestial stardust cross positioned at the top-right corner of the disc.

### 3.2 Icon Suite Specifications
All icons must be located in `public/icons/`:

| File Name | Resolution | Format | Purpose | Safe Zone & Geometry Constraint |
| :--- | :--- | :--- | :--- | :--- |
| `icon-192x192.png` | 192 × 192 px | PNG-24 (RGBA) | `"any"` | Standard Android launcher icon, splash launcher |
| `icon-512x512.png` | 512 × 512 px | PNG-24 (RGBA) | `"any"` | High-DPI splash screen, Chrome install dialog |
| `icon-maskable-512x512.png` | 512 × 512 px | PNG-24 (RGB) | `"maskable"` | Android adaptive icon. **Canvas fully painted `#05070a`**. The core disc, monogram, and halo are contained strictly within the inner 80% circle (diameter 409.6px, centered at 256, 256) with 51.2px outer margin |
| `apple-touch-icon-180x180.png` | 180 × 180 px | PNG-24 (RGB) | Apple Touch Icon | iOS Home screen. Square canvas, solid `#05070a` background (iOS applies squircle clipping and subtle rim shadow automatically) |
| `favicon.svg` | Scalable Vector | SVG | Browser tab icon | Vector representation of the gold 2.0 monogram inside the teal disc |

### 3.3 Asset Generation Strategy
A Node.js generator script (`scripts/generateIcons.cjs`) should be added to the project. Using pure Node.js Canvas / SVG rendering or Node PNG writing, it renders the exact vector math into crisp, uncompressed PNG files for `192x192`, `512x512`, `maskable-512x512`, and `180x180`.

---

## 4. Service Worker Architecture, Caching Strategy & Instant Update Flow

### 4.1 Architecture Principles
1. **App Shell Precaching Only**: Precache only the essential static assets required to render and operate the UI:
   - `index.html`
   - Compiled JS bundles (`/assets/index-*.js`)
   - Compiled CSS stylesheets (`/assets/index-*.css`)
   - Core app icons and manifest (`/manifest.webmanifest`, `/icons/*`, `/favicon.svg`)
   - Google Fonts webfont files and stylesheets (`fonts.googleapis.com`, `fonts.gstatic.com`)
2. **Strict Zero-Caching of Sensitive Data**:
   - User journals, Mirror clarity sessions, somatic pause reflections, MAMs, and AI dialogue transcripts are stored strictly in client-side storage (`localStorage` / IndexedDB).
   - The Service Worker will NEVER intercept, store, or cache any user reflection, API telemetry, or dynamic request.
3. **Streaming Media Pass-Through**:
   - Audio files (audiobook MP3s, Google Drive streams) and video MP4 files must bypass the precache cache. HTTP Range requests (`Range: bytes=...`) must pass directly through to the network to avoid cache bloat and playback stalls.

### 4.2 Cache Layers & Versioning
- **Cache Name**: `human2-shell-v1`
- **Cache Lifecycle**:
  - `install`: Fetch and populate app shell assets. Call `self.skipWaiting()` only when explicitly signaled via message.
  - `activate`: Iterate through `caches.keys()`, delete all old versions (`key !== CACHE_NAME`), and claim all open clients via `self.clients.claim()`.
  - `fetch`: Route requests by resource type:
    - **Navigation requests (`request.mode === 'navigate'`)**: Network-First with fallback to cached `/index.html`. If the device is offline, `/index.html` is returned immediately.
    - **Hashed static assets (`/assets/*.js`, `/assets/*.css`)**: Cache-First (or Stale-While-Revalidate). Since Vite generates immutable content-hashed file names, cached assets are always valid for that version.
    - **Google Fonts & CDN assets**: Stale-While-Revalidate.
    - **Audio/Video streaming**: Network-only pass-through.

### 4.3 Instant Update Flow Mechanics
To satisfy the requirement: *"Surface a sleek, non-intrusive toast: 'New version available · Tap to refresh' whenever a new code deploy is detected, eliminating stale versions"*:

```
[ Code Deployed to Static Host ]
              │
              ▼
[ Browser Background Check: /sw.js byte comparison ]
              │
              ▼
[ New SW installs in background -> enters WAITING state ]
              │
              ▼
[ Registration fires `updatefound` & worker `statechange` ]
              │
              ▼
[ Client UI (UpdateToast) detects `registration.waiting` ]
              │
              ▼
[ Toast Appears: "New version available · Tap to refresh" ]
              │
              ▼ User Taps "Refresh"
[ Client calls `waitingWorker.postMessage({ type: 'SKIP_WAITING' })` ]
              │
              ▼
[ Waiting SW executes `self.skipWaiting()` -> becomes ACTIVE ]
              │
              ▼
[ Client receives `controllerchange` event -> calls `window.location.reload()` ]
              │
              ▼
[ Instant clean reload with 100% updated assets ]
```

### 4.4 Service Worker Implementation (`public/sw.js`)
```javascript
const CACHE_NAME = 'human2-shell-v1';

const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon-180x180.png',
];

// Install Event — precache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_ASSETS);
    })
  );
});

// Activate Event — purge stale caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message Event — handle SKIP_WAITING from update toast
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Event — routing & offline fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Bypass non-GET requests and media range requests
  if (request.method !== 'GET') return;
  if (request.headers.get('range')) return;
  if (url.pathname.endsWith('.mp4') || url.pathname.endsWith('.mp3')) return;

  // 2. Navigation requests: Network-First with cached index.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // 3. Static assets & Vite chunks: Stale-While-Revalidate / Cache-First
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
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

  // 4. External Fonts (Google Fonts): Stale-While-Revalidate
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});
```

### 4.5 Registration & Client Bridge (`src/pwa/registerServiceWorker.ts`)
```typescript
export interface ServiceWorkerHooks {
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;
  onInstalled?: () => void;
}

export function registerServiceWorker(hooks?: ServiceWorkerHooks) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check if an updated worker is already waiting
        if (registration.waiting) {
          hooks?.onUpdateAvailable?.(registration);
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update ready and waiting
                hooks?.onUpdateAvailable?.(registration);
              } else {
                // Precached for the first time
                hooks?.onInstalled?.();
              }
            }
          });
        });

        // Periodically check for updates (every 60 minutes)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.warn('ServiceWorker registration failed:', error);
      });

    // Reload page when new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

export function applyServiceWorkerUpdate(registration: ServiceWorkerRegistration) {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}
```

---

## 5. Custom Install Experience (Android/Chrome & iOS Safari)

### 5.1 Standalone Mode Detection
Any install banner, prompt, or sheet **must be completely suppressed** when the app is already installed and launched in standalone mode:
```typescript
export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}
```
In addition, listen for runtime display-mode changes:
```typescript
window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
  if (e.matches) setInstalled(true);
});
```

### 5.2 Android & Chromium (`beforeinstallprompt`) Flow
1. Listen for `window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setDeferredPrompt(e); })`.
2. Do not show obnoxious popup immediately; show a sleek pill button in the top header or in Profile ("Install App").
3. When tapped:
   ```typescript
   await deferredPrompt.prompt();
   const { outcome } = await deferredPrompt.userChoice;
   if (outcome === 'accepted') {
     setDeferredPrompt(null);
     setShowBanner(false);
   }
   ```
4. Listen for `window.addEventListener('appinstalled', () => { setInstalled(true); })`.

### 5.3 iOS Safari Custom Instruction Sheet
iOS Safari does not support `beforeinstallprompt`. A custom, tactile instruction sheet is required:
1. **Device Detection**:
   ```typescript
   const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
   const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
   const canShowIOSGuide = isIOS && isSafari && !isRunningStandalone();
   ```
2. **Sheet Architecture**:
   - An elegant bottom sheet featuring the gold 2.0 brand monogram.
   - Step 1: Tap the **Share** button (`<Share2 size={16} />`) in the bottom Safari navigation bar.
   - Step 2: Scroll down and select **"Add to Home Screen"** (`<PlusSquare size={16} />`).
   - Step 3: Tap **"Add"** in the top right corner.
   - Includes a "Dismiss" action that persists `localStorage.setItem('human2_hide_install_sheet', 'true')` to respect user agency.

---

## 6. Mobile Responsiveness, Safe Area Insets & Layout Constraints

### 6.1 Viewport Configuration
`index.html` currently has:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```
To lock mobile zoom stability, update to:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />
```

### 6.2 Safe Area Inset Audit (`env(safe-area-inset-*)`)

```
┌──────────────────────────────────────────────────┐
│  ▲ env(safe-area-inset-top) [44px-59px on iOS]   │
│  ▼ Dynamic Island / Notch / Status Bar           │
├──────────────────────────────────────────────────┤
│                                                  │
│               App Viewport Content               │
│                                                  │
├──────────────────────────────────────────────────┤
│  ▲ MiniPlayerBar: must clear BottomTabBar        │
│  │ BottomTabBar: px-3 pt-2                       │
│  ▼ pb-[max(env(safe-area-inset-bottom),12px)]    │
└──────────────────────────────────────────────────┘
```

#### Deficiencies Identified:
1. **`PhoneFrame.tsx` Mobile Mode (Line 120)**:
   - Mobile ambient sound button is positioned at `top-2 right-3`. On an iPhone with Dynamic Island or notch, this button is overlapped by the hardware cutout.
   - **Fix**: Position at `top-[max(env(safe-area-inset-top),8px)] right-3`.
2. **Top Headers (`HomeScreen`, `PauseScreen`, `MirrorScreen`, `VaultScreen`, `AudioChaptersScreen`)**:
   - Headers use static padding (e.g. `pt-3.5` or `p-4`).
   - **Fix**: Apply `pt-[max(env(safe-area-inset-top),14px)]` to all top screen headers.
3. **`MiniPlayerBar.tsx` (Line 40)**:
   - Statically anchored at `bottom-[66px]`.
   - On iPhones with a 34px bottom safe area, `BottomTabBar` expands to ~78px height, causing `MiniPlayerBar` to overlap the navigation tabs.
   - **Fix**: Anchor at `bottom-[calc(max(env(safe-area-inset-bottom),12px)+56px)]`.
4. **CSS Root Variable Declarations (`src/index.css`)**:
   - Establish globally available fallback CSS variables:
     ```css
     :root {
       --sat: env(safe-area-inset-top, 0px);
       --sab: env(safe-area-inset-bottom, 0px);
       --sal: env(safe-area-inset-left, 0px);
       --sar: env(safe-area-inset-right, 0px);
     }
     ```

### 6.3 Rigorous 360px Minimum Width Constraint
- **Horizontal Overflow Prevention**:
  - In `src/index.css`: Add `overflow-x: hidden;` to `html`, `body`, and `#root`.
  - All screen containers must enforce `w-full max-w-full overflow-x-hidden`.
  - Flex child items and typography titles must carry `min-w-0` and `truncate` or `break-words` to prevent wide text strings from triggering horizontal scroll.
- **Card and Button Widths**:
  - Ensure all cards use percentage or fractional widths (e.g., `w-full`, `max-w-xs`, `max-w-sm`) instead of fixed pixel widths greater than 320px.

### 6.4 Touch Target Size Compliance (>= 44x44px)
WCAG 2.5.5 AAA / 2.5.8 AA and Apple HIG mandate interactive touch targets of at least 44 × 44 CSS pixels.

#### Non-Compliant Elements to Remediate:
1. **`MiniPlayerBar.tsx`**:
   - Skip button (line 96): `w-7 h-7` (28px) -> Upgrade to `w-10 h-10` with centered icon or `p-2.5` touch padding (`min-w-[44px] min-h-[44px]`).
   - Play button (line 106): `w-8 h-8` (32px) -> Upgrade to `w-11 h-11` (44px).
   - Maximize button (line 119): `w-7 h-7` (28px) -> Upgrade to `w-10 h-10` touch area.
   - Close button (line 128): `w-6 h-6` (24px) -> Upgrade to `w-9 h-9` with `min-w-[44px] min-h-[44px]` touch zone.
2. **`PauseScreen.tsx`**:
   - Back button (line 101): `w-8 h-8` (32px) -> Upgrade to `w-11 h-11` (44px).
3. **`BottomTabBar.tsx`**:
   - Tab buttons: Add `min-h-[44px] min-w-[48px]` to ensure comfortable thumb tapping without accidental mis-hits.

### 6.5 Form Inputs Auto-Zoom Prevention (>= 16px Font Size)
On iOS Safari, focusing an `<input>` or `<textarea>` with a font size smaller than 16px causes an automatic viewport zoom that shifts screen alignment and breaks SPA navigation.

#### Current Violations:
- `MirrorScreen.tsx` (line 311): `<input className="... text-xs ...">` (12px).
- `PauseScreen.tsx` (line 236): `<textarea className="... text-xs ...">` (12px).
- `HumanAiScreen.tsx` (line 127): `<input className="... text-xs ...">` (12px).
- `PracticeScreen.tsx` (line 247): `<textarea className="... text-xs ...">` (12px).
- `JourneyScreen.tsx` (line 242): `<textarea className="... text-xs ...">` (12px).

#### Global Remediation in `src/index.css`:
```css
/* Prevent iOS auto-zoom on input focus */
@layer base {
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="search"],
  input[type="number"],
  input[type="tel"],
  input[type="url"],
  textarea,
  select {
    font-size: 16px !important;
  }
}
```
All input elements will have a minimum computed font size of 16px, preventing viewport zoom on iOS devices.

---

## 7. Concrete File Implementation Architecture

### 7.1 New & Modified Files Inventory

```
C:\Users\annak\.gemini\antigravity\scratch\human2\
├── public/
│   ├── manifest.webmanifest          [NEW: W3C Validated PWA Manifest]
│   ├── manifest.json                 [NEW: Duplicate for compatibility]
│   ├── sw.js                         [NEW: Pure Service Worker Engine]
│   ├── favicon.svg                   [MODIFIED: Gold 2.0 Brand Glyph SVG]
│   └── icons/
│       ├── icon-192x192.png          [NEW: 192px PNG]
│       ├── icon-512x512.png          [NEW: 512px PNG]
│       ├── icon-maskable-512x512.png [NEW: 512px Maskable PNG]
│       └── apple-touch-icon-180x180.png [NEW: 180px Apple Touch Icon PNG]
├── scripts/
│   └── generateIcons.cjs             [NEW: Node Icon Generator Script]
├── src/
│   ├── pwa/
│   │   ├── registerServiceWorker.ts  [NEW: Registration, lifecycle & skipWaiting bridge]
│   │   └── usePwaInstall.ts          [NEW: Hook for standalone detection & install prompt]
│   ├── components/
│   │   ├── UpdateToast.tsx           [NEW: Sleek update prompt toast]
│   │   ├── InstallPromptModal.tsx    [NEW: Android & iOS Safari install sheet]
│   │   ├── BottomTabBar.tsx          [MODIFIED: Touch targets & safe area bottom]
│   │   ├── MiniPlayerBar.tsx         [MODIFIED: Touch targets >=44px & dynamic offset]
│   │   ├── PhoneFrame.tsx            [MODIFIED: Safe area top on mobile header]
│   │   └── HomeScreen.tsx            [MODIFIED: Safe area top & install action trigger]
│   ├── index.css                     [MODIFIED: overflow-x:hidden, 16px inputs, safe-area variables]
│   └── main.tsx                      [MODIFIED: Initialize registerServiceWorker]
└── index.html                        [MODIFIED: Comprehensive PWA & iOS meta tag suite]
```

### 7.2 Component Specification: `UpdateToast.tsx`
A fixed floating toast positioned at `top-4` or `bottom-20` with Framer Motion slide-in:
```tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles } from 'lucide-react';

interface UpdateToastProps {
  show: boolean;
  onRefresh: () => void;
}

export const UpdateToast: React.FC<UpdateToastProps> = ({ show, onRefresh }) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        className="fixed top-[max(env(safe-area-inset-top),16px)] left-4 right-4 z-50 flex justify-center pointer-events-none"
      >
        <div className="bg-[#101b22]/95 text-[#f2ede4] backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#d9a44a]/40 shadow-xl flex items-center justify-between gap-3 pointer-events-auto max-w-sm w-full">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={16} className="text-[#e8b98a] shrink-0 animate-pulse" />
            <span className="text-xs font-medium text-[#f2ede4] truncate">
              New version available
            </span>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#17495e] hover:bg-[#1f5f78] text-[#e8b98a] text-xs font-semibold shrink-0 cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw size={12} className="animate-spin-slow" />
            <span>Tap to refresh</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
```

---

## 8. Acceptance & Verification Matrix

| Acceptance Check | Verification Command / Step | Expected Pass Condition |
| :--- | :--- | :--- |
| **Clean Static Build** | `cmd /c "npm run build"` | Exit code 0, single `dist/` directory, valid bundles |
| **Manifest Validation** | Chrome DevTools > Application > Manifest | `name: "Human 2.0"`, `short_name: "Human 2.0"`, `display: "standalone"`, 0 warnings, icons loaded |
| **Icon Resolutions** | File inspection of `public/icons/` | `192x192`, `512x512`, `maskable-512x512`, `180x180` PNG files present with valid image headers |
| **Service Worker Registration** | Chrome DevTools > Application > Service Workers | `sw.js` registered and active for scope `/`, precaching app shell |
| **Offline Fallback** | Toggle DevTools Network to "Offline" and reload | App loads from cache; offline state handled gracefully |
| **Update Notification** | Bump SW cache name & deploy / simulate waiting SW | "New version available · Tap to refresh" toast appears; click updates & reloads |
| **Standalone Suppression** | Emulate `display-mode: standalone` in DevTools | Install button and iOS sheet are hidden |
| **360px Mobile Check** | Set viewport to 360 × 640 in DevTools Device Mode | Horizontal scrollbar is 0 (`document.body.scrollWidth === 360`) |
| **Touch Target Size** | Inspect button dimensions in DevTools | All interactive touch areas >= 44 × 44 px |
| **Form Input Zoom** | Inspect input computed styles | All form inputs have `computed font-size >= 16px` |

---
*Report compiled by Survey Explorer 3. Handoff report available at `handoff.md`.*
