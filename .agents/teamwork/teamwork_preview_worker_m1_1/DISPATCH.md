## 2026-10-08T02:10:30Z
You are teamwork_preview_worker for Milestone 1 (PWA Engine, Manifest, Icons, Service Worker, Update Flow & Install Experience).
Your working directory is: C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_worker_m1_1
The project root is: C:\Users\annak\.gemini\antigravity\scratch\human2

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY: Read these files before doing anything else:
1. C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\ORIGINAL_REQUEST.md
2. C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\PROJECT.md
3. C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_m1_1\handoff.md and analysis.md
4. C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_m1_2\handoff.md and analysis.md
5. C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_m1_3\handoff.md and analysis.md

Write Ownership:
You own and have exclusive write permission on the following files:
- public/manifest.webmanifest
- public/manifest.json
- public/favicon.svg
- public/icons/ (icon-192x192.png, icon-512x512.png, icon-maskable-512x512.png, apple-touch-icon-180x180.png, icon.svg)
- scripts/generateIcons.cjs
- index.html
- public/sw.js
- src/pwa/registerServiceWorker.ts
- src/pwa/usePwaInstall.ts
- src/components/UpdateToast.tsx
- src/components/InstallPromptModal.tsx
- src/App.tsx (wiring UpdateToast, InstallPromptModal, and registering SW)

Specific Implementation Tasks:
1. Implement `public/manifest.webmanifest` and `public/manifest.json` following the W3C spec from Explorer M1-1 (name: "Human 2.0", short_name: "Human 2.0", start_url: "/", scope: "/", display: "standalone", orientation: "portrait", theme_color: "#05070a", background_color: "#05070a", 4 icon definitions with proper MIME types, and sleep shortcuts).
2. Generate the complete brand icon suite in `public/icons/` using the gold 2.0 monogram (`#fae3cb` -> `#e8b98a`), deep teal circle, and halo:
   - `icon-192x192.png`
   - `icon-512x512.png`
   - `icon-maskable-512x512.png` (safe zone compliant)
   - `apple-touch-icon-180x180.png`
   - Also update `public/favicon.svg` and provide `public/icons/icon.svg`.
   Use `scripts/generateIcons.cjs` (with sharp or native Node zlib fallback as specified by Explorer M1-1) and run it via `cmd /c "node scripts/generateIcons.cjs"`.
3. Update `index.html` with:
   - `<link rel="manifest" href="/manifest.webmanifest" />`
   - `<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />`
   - `<meta name="apple-mobile-web-app-capable" content="yes" />`
   - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`
   - `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#05070a" />`
   - `<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f7f3ec" />`
   - `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />`
4. Implement `public/sw.js` per Explorer M1-2:
   - Cache versioning (`human2-shell-v1`).
   - App shell precaching list (HTML, CSS, JS, critical fonts, icons).
   - CRITICAL HAZARD GUARD: Explicitly bypass range requests (`request.headers.has('range')`), audio/video destinations, and paths (`/audio/`, `/videos/`, `.mp3`, `.mp4`, `.pdf`) via early `return;`!
   - Offline navigation fallback returning cached `/index.html`.
   - Message listener for `{ type: 'SKIP_WAITING' }`.
   - Stale cache eviction in `activate` event.
5. Implement `src/pwa/registerServiceWorker.ts` with update detection, visibility change checks, and `useServiceWorkerUpdate` React hook.
6. Implement `src/components/UpdateToast.tsx` with Night Sanctuary dark theme, spring physics, and tap-to-refresh execution.
7. Implement `src/pwa/usePwaInstall.ts` handling `beforeinstallprompt`, iOS Safari detection, and automatic standalone suppression.
8. Implement `src/components/InstallPromptModal.tsx` for Android 1-tap install and iOS Safari 3-step guide ("Tap Share -> Add to Home Screen").
9. Wire these into `src/App.tsx` cleanly.
10. Run build verification:
   `cmd /c "npm run build"`
   `cmd /c "npm run lint"`
   Ensure exit code is 0 and TypeScript compiles without errors.

Output Requirements:
- Write changes to target files.
- Write a complete handoff report to:
  C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_worker_m1_1\handoff.md
- Include build and test commands and results.
- Send a completion message back to the orchestrator.
