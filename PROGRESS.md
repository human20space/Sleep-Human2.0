# Human 2.0 — Engineering Progress & PWA / Sleep App Transformation

## 1. Executive Summary

Human 2.0 has been successfully transformed into an installable, high-performance Progressive Web App (PWA) with a streamlined **Sleep Supporting Mobile App** focus, built for instant Over-The-Air (OTA) updates on both iOS and Android.

- **Git Branch:** `feature/pwa`
- **Build Status:** Clean static build (`tsc -b && vite build` exits with code 0).
- **Test Status:** 193/193 contract, boundary, pairwise, and scenario tests passing.
- **Runtime Environment:** Pure client-side static bundle in `dist/` with 0 SSR dependencies (100% Capacitor / Native Wrapper ready).

---

## 2. Architecture & Inspection Report

| Component | Specification |
|---|---|
| **Framework & Build** | React 19 (`react: ^19.2.8`), TypeScript 5.8+, Vite 8 (`vite: ^8.3.2`), Tailwind CSS v4 |
| **Routing Architecture** | State-driven screen routing with Framer Motion transitions (`currentScreen` in `src/App.tsx`) |
| **Rendering Model** | 100% Client-Side Single Page Application (SPA). Zero Server-Side Rendering (SSR). |
| **Storage & Data** | Private on-device zero-knowledge storage via `localStorage` vault (`human2_is_premium`, `human2_favorites`, `human2_continue_listening`, `human2_mams`, `human2_insights`) |
| **PWA Engine** | Standalone W3C Web Manifest + Service Worker precache + Instant OTA update flow |

---

## 3. PWA Engine & Mobile Core

1. **Web App Manifest (`public/manifest.webmanifest` & `public/manifest.json`):**
   - Configured with `name: "Human 2.0"`, `short_name: "Human 2.0"`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `orientation: "portrait"`.
   - Theme and background colors: `#05070a` (Night Sanctuary) and `#f7f3ec` (Daylight).

2. **Brand Icon Suite (`public/icons/`):**
   - High-fidelity PNG icons generated from the gold monogram branding:
     - `icon-192x192.png` (Standard homescreen icon)
     - `icon-512x512.png` (High-DPI splash icon)
     - `icon-512x512-maskable.png` (Android adaptive maskable icon)
     - `apple-touch-icon-180x180.png` (iOS Safari homescreen touch icon)

3. **iOS Standalone & Notch Inset Support:**
   - `<meta name="apple-mobile-web-app-capable" content="yes">`
   - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
   - `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">`
   - Safe-area CSS custom properties: `--sat: env(safe-area-inset-top, 0px); --sab: env(safe-area-inset-bottom, 0px);`.

4. **Service Worker (`public/sw.js`):**
   - Precaches the application shell (HTML, CSS, JS, critical fonts).
   - Dynamic caching with Stale-While-Revalidate for app assets.
   - Strictly bypasses Range requests and `/audio/` endpoints to avoid HTTP 206 cache exceptions.
   - Never caches user credentials or private data.
   - Offline fallback returns cached app shell.
   - Listens for `SKIP_WAITING` to activate new deployments instantly.

5. **Instant OTA Update Flow (`src/pwa/registerServiceWorker.ts` & `src/components/UpdateToast.tsx`):**
   - Detects worker lifecycle update events (`waiting` worker).
   - Surfaces non-intrusive floating toast: *"New version available · Tap to refresh"*.
   - Tap sends `SKIP_WAITING` and reloads the window, delivering immediate code pushes to all mobile users.

6. **Custom Install Experience (`src/pwa/usePwaInstall.ts` & `src/components/InstallPromptModal.tsx`):**
   - Android / Chrome: Captures `beforeinstallprompt` event and presents customized install modal.
   - iOS Safari: Detects iOS standalone absence and displays guided step-by-step instructions (*"Tap Share, then Add to Home Screen"*).
   - Automatically hides when launched in standalone PWA mode.

---

## 4. Sleep Supporting App Transformation

1. **Simplified Core View (`src/components/HomeScreen.tsx`):**
   - Distraction-free Sleep Sanctuary interface replacing cluttered navigation.
   - **Tonight's Bedtime Immersion:** Featured sleepcast playable with 1 tap.
   - **90-Second SOS Acute Silencer:** Instant somatic reset to halt nocturnal racing mind spirals.
   - **Bedtime Sleep Timer:** 15m, 30m, 45m, 60m presets with automated gentle audio fadeout.
   - **Solfeggio & Delta Drone Shelf:** 432Hz natural frequency, 528Hz repair tone, and 2Hz Delta wave binaural beats synthesized offline.

2. **Curated Sleep Catalog (`src/data/sleepCatalogData.ts`):**
   - Exactly 16 curated sleep tracks:
     - **4 Free Tracks** (playable instantly with zero login or signup walls):
       1. *The Whispering Pines* (Sleepcast journey, 20m)
       2. *432Hz Deep Theta Drift* (Solfeggio harmonic tuning, 30m)
       3. *Midnight Ocean Rain* (Pink noise acoustic wash, 30m)
       4. *90-Second Racing Mind Silencer* (Acute emergency reset, 90s)
     - **12 Sovereign Premium Tracks** (unlocked via Sovereign Membership):
       5. *528Hz Miracle Cell Repair* (DNA restoration frequency, 40m)
       6. *Delta Wave Deep Sleep Induction* (2Hz binaural beat, 45m)
       7. *Yoga Nidra: The Conscious Dream* (Non-Sleep Deep Rest, 35m)
       8. *Dr. Walker's 4-Phase Sleep Cycle* (Clinical sleep architecture, 50m)
       9. *Stardust Over The Himalayas* (Bedtime meditation story, 42m)
       10. *Autumn Rain on Cedar Roof* (Natural acoustic immersion, 60m)
       11. *Celestial Tibetan Singing Bowls* (Grounding harmonics, 60m)
       12. *Dr. Jud's Night Anxiety Deconstruct* (Somatic trigger unwind, 25m)
       13. *Warm Amber Hearthfire* (Gentle hearth ambient, 45m)
       14. *Binaural Lucid Dream Journey* (Theta-Delta transition, 50m)
       15. *Tara Brach: Radical Self-Forgiveness at Bedtime* (Compassion practice, 32m)
       16. *The Midnight Constellation Walk* (Astral sleep story, 38m)

3. **Offline Audio Engine (`src/utils/audioEngine.ts`):**
   - Web Audio API procedural synthesizers:
     - 432Hz and 528Hz pure sine/harmonics Solfeggio generator.
     - 200Hz/202Hz binaural oscillator generating true 2Hz Delta wave sleep entrainment.
     - Multi-stage pink noise ocean rain synthesis with randomized lowpass filtering.
     - 90-second SOS breath pacer chime.
   - Synthesizes audio 100% offline with zero data consumption or external asset requests.

4. **Single Sovereign Paid Plan (`src/components/SubscriptionScreen.tsx`):**
   - Unifies monetization into one clear Sovereign Tier:
     - Annual: $69.99/year (7-day free trial).
     - Monthly: $9.99/month.
   - Unlocks all 12 premium sleep tracks, all 45 audiobook chapters, world expert masterclasses, and unlimited Vinay Kapoor AI dialogue.
   - Triggers 528Hz Solfeggio confirmation frequency upon unlock.
   - Synchronized with `human2_is_premium` local storage key.

5. **Standalone Audiobook Section (`src/components/AudioChaptersScreen.tsx`):**
   - Dedicated "Listen" section housing the complete 45-chapter *Human 2.0* audiobook by Vinay Kapoor.
   - Chapters 1–3 marked with green `FREE` badge, accessible to all users.
   - Chapters 4–45 marked with gold `SOVEREIGN` lock badge.
   - Free users tapping locked chapters are seamlessly guided to the Sovereign unlock screen.

6. **Favourites & Continue Listening (`src/context/AudioContext.tsx` & `src/components/VaultScreen.tsx`):**
   - Bookmark any sleep track or chapter to personal favourites.
   - Real-time listening position tracking with clamped duration bounds.
   - Dedicated interactive shelves on both Home Screen and Vault Screen with 1-tap playback.

7. **5-Tab Navigation (`src/components/BottomTabBar.tsx`):**
   - Refined to 5 primary destinations with >= 48px touch targets:
     1. **Sleep** (`home`): Sleep sanctuary & curated soundscapes.
     2. **Listen** (`audio_chapters`): Full 45-chapter audiobook series.
     3. **Reset** (`pause`): Elevated 90-second acute SOS silencer.
     4. **Ebb AI** (`ebb`): Conversational meditation guide (Vinay Kapoor persona).
     5. **Vault** (`vault`): Favourites, continue listening, MAMs, and private insights.

---

## 5. Mobile Responsiveness & Layout Verification

- **360px Viewport Check:** Zero horizontal scroll (`overflow-x: hidden` enforced on `html`, `body`, `#root`, and container viewports).
- **Touch Target Sizing:** All navigation buttons, audio controls, and interactive elements maintain >= 44x44px hit bounds.
- **iOS Safari Auto-Zoom Guard:** Form controls (`input`, `textarea`, `select`) enforce `font-size: 16px !important`, preventing automatic zoom on touch devices.
- **Safe Area Insets:** Content dynamically respects `--sat` and `--sab` to avoid notch and home indicator collisions.

---

## 6. Verification & Automated Test Suite

A comprehensive 5-tier test suite with 193 automated tests verifies all contracts, boundaries, and real-world scenarios:

```
▶ Tier 1: Core PWA Engine & Sleep App Features (70 tests)
▶ Tier 2: Boundary Value Analysis (85 tests)
▶ Tier 3: Cross-Feature Pairwise Combinations (18 tests)
▶ Tier 4: Real-World Scenarios (5 tests)
▶ Tier 5: Adversarial Edge Cases (15 tests)

ℹ tests 193
ℹ suites 36
ℹ pass 193
ℹ fail 0
```

---

## 7. Native Wrapper (Capacitor) Readiness

- **Output Folder:** Single static `dist/` directory generated via `npm run build`.
- **SSR Check:** 0 server-side rendering dependencies or Node.js runtime scripts in output.
- **Environment Driven:** External URLs configured via `import.meta.env.VITE_*` with graceful fallbacks.
- **Capacitor Packaging:**
  ```bash
  npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
  npx cap init "Human 2.0" "app.human2.sleep" --web-dir="dist"
  npx cap add ios
  npx cap add android
  npx cap sync
  ```

---

## 8. Manual Test Checklists

### Android Chrome
- [ ] Navigate to the app URL over HTTPS.
- [ ] Observe the "Install Human 2.0" custom banner or tap browser menu → *Install app*.
- [ ] Verify app launches in full-screen standalone mode without URL bar.
- [ ] Play *432Hz Deep Theta Drift* (Free) — confirm audio plays immediately without registration or login modal.
- [ ] Add track to Favourites — verify it appears in Vault Screen.
- [ ] Simulate new deployment — confirm *"New version available · Tap to refresh"* toast appears.

### iOS Safari
- [ ] Open app in Safari over HTTPS.
- [ ] Tap Share icon → select *Add to Home Screen*.
- [ ] Launch installed app from Home Screen.
- [ ] Verify content clears the top status bar / Dynamic Island and bottom home bar.
- [ ] Tap any form input or search bar — verify viewport does NOT zoom automatically.
- [ ] Open Chapters 1–3 — confirm free playback.
- [ ] Open Chapter 4 — confirm Sovereign membership prompt appears.
- [ ] Switch between Daylight light mode and Night Sanctuary dark mode.

---

## 9. Summary of Changed Files

| File | Purpose |
|---|---|
| `public/manifest.webmanifest` & `manifest.json` | W3C standalone PWA Web Manifest |
| `public/icons/` | Brand icon suite (192px, 512px, maskable, apple-touch-icon) |
| `public/sw.js` | Service Worker with app-shell precache and skip-waiting |
| `index.html` | iOS meta tags, viewport-fit=cover, and manifest link |
| `src/index.css` | Safe area CSS vars, 16px input guard, and overflow-x prevention |
| `src/types/index.ts` | Types for `SleepTrack`, `PlayableTrack`, and `ContinueListeningItem` |
| `src/data/sleepCatalogData.ts` | 16 curated sleep tracks (4 free, 12 Sovereign) |
| `src/utils/audioEngine.ts` | Offline procedural Web Audio synthesis (Solfeggio, Delta binaurals, ocean rain, SOS) |
| `src/context/AudioContext.tsx` | Upgraded polymorphic audio engine with favorites & continue listening |
| `src/components/HomeScreen.tsx` | Sleep Sanctuary Home Screen with Bedtime Hero, SOS reset, and timers |
| `src/components/AudioChaptersScreen.tsx` | Dedicated Listen screen with Free (1-3) & Sovereign (4-45) badges |
| `src/components/VaultScreen.tsx` | Private vault with Favourites shelf and Continue Listening shelf |
| `src/components/BottomTabBar.tsx` | Streamlined 5-tab mobile navigation bar with >= 48px touch targets |
| `src/components/UpdateToast.tsx` | Floating update notification toast |
| `src/components/InstallPromptModal.tsx` | Custom Android & iOS PWA install modal |
| `src/pwa/registerServiceWorker.ts` | Service worker registration & update coordination bridge |
| `src/pwa/usePwaInstall.ts` | Install prompt detection hook |
| `src/App.tsx` | Mounted PWA update & install components and streamlined routing |
| `tests/e2e/` | Multi-tier test suites (193 tests) |
