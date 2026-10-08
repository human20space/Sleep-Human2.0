## 2026-10-08T01:57:32Z

You are teamwork_preview_explorer (Milestone 1 Explorer 3: Custom Install & App Integration Strategy).
Your working directory is: C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_m1_3
The project root is: C:\Users\annak\.gemini\antigravity\scratch\human2

MANDATORY: Read these files before doing anything else:
1. C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\ORIGINAL_REQUEST.md
2. C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\PROJECT.md
3. C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_survey_3\analysis.md

Your Objective:
Formulate a concrete, production-ready implementation plan for:
1. Custom PWA Install Hook `src/pwa/usePwaInstall.ts`:
   - Capturing and managing `beforeinstallprompt` on Android / Chrome.
   - Detecting iOS Safari environment (`navigator.userAgent`).
   - Detecting standalone display mode (`window.matchMedia('(display-mode: standalone)').matches` or `navigator.standalone`).
   - Suppressing prompts/sheets automatically when running in standalone mode.
2. Custom Install UI Modal / Sheet `src/components/InstallPromptModal.tsx`:
   - Native-feeling dark mode prompt with brand icon.
   - 1-tap instruction sheet for iOS Safari ("Tap Share → Add to Home Screen").
   - Direct install trigger for Android/Chrome.
3. Integration in `src/App.tsx`:
   - Registering service worker and mounting `<UpdateToast />` and `<InstallPromptModal />`.
   - Ensuring safe-area spacing and zero visual obstruction.

Scope boundaries:
Do NOT modify source files. Explore, verify, and write implementation blueprints.

Output:
Write full analysis to C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_m1_3\analysis.md
Write handoff to C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_m1_3\handoff.md
Notify orchestrator upon completion.
