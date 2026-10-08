# Original User Request

## Initial Request — 2026-10-08T01:36:56Z

Use a full team of agents to convert the Human 2.0 application into an installable, high-performance Progressive Web App (PWA) streamlined into a pure "Sleep Supporting Mobile App" for iOS and Android, ensuring instant over-the-air updates upon code push, offline capability, and native wrapper (Capacitor) readiness.

Working directory: `C:\Users\annak\.gemini\antigravity\scratch\human2`
Integrity mode: development
Git branch: `feature/pwa`

---

## 1. Technical Context & Repository Baseline

- Framework & Build Tool: React 19 (react: ^19.2.8), TypeScript (~6.0.2), Vite 8 (vite: ^8.3.0), Tailwind CSS v4 (@tailwindcss/vite: ^4.3.3), Framer Motion (^14.0.0).
- Architecture: Pure client-side Single Page Application (SPA). The build command `tsc -b && vite build` outputs clean static assets into a single `dist/` directory with zero server-side rendering (SSR) dependencies. 100% compatible with Capacitor / Cordova for native iOS and Android packaging.
- Routing Approach: State-driven screen routing via `currentScreen` in `src/App.tsx` with `<AnimatePresence>` screen transitions.
- Authentication & User Data: Lightweight on-device encrypted local storage (`localStorage`). Free tracks require zero registration or login barriers. Membership state (`human2_is_premium`) is managed client-side.
- Current PWA Status: Git branch `feature/pwa` checked out. No manifest.webmanifest exists yet. No service worker registered. Icons need to be generated for PWA resolutions.

---

## 2. Requirements

### R1. PWA Engine, Service Worker & Instant Update Flow
- Web App Manifest: Provide a fully validated `manifest.webmanifest` / `manifest.json` with `name: "Human 2.0"`, `short_name: "Human 2.0"`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `orientation: "portrait"`, and theme/background colors matching the dark/light palette (`#05070a` / `#f7f3ec`).
- Brand Icons Suite: Generate 192x192, 512x512, maskable 512x512, and 180x180 `apple-touch-icon.png` reflecting the Human 2.0 brand glyph (gold 2.0 monogram with subtle stardust halo).
- iOS Standalone Optimization: Configure `<meta name="apple-mobile-web-app-capable" content="yes">`, status bar appearance, `viewport-fit=cover`, and safe-area padding (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`) ensuring content clears the notch and home indicator.
- Service Worker & Offline Fallback: Precache the app shell only (HTML, CSS, JS, critical fonts). Never cache sensitive user data or dynamic API responses. Provide an offline fallback state.
- Instant Update Notification: Surface a sleek, non-intrusive toast: "New version available · Tap to refresh" whenever a new code deploy is detected, eliminating stale versions.
- Custom Install Experience: Implement custom "Install App" prompt on Android/Chrome and a 1-tap instruction sheet on iOS Safari ("Tap Share → Add to Home Screen"), automatically suppressed when running in standalone mode.

### R2. Streamline into "Sleep Supporting Mobile App"
- Simplified Core Experience: Reduce cognitive friction. Position the primary focus on sleep induction, restorative soundscapes, and nighttime unwinding.
- Curated Sleep Catalog (12–20 Recordings):
  - Sleepcast stories & nighttime guided journeys (Dr. Matthew Walker sleep architecture, Yoga Nidra, body scans).
  - Ambient solfeggio drone soundscapes (432Hz, 528Hz, delta wave sleep binaurals, ocean rain).
  - Emergency SOS night reset (acute 90-second racing mind silencer).
- Frictionless Free Tier: 3–5 high-quality sleep recordings playable immediately with zero login or sign-up walls.
- Single Sovereign Paid Tier: A unified membership unlock flow for all premium tracks, masterclasses, and unlimited Vinay Kapoor AI meditation dialogue.
- Dedicated Audiobook Section: Relocate the 45-chapter Human 2.0 Audiobook into a standalone "Listen" tab/section.
- Favourites & Continue Listening: Persistent bookmarks and progress tracking saved locally in the user vault.

### R3. Mobile Responsiveness & Native Wrapper Readiness
- Rigorous 360px Mobile Check: Guarantee 0 horizontal scroll, minimum 44x44px touch targets, and form inputs sized at 16px to prevent iOS auto-zoom.
- Clean Static Output: Production build outputs purely to `dist/`, zero runtime server requirement.
- Environment Driven URLs: All external endpoints driven via `import.meta.env.VITE_*`.

---

## 3. Acceptance Criteria

### PWA Verification
- [ ] Chrome DevTools > Application tab validates the manifest as installable with 0 errors or warnings.
- [ ] Service worker registers, activates, and precaches app shell assets over HTTPS.
- [ ] Launching in standalone mode displays full screen with safe-area spacing on iOS and Android.
- [ ] New deployment triggers the "New version available" refresh prompt.
- [ ] Install buttons/banners appear appropriately and hide when installed.

### Sleep App Feature Completeness
- [ ] Core screen defaults to calming, distraction-free Sleep Supporting view.
- [ ] Free sleep tracks play instantly without registration or login modal.
- [ ] Single Sovereign paid plan simulation unlocks all locked tracks and updates state.
- [ ] Audiobook is housed cleanly in a separate "Listen" section.
- [ ] Favourites and Continue Listening accurately store and restore progress.

### Quality, Build & Native Wrapper
- [ ] `npm run build` succeeds cleanly with exit code 0 and single `dist/` directory output.
- [ ] No horizontal scrolling at 360px viewport width; touch targets >= 44px; input text >= 16px font size.
