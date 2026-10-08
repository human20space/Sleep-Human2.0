# Handoff Report: UI & Audio Architecture Survey (Survey 2)

**Task:** Survey existing UI screens, navigation flow, audio player implementation, audio catalog, and user vault storage to plan streamlining into the "Sleep Supporting Mobile App".  
**Survey Explorer:** `teamwork_preview_explorer` (Survey Explorer 2)  
**Working Directory:** `C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_survey_2`  
**Date:** 2026-10-08  

---

## 1. Observation

### 1.1 Screen Routing & Transitions
- **File:** `src/App.tsx:27`  
  ```tsx
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  ```
  Screen routing is purely state-driven SPA routing. `Screen` union type is defined in `src/types/index.ts:1-19` and already includes `'sleep'`.
- **Transitions:** `src/App.tsx:153-401` wraps screen renders in `<AnimatePresence mode="wait">` with `motion.div` opacity and translate transitions.
- **Device Frame:** `src/components/PhoneFrame.tsx:23` uses `setIsMobileScreen(window.innerWidth < 640)`. When `< 640px`, it renders pure edge-to-edge `100vw x 100dvh` without artificial frames; on desktop (`>= 640px`), it renders a simulated 390px x 844px mobile device bezel with desktop chrome controls.

### 1.2 Bottom Tab Bar Navigation
- **File:** `src/components/BottomTabBar.tsx:13-20`  
  Renders 6 tabs:
  ```tsx
  const tabs = [
    { id: 'home' as Screen, label: 'Home', icon: Home },
    { id: 'mirror' as Screen, label: 'Mirror', icon: Eye },
    { id: 'pause' as Screen, label: 'Pause', icon: Pause, isCenterHero: true },
    { id: 'practice' as Screen, label: 'Practice', icon: Sparkles },
    { id: 'journey' as Screen, label: 'Journey', icon: Compass },
    { id: 'profile' as Screen, label: 'Author', icon: User },
  ];
  ```
  No dedicated tab exists for **Sleep** or the **Audiobook / Listen**. 6 tabs cause cramped touch targets (<48px) on a 360px viewport.

### 1.3 Audio Architecture Disconnect
- **AudioContext & Audiobook Player (`src/context/AudioContext.tsx`, `src/components/AudioChaptersScreen.tsx`):**  
  - Tightly coupled to `AudioChapter` and `AUDIO_CHAPTERS` (`src/data/audioChaptersData.ts`).
  - Plays real HTML5 `<audio>` from `/audio/${encodeURIComponent(chapter.fileName)}` with Google Drive streaming fallback (`src/context/AudioContext.tsx:65, 113`).
  - Controls floating `MiniPlayerBar.tsx` (rendered at `src/App.tsx:404-410` at `bottom-[66px]`).
  - Persists `human2_last_chapter_id` and `human2_last_timestamp` in `localStorage`.
- **Mindfulness & Sleep Player (`src/components/AudioConstructionPlayer.tsx`):**  
  - Rendered as an isolated modal in `src/App.tsx:135-151` (`activeConstructionSession`).
  - Plays a simulated 432Hz ambient synth tone via `audioEngine.toggleAmbientDrone()` (`AudioConstructionPlayer.tsx:74`) or file upload.
  - **Disconnected from `AudioContext`:** Does not integrate with `MiniPlayerBar`, does not save progress, and dismisses when the user navigates away.

### 1.4 Web Audio API Sound Engine
- **File:** `src/utils/audioEngine.ts:4-150`  
  - Contains zero-latency offline Web Audio API sound generation:
    - `playBowlChime(freq = 320, duration = 4)` (Tibetan singing bowl harmonics: `[1, 2.01, 3.02, 4.05]`)
    - `playBreathChime(type)` (Inhale, hold, exhale sine tone curves)
    - `toggleAmbientDrone()` / `stopAmbientDrone()` (432Hz harmonic chord `[216, 324, 432, 648]` with 450Hz low-pass filter)
  - Runs 100% offline with zero assets or network latency.

### 1.5 Audio Assets on Disk
- **Directory:** `public/audio/`  
  Contains 48 audio files: `Chapter 1.mp3` through `Chapter 45.mp3` (including `Chapter 5.1`, `5.2`, `19.1`, `19.2`, `19.3`). All 45 audiobook chapters exist physically on disk.
- Non-audiobook sessions in `src/data/extendedMindfulnessData.ts` (`SLEEP_LIBRARY`, `SOS_SESSIONS`, `MASTERCLASSES`) have metadata but point to `audioFileStatus: 'in_production'`.

### 1.6 User Vault & LocalStorage Handling
A search for `localStorage` across `src/` revealed the following active keys:
- `human2_dark_mode` (`'true'` | `'false'`)
- `human2_insights` (JSON array of `UserInsight`)
- `human2_mams` (JSON array of `AwarenessMoment`)
- `human2_is_premium` (`'true'` | `'false'` — toggled in `SubscriptionScreen.tsx:45` and checked in `ProfileScreen.tsx` and `EbbCompanionScreen.tsx`)
- `human2_teacher_queries_today` (daily query quota counter)
- `human2_last_chapter_id` (audiobook chapter ID)
- `human2_last_timestamp` (audiobook scrub position)
- `human2_ai_teacher_chat_v1` (AI teacher chat history)
- `human2_haptics_enabled` (`'true'` | `'false'`)
- **Missing Keys:** No `human2_favorites` array; no `human2_continue_listening` tracking across sleep recordings.

---

## 2. Logic Chain

1. **Premise 1:** The user request mandates streamlining Human 2.0 into a pure "Sleep Supporting Mobile App" for iOS and Android, focusing on sleep induction, restorative soundscapes, and nighttime unwinding.
2. **From Observation 1.1 & 1.2:** Currently, `HomeScreen.tsx` presents a complex 8-section daytime productivity/awareness dashboard, while `BottomTabBar.tsx` has 6 tabs and lacks a dedicated Sleep or Listen tab.
3. **Inference 1:** To eliminate cognitive friction, `HomeScreen.tsx` must be converted into the primary **Sleep Sanctuary** view, and `BottomTabBar.tsx` must be reduced to 5 high-contrast tabs:
   - Tab 1: **Sleep** (`home` / `sleep`)
   - Tab 2: **Listen** (`listen` / `audio_chapters`) — dedicated home for the 45-chapter Audiobook
   - Tab 3: **Reset** (`pause`, Center Hero) — 90s acute SOS racing mind silencer
   - Tab 4: **Ebb** (`ebb`) — Somatic AI wind-down companion
   - Tab 5: **Vault** (`vault`) — Favourites, Continue Listening progress, MAMs, and Sovereign status
4. **From Observation 1.3 & 1.4:** Audio playback is fragmented between `AudioContext` (HTML5 `<audio>` for the book) and `AudioConstructionPlayer` (Web Audio synth for sessions).
5. **Inference 2:** `AudioContext.tsx` must be elevated to a unified track provider capable of playing both MP3 audio files (`AudioChapter`) and procedural soundscapes (`SleepTrack` synthesized via `audioEngine`). This allows any sleepcast, soundscape, or chapter to be controlled seamlessly by the persistent `MiniPlayerBar.tsx` and have its sleep timer fade out reliably.
6. **From Observation 1.4 & 1.5:** Only the 45 audiobook chapters exist as MP3 files in `public/audio/`. The sleep library sessions have rich metadata but lack dedicated MP3 files.
7. **Inference 3:** By augmenting `audioEngine.ts` with procedural generators for:
   - 528Hz Solfeggio miracle tone,
   - Delta wave sleep binaurals (2Hz beat on 200Hz carrier),
   - Ocean rain pink noise,
   - Acute 90-second physiological sigh breathing cues,
   all 16 recordings in the Curated Sleep Catalog can be **100% playable and functional offline immediately**, satisfying the PWA zero-latency requirement.
8. **From Observation 1.6:** `human2_is_premium` already functions client-side in `SubscriptionScreen.tsx` and `ProfileScreen.tsx`.
9. **Inference 4:** Establishing 3–5 Free Tier sleep tracks (e.g. 90s SOS Reset, 432Hz Stillness, Rain on Kyoto Bamboo Groves, Somatic Body Melt, Audiobook Ch 1–3) requires zero login. Premium tracks display a gold lock; tapping them invokes `SubscriptionScreen.tsx`, whose 1-tap simulation unlocks all tracks globally by setting `human2_is_premium = 'true'` with a celebratory 528Hz chime.
10. **From Observation 1.6:** `human2_favorites` and `human2_continue_listening` are missing. Adding these two keys completes the User Vault persistence requirement.

---

## 3. Caveats

1. **Manifest and Service Worker:** PWA web manifest, icon suite generation, and service worker caching are scoped under Survey Explorer 1 (`survey_1`), and are not covered in this UI/Audio architecture report.
2. **Audio File Assets:** No new MP3 files were downloaded or placed in `public/audio/`. The sleep soundscapes and SOS reset rely on procedural Web Audio API synthesis in `audioEngine.ts` and existing audio fallback mechanisms.
3. **No Direct Code Modifications:** In strict compliance with the subagent constraints, zero files were modified during this exploration task.

---

## 4. Conclusion

The application architecture is well-suited for streamlining into a high-performance Sleep Supporting Mobile App. The implementation team should execute the following 7-step blueprint:

1. **Data Model (`types/index.ts` & `data/sleepCatalogData.ts`):** Define `SleepTrack`, `PlayableTrack`, and `ContinueListeningItem`. Populate a curated 16-recording sleep catalog (4 Free tracks, 12 Sovereign tracks).
2. **Unified Audio Engine (`audioEngine.ts`):** Extend with 528Hz Solfeggio drone, 2Hz Delta wave binaural beats, and pink noise ocean rain.
3. **Unified Audio Context (`AudioContext.tsx`):** Support polymorphic playback for both audio files and procedural synth soundscapes; persist `human2_continue_listening` and `human2_favorites`.
4. **Sleep Sanctuary Home Screen (`HomeScreen.tsx`):** Replace the multi-section dashboard with a serene nighttime sanctuary featuring a 1-tap bedtime immersion card, 90s SOS reset button, quick sleep timers, continue listening row, and sleep catalog carousels.
5. **Standalone "Listen" Tab:** Map `audio_chapters` to a top-level "Listen" tab in `BottomTabBar.tsx`, unlocking Chapters 1–3 for free and gating Chapters 4–45 behind the Sovereign tier.
6. **Bottom Tab Bar Optimization (`BottomTabBar.tsx`):** Reduce to 5 tabs (`Sleep`, `Listen`, `Reset` [Center Hero], `Ebb`, `Vault`) with >=48px touch targets.
7. **User Vault Persistence (`VaultScreen.tsx`):** Add Favourites shelf, Continue Listening shelf, and a Sovereign Membership simulation toggle.

---

## 5. Verification Method

To independently verify the facts and architecture described in this report:

1. **Routing and Screen Inspection:**
   - Run `view_file` on `src/App.tsx:26-424` to confirm state-based routing and `<AnimatePresence>` screen transitions.
   - Run `view_file` on `src/components/BottomTabBar.tsx:13-20` to inspect existing 6 tabs.
2. **Audio Implementation Inspection:**
   - Run `view_file` on `src/context/AudioContext.tsx:35-125` to inspect coupling to `AudioChapter`.
   - Run `view_file` on `src/components/AudioConstructionPlayer.tsx:49-88` to inspect isolated Web Audio synth playback.
   - Run `view_file` on `src/utils/audioEngine.ts:85-147` to inspect procedural 432Hz ambient drone synth.
3. **Disk Audio Assets:**
   - Inspect `public/audio/` using `find_by_name` to confirm all 45 chapter MP3s are present on disk.
4. **LocalStorage Audit:**
   - Execute PowerShell command:
     ```powershell
     Get-ChildItem -Path "src" -Recurse -Filter "*.ts*" | Select-String -Pattern "localStorage"
     ```
   - Confirm verified keys match Section 1.6 of this report.
5. **Baseline Build & Lint Verification:**
   - Run `npm run build` (`tsc -b && vite build`) to confirm clean TypeScript compilation with 0 errors.
   - Run `npm run lint` (`oxlint`) to verify code health.
