# Handoff Report: Survey Explorer 3 — PWA Engine & Mobile Spec

**From**: `teamwork_preview_explorer` (Survey Explorer 3)  
**To**: `teamwork_preview_orchestrator_1` (Parent Orchestrator)  
**Date**: 2026-10-08  
**Working Directory**: `C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_survey_3`  
**Type**: Hard Handoff (Investigation & Specification Complete)

---

## 1. Observation

Direct observations from tool executions and codebase inspection:

1. **Manifest File Absence**:
   - `find_by_name` for pattern `*manifest*` across `C:\Users\annak\.gemini\antigravity\scratch\human2` returned `Found 0 results`.
   - Neither `public/manifest.webmanifest` nor `public/manifest.json` exists.
2. **Service Worker File Absence**:
   - `grep_search` for `serviceWorker` across `src/` returned `No results found`.
   - `find_by_name` for `*sw*` returned 0 project service worker scripts in `public/` or `src/`.
3. **PWA Meta Tag Deficiencies in `index.html`**:
   - `view_file` on `C:\Users\annak\.gemini\antigravity\scratch\human2\index.html` (lines 4–10):
     ```html
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
     <title>Human 2.0 — Personal Awareness Platform</title>
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400;1,500&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
     ```
   - Observed: Missing `<link rel="manifest">`, `<meta name="theme-color">`, `<meta name="apple-mobile-web-app-capable">`, `<meta name="apple-mobile-web-app-status-bar-style">`, and `<link rel="apple-touch-icon">`.
4. **Brand Icon Assets**:
   - `view_file` on `public/favicon.svg` showed a 48x46 SVG featuring purple geometry (`fill="#863bff"`), an unbranded default template.
   - `public/icons.svg` contains only third-party social media icon symbols (`bluesky-icon`, `discord-icon`, `github-icon`, `x-icon`).
   - No PNG launcher icons exist (`icon-192x192.png`, `icon-512x512.png`, `icon-maskable-512x512.png`, `apple-touch-icon-180x180.png`).
5. **Brand Glyph Master Identity**:
   - `view_file` on `src/components/SplashScreen.tsx` (lines 101–107):
     ```tsx
     <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#17495e] to-[#1f5f78] border border-white/20 flex items-center justify-center shadow-[0_0_50px_rgba(232,185,138,0.35)] animate-breath">
       <span className="font-serif-title font-bold text-4xl text-[#e8b98a]">2.0</span>
     </div>
     ```
   - Observed: Brand glyph is a gold `2.0` serif monogram (`#e8b98a` / `#d9a44a`) centered in a deep teal circular disc (`#17495e` -> `#1f5f78`) with stardust halo (`rgba(232,185,138,0.35)`).
6. **Safe Area Inset Gaps**:
   - `grep_search` for `safe-area` in `src/` revealed only one match: `src/components/BottomTabBar.tsx:23` (`pb-[max(env(safe-area-inset-bottom),10px)]`).
   - `view_file` on `src/components/PhoneFrame.tsx` (line 120): mobile floating ambient button is pinned to `top-2 right-3` with no notch protection (`env(safe-area-inset-top)`).
   - `view_file` on `src/components/MiniPlayerBar.tsx` (line 40): statically pinned to `bottom-[66px]`, which causes overlap on devices with a 34px bottom home indicator.
7. **Touch Target Size Deficiencies**:
   - `view_file` on `src/components/MiniPlayerBar.tsx`:
     - Skip button (line 96): `w-7 h-7` (28x28px)
     - Play button (line 106): `w-8 h-8` (32x32px)
     - Maximize button (line 119): `w-7 h-7` (28x28px)
     - Close button (line 128): `w-6 h-6` (24x24px)
   - `view_file` on `src/components/PauseScreen.tsx` (line 101): back button is `w-8 h-8` (32x32px).
   - All below the required >= 44x44px touch target threshold.
8. **Form Inputs Font Size Deficiencies**:
   - `view_file` on `src/components/MirrorScreen.tsx` (line 311): `<input ... className="... text-xs ...">` (12px).
   - `view_file` on `src/components/PauseScreen.tsx` (line 236): `<textarea ... className="... text-xs ...">` (12px).
   - `view_file` on `src/components/HumanAiScreen.tsx` (line 127): `<input ... className="... text-xs ...">` (12px).
   - `view_file` on `src/components/PracticeScreen.tsx` (line 247): `<textarea ... className="... text-xs ...">` (12px).
   - `view_file` on `src/components/JourneyScreen.tsx` (line 242): `<textarea ... className="... text-xs ...">` (12px).
   - All below 16px, causing iOS Safari to trigger automatic viewport zoom on focus.
9. **Build Verification**:
   - `run_command` on `cmd /c "npm run build"` exited with code 0 in 8.59s, cleanly compiling static assets to `dist/` (`dist/index.html` 0.88 kB, `dist/assets/index-BUPk9wMP.css` 73.19 kB, `dist/assets/index-DxPiB5g3.js` 665.06 kB).

---

## 2. Logic Chain

1. **Absence of Manifest & Icons Invalidates PWA Installability**:
   - Observation 1 & 4 show 0 manifest files and 0 PNG icons.
   - Chrome and Safari PWA install criteria require a valid manifest with `name`, `short_name`, `start_url`, `display: standalone`, and at least 192x192 and 512x512 icons.
   - Therefore, creating `public/manifest.webmanifest`, `public/manifest.json`, and generating the full icon suite (`192x192`, `512x512`, `maskable-512x512`, and `180x180` apple-touch-icon) in `public/icons/` is an immediate blocker prerequisite for Milestone 1.

2. **Absence of Service Worker Precludes Offline & Instant Updates**:
   - Observation 2 shows no service worker registration or script.
   - R1 explicitly requires: *"Precache the app shell only (HTML, CSS, JS, critical fonts). Never cache sensitive user data or dynamic API responses. Surface a sleek, non-intrusive toast: 'New version available · Tap to refresh'"*.
   - A pure vanilla Service Worker (`public/sw.js`) and client bridge (`src/pwa/registerServiceWorker.ts`) avoids introducing complex peer-dependency issues between Vite 8 and external plugins while delivering full lifecycle control over `SKIP_WAITING` and cache purging.

3. **Safe Area Insets Gaps Risk Layout Occlusion on Mobile**:
   - Observations 3 & 6 demonstrate that only `BottomTabBar.tsx` handles bottom safe area; headers and floating buttons ignore `env(safe-area-inset-top)`.
   - On iOS devices with a Dynamic Island or notch, elements pinned to the top (e.g. ambient button in `PhoneFrame`, header titles in `HomeScreen` and `PauseScreen`) will render behind hardware cutouts.
   - Adding `pt-[max(env(safe-area-inset-top),...)]` and updating `MiniPlayerBar` to `bottom-[calc(max(env(safe-area-inset-bottom),12px)+56px)]` ensures zero UI collisions.

4. **12px Inputs Trigger Destructive iOS Zoom**:
   - Observation 8 shows inputs and textareas across 5 components styled with `text-xs` (12px).
   - On mobile Safari, any input focused with computed font size < 16px forces the viewport to zoom in, breaking fixed app-shell positioning.
   - Enforcing an `@layer base` CSS rule in `src/index.css` (`font-size: 16px !important` on inputs, textareas, and selects) establishes an ironclad guardrail that permanently prevents auto-zooming.

5. **Sub-44px Controls Violate Mobile Accessibility & Touch Target Standards**:
   - Observation 7 shows audio transport controls in `MiniPlayerBar` sized as small as 24px–28px, and back buttons sized 32px.
   - Expanding button touch bounding boxes to at least 44x44px (`min-w-[44px] min-h-[44px]` or padding hit slop) guarantees compliance with WCAG AAA / Apple HIG guidelines.

---

## 3. Caveats

1. **Audio File Streaming Precache Exclusion**:
   - Audio files (large MP3 files in `public/audio/` and Google Drive audiobook streams) are excluded from the initial service worker precache to prevent cache quota exhaustion and high initial load latency. Only the app shell is precached.
2. **Capacitor Native Shell Readiness**:
   - The analysis focused on client PWA specifications. Native Capacitor configuration (`capacitor.config.ts`, `ios/`, `android/`) is fully compatible with the static output in `dist/`, but native IDE projects (Xcode/Android Studio) are maintained separately.
3. **No Code Modification Undertaken**:
   - In accordance with the Explorer role constraints, zero project code files were modified during this investigation. All findings and code implementations are provided as architectural templates in `analysis.md`.

---

## 4. Conclusion

The Human 2.0 application has a fast, cleanly building Vite 8 + React 19 baseline, but completely lacks PWA and mobile installation infrastructure.

To achieve complete compliance with `ORIGINAL_REQUEST.md`:
1. **PWA Infrastructure (Milestone 1)**:
   - Create `public/manifest.webmanifest` and `public/manifest.json`.
   - Generate brand icon suite in `public/icons/` (`192x192`, `512x512`, `maskable-512x512`, `apple-touch-icon-180x180`).
   - Create `public/sw.js` with app-shell precaching, offline navigation fallback, and `SKIP_WAITING` listener.
   - Add `src/pwa/registerServiceWorker.ts` and `src/components/UpdateToast.tsx` for instant update notifications.
   - Add `src/components/InstallPromptModal.tsx` and `src/pwa/usePwaInstall.ts` for custom Android/iOS install experiences.
   - Update `index.html` with full suite of PWA and Apple mobile meta tags.
2. **Mobile Layout & Constraints (Milestone 3)**:
   - Update `src/index.css` with `overflow-x: hidden`, safe area fallback CSS variables, and global 16px input font enforcement.
   - Update `PhoneFrame.tsx`, `MiniPlayerBar.tsx`, and `BottomTabBar.tsx` with safe area top/bottom insets and >=44px touch targets.

Full technical details, schemas, and complete code snippets are compiled in `analysis.md`.

---

## 5. Verification Method

To independently verify the baseline and prospective implementation:

1. **Build Validation**:
   ```powershell
   cmd /c "npm run build"
   ```
   *Expected*: Zero TypeScript compilation errors, exit code 0, single `dist/` directory produced.
2. **Manifest Validation**:
   - Inspect `public/manifest.webmanifest`.
   - In Chrome DevTools, open **Application > Manifest**:
     - Verify `Name: Human 2.0`, `Short name: Human 2.0`.
     - Verify `Start URL: /`, `Display: standalone`, `Orientation: portrait`.
     - Verify 192x192, 512x512, and maskable icons load without warning.
3. **Service Worker Lifecycle Validation**:
   - In Chrome DevTools, open **Application > Service Workers**:
     - Verify `/sw.js` is registered and active on scope `/`.
     - Toggle DevTools Network to **Offline** and reload: app shell renders cleanly.
4. **Mobile Constraints Validation**:
   - In Chrome DevTools Device Mode, select **iPhone 14 Pro / 360x640 Android**:
     - Verify 0 horizontal scroll (`document.documentElement.scrollWidth <= window.innerWidth`).
     - Verify all button bounding boxes (`element.getBoundingClientRect()`) measure >= 44x44px.
     - Inspect `<input>` and `<textarea>` computed styles: `font-size` must be `>= 16px`.
