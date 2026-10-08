# Handoff Report: Milestone 1 Custom Install & App Integration Strategy

**Agent**: `teamwork_preview_explorer` (Milestone 1 Explorer 3)  
**Date**: 2026-10-08  
**Working Directory**: `C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_m1_3`  
**Target Project**: `Human 2.0` (`C:\Users\annak\.gemini\antigravity\scratch\human2`)  
**Parent / Recipient**: `b76b023e-c7c9-4259-918e-bd86ffd81e40`  

---

## 1. Observation

1. **Current Codebase Baseline & Build**:
   - `package.json` contains dependencies: `react: ^19.2.8`, `react-dom: ^19.2.8`, `@tailwindcss/vite: ^4.3.3`, `tailwindcss: ^4.3.3`, `framer-motion: ^14.0.0`, `lucide-react: ^1.51.0`, `vite: ^8.3.0`, and `typescript: ~6.0.2`.
   - Executing `cmd /c "npm run build"` builds the client cleanly in 31.93s with exit code 0, emitting static output to `dist/`:
     - `dist/index.html` (0.88 kB)
     - `dist/assets/index-T_uxuKi_.css` (74.88 kB)
     - `dist/assets/index-CG5kvjOB.js` (665.06 kB)
2. **Absence of PWA Install Logic**:
   - Directory search for `*pwa*` in `src/` yielded 0 results. No `usePwaInstall.ts`, `registerServiceWorker.ts`, `InstallPromptModal.tsx`, or `UpdateToast.tsx` exist yet.
3. **App Architecture & Stacking Context**:
   - In `src/App.tsx` (lines 132–424), components are arranged inside `<PhoneFrame>`:
     - `activeConstructionSession` modal at line 143: `absolute inset-0 z-50 flex flex-col`.
     - Screen routing via `<AnimatePresence mode="wait">` (lines 153–401).
     - Persistent `MiniPlayerBar` (line 409) at `absolute bottom-[66px] z-30`.
     - Global `BottomTabBar` (lines 416–420) at `absolute left-0 right-0 bottom-0 z-40 pb-[max(env(safe-area-inset-bottom),10px)]`.
   - Currently, there are no top-layer mount points for update toasts or install modals.
4. **Touch Target and Safe Area Deficiencies**:
   - In `src/components/PhoneFrame.tsx` line 120, the ambient sound button is placed at `top-2 right-3` without checking `env(safe-area-inset-top)`.
   - In `src/components/BottomTabBar.tsx`, tab items lack explicit `min-w-[44px] min-h-[44px]` touch targets.
   - In `src/components/MiniPlayerBar.tsx`, control buttons range between 24px and 32px (`w-6 h-6`, `w-7 h-7`, `w-8 h-8`), violating the >=44px touch bounding box constraint.
5. **Platform Constraints for PWA Installation**:
   - Chromium browsers emit `beforeinstallprompt` on `window`, requiring `event.preventDefault()` and deferred invocation via `prompt()`.
   - iOS Safari does not support `beforeinstallprompt` or programmatic prompt triggers; installation requires manual navigation via Safari's share menu ("Tap Share → Add to Home Screen").
   - Standalone mode is detectable via `window.matchMedia('(display-mode: standalone)').matches`, `(navigator as any).standalone === true`, or `document.referrer.includes('android-app://')`.

---

## 2. Logic Chain

1. **Premise 1 (Platform Divergence)**: Because iOS Safari does not support `beforeinstallprompt` while Android/Chrome requires intercepting `beforeinstallprompt` to prevent the intrusive default mini-infobar, `usePwaInstall.ts` must maintain a polymorphic state:
   - For Android/Chrome: intercept `beforeinstallprompt`, store the event, and expose a direct `promptInstall()` method.
   - For iOS Safari: detect the device (`/iPad|iPhone|iPod/` and iPadOS `MacIntel` touch check) and browser (`Safari` without third-party wrapper identifiers), exposing an instruction-sheet mode instead.
2. **Premise 2 (Zero-Nag & Standalone Suppression)**: When an app is launched in standalone mode, asking the user to install is redundant and damages immersion. Therefore:
   - `checkIsStandalone()` evaluates media queries (`standalone`, `fullscreen`, `minimal-ui`), iOS property `navigator.standalone`, and Android WebAPK referrers.
   - A `matchMedia('(display-mode: standalone)')` change listener dynamically updates `isInstalled` in real-time.
   - If `isInstalled === true`, `isInstallable` is strictly false and all modals/sheets are suppressed.
   - If dismissed, a timestamp is saved to `localStorage` to enforce a 7-day cooldown on automatic popups while preserving manual triggers.
3. **Premise 3 (Ergonomic, Accessible UI)**: The custom install modal must fit the Night Sanctuary visual identity and satisfy mobile guidelines:
   - Surface colors: `#101b22`, border `#d9a44a`/30, gold monogram glyph `2.0`, benefits breakdown (Offline sleep soundscapes, background audio, full-screen immersion).
   - On Android: 1-tap "Install App to Home Screen" action button.
   - On iOS Safari: 3-step visual instruction card with `<Share />` and `<PlusSquare />` icons.
   - Safe-area bottom padding `pb-[max(env(safe-area-inset-bottom),20px)]` and >=44×44px touch targets.
4. **Premise 4 (Layer Stacking & Coordination in `src/App.tsx`)**:
   - Mount `<UpdateToast />` at `z-[60]` with `top-[max(env(safe-area-inset-top),16px)]` so it floats safely below hardware notches/Dynamic Island.
   - Mount `<InstallPromptModal />` at `z-[70]` so it overlays all bottom sheets and navigation bars cleanly.
   - Wire `registerServiceWorker` into a top-level `useEffect` in `App.tsx` and connect `usePwaInstall` state to `HomeScreen` and `ProfileScreen` for manual install triggers.

---

## 3. Caveats

1. **Third-Party iOS Browsers (Chrome iOS, Firefox iOS)**: iOS browsers other than Safari (e.g. Chrome iOS using WKWebView) cannot add web applications to the iOS Home screen with full PWA standalone capability. The guide is specifically tuned to Mobile Safari.
2. **Chromium User Gesture Requirement**: Chromium mandates that `deferredPrompt.prompt()` must be executed during an explicit user interaction event (such as an `onClick` handler). Calling it asynchronously or without user gesture will fail. The proposed blueprint strictly binds `prompt()` to the user click.
3. **Private Browsing / Incognito**: Some browsers suppress `beforeinstallprompt` entirely when running in private or incognito windows. The hook gracefully falls back to showing browser manual install instructions.

---

## 4. Conclusion

The blueprints formulated in `analysis.md` provide a complete, drop-in, zero-dependency implementation across three key files:
1. `src/pwa/usePwaInstall.ts`: Comprehensive hook managing `beforeinstallprompt`, iOS Safari detection, standalone suppression, and dismissal cooldowns.
2. `src/components/InstallPromptModal.tsx`: Dual-mode dark sheet delivering 1-tap install on Android and a 3-step visual guide on iOS Safari with >=44px touch targets and safe-area padding.
3. `src/App.tsx`: Clean integration mounting `<UpdateToast />` (z-60) and `<InstallPromptModal />` (z-70), wiring service worker registration and manual install access points with zero visual obstruction.

---

## 5. Verification Method

To independently verify the implementation when landed:

1. **Static Build Validation**:
   ```bash
   cmd /c "npm run build"
   ```
   *Expected outcome*: Clean compilation with exit code 0 and output files in `dist/`.

2. **Standalone Mode Suppression Check**:
   - Open Chrome DevTools > Rendering tab.
   - Set **Emulate CSS media feature display-mode** to `standalone`.
   - Inspect `usePwaInstall()` return value: `isInstalled === true`, `isInstallable === false`.
   - Verify `<InstallPromptModal />` is never rendered.

3. **Android / Chromium Prompt Trigger**:
   - In DevTools Console, dispatch:
     ```javascript
     window.dispatchEvent(new Event('beforeinstallprompt'));
     ```
   - Verify modal opens with the "Install App to Home Screen" CTA button.
   - Dispatch `window.dispatchEvent(new Event('appinstalled'))`; verify modal closes and `isInstalled` becomes `true`.

4. **iOS Safari Instruction Sheet Check**:
   - Emulate iPhone user agent in Chrome DevTools Device Mode (e.g., iPhone 14 Pro).
   - Verify modal opens with 3-step tactile guide: "1. Tap Share → 2. Add to Home Screen → 3. Tap Add".
   - Tap "Got It" -> verify modal dismisses and `localStorage.getItem('human2_install_dismissed_at')` is recorded.

5. **Safe-Area Inset & Touch Target Audit**:
   - Inspect computed dimensions of buttons in DevTools: all hit areas are >= 44×44px.
   - Verify modal bottom padding satisfies `pb-[max(env(safe-area-inset-bottom),20px)]`.
