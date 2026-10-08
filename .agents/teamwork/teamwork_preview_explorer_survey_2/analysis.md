# Comprehensive Architecture & UI/Audio Exploration Report: Streamlining into "Sleep Supporting Mobile App"

**Date:** 2026-10-08  
**Survey Agent:** `teamwork_preview_explorer` (Survey Explorer 2: UI & Audio Architecture)  
**Project:** Human 2.0 (`C:\Users\annak\.gemini\antigravity\scratch\human2`)  
**Target:** Convert Human 2.0 into an installable, high-performance PWA streamlined into a pure "Sleep Supporting Mobile App" for iOS and Android.

---

## 1. Executive Summary

A comprehensive architectural and code-level survey was conducted on the Human 2.0 web application. The codebase currently comprises a feature-rich, multi-faceted personal awareness platform built on **React 19**, **Vite 8**, **Tailwind CSS v4**, and **Framer Motion 14**.

### Key Baseline Findings:
1. **Screen Routing & Navigation:** State-driven SPA routing (`currentScreen: Screen` in `src/App.tsx`) with animated `<AnimatePresence mode="wait">` transitions. The current bottom tab bar (`BottomTabBar.tsx`) hosts 6 tabs (`home`, `mirror`, `pause`, `practice`, `journey`, `profile`), which crowds mobile viewports (<390px) and lacks a dedicated Audio/Sleep focus.
2. **Audio Architecture Disconnect:** There are currently **two disconnected audio players**:
   - **AudioContext & AudioChaptersScreen:** Real HTML5 `<audio>` player controlling 45 audiobook MP3s (`/audio/Chapter 1.mp3` through `Chapter 45.mp3`), featuring timeline scrubbing, variable speed, sleep timer, and persistent localStorage tracking (`human2_last_chapter_id`, `human2_last_timestamp`). Powers the global `MiniPlayerBar.tsx`.
   - **AudioConstructionPlayer:** An isolated modal player rendering `ConstructionAudioSession` items from `extendedMindfulnessData.ts`. It synthesizes a 432Hz ambient drone or takes file uploads, but does **not** link to `AudioContext`, does **not** integrate with `MiniPlayerBar`, and loses playback state upon navigation.
3. **Sound Synthesis Capability:** `src/utils/audioEngine.ts` implements a Web Audio API engine capable of offline, zero-latency Tibetan singing bowl chimes, breath chimes, and a 432Hz harmonic drone pad. This engine can be extended to synthesize 528Hz Solfeggio tones, Delta wave sleep binaurals, and ocean rain noise without requiring large external audio files.
4. **User Vault & LocalStorage:** Clean client-side persistence exists for dark mode, insights, MAMs, and the premium flag (`human2_is_premium`). However, **Favourites** and **Continue Listening** across all sleep tracks are currently unpersisted.
5. **Path to Streamlining:** To fulfill the user's objective, the application can be streamlined by transforming the core landing experience into a distraction-free **Sleep Sanctuary**, relocating the 45-chapter Audiobook into a standalone **"Listen"** tab, providing a curated **12–20 track Sleep Catalog** (with 3–5 free tracks and a simulated Sovereign unlock), and unifying the audio architecture under `AudioContext`.

---

## 2. Deep Dive: Screen Routing, Navigation & Transitions (`src/App.tsx`)

### 2.1 Routing Mechanism
In `src/App.tsx` (lines 26–424), routing is handled via simple React state:
```tsx
const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
```
The screen definition in `src/types/index.ts` declares:
```typescript
export type Screen = 
  | 'splash' | 'home' | 'pause' | 'mirror' | 'practice' | 'journey' 
  | 'human_ai' | 'vault' | 'profile' | 'audio_chapters' | 'reader' 
  | 'ebb' | 'explore' | 'timer' | 'community' | 'foundations' 
  | 'sleep' | 'subscription';
```
*(Notice: `'sleep'` is already an existing valid type in `Screen`.)*

### 2.2 Screen Transition Architecture
All screens are orchestrated via Framer Motion's `<AnimatePresence mode="wait">` (lines 153–401):
```tsx
<AnimatePresence mode="wait">
  {currentScreen === 'splash' && (
    <motion.div key="splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} ...>
      <SplashScreen onComplete={() => setCurrentScreen('home')} />
    </motion.div>
  )}
  {currentScreen === 'home' && (
    <motion.div key="home" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} ...>
      <HomeScreen ... />
    </motion.div>
  )}
  {/* pause, mirror, practice, journey, human_ai, vault, profile, audio_chapters, ebb, timer, community, explore, subscription */}
</AnimatePresence>
```
Each screen takes an `onBack={() => setCurrentScreen('home')}` or `onNavigate={(screen) => setCurrentScreen(screen)}` callback.

### 2.3 Desktop Bezel Simulator vs. Mobile Edge-to-Edge (`PhoneFrame.tsx`)
In `src/components/PhoneFrame.tsx`:
- Detects mobile screen size: `setIsMobileScreen(window.innerWidth < 640)`.
- When `< 640px` (actual mobile device or responsive mode), renders **full edge-to-edge** `w-full h-full min-h-[100dvh]` without artificial bezels.
- When `>= 640px` (desktop), provides a phone bezel mockup (390px x 844px) or expanded view mode, plus a desktop header toolbar with 432Hz ambient toggle and dark mode toggle.
- Mobile view has safe-area classes ready for PWA standalone mode.

### 2.4 Bottom Tab Navigation (`BottomTabBar.tsx`)
Currently in `src/components/BottomTabBar.tsx` (lines 13–20):
```tsx
const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'mirror', label: 'Mirror', icon: Eye },
  { id: 'pause', label: 'Pause', icon: Pause, isCenterHero: true },
  { id: 'practice', label: 'Practice', icon: Sparkles },
  { id: 'journey', label: 'Journey', icon: Compass },
  { id: 'profile', label: 'Author', icon: User },
];
```
#### Deficiencies for the Sleep Mobile App:
- 6 tabs is too dense on a 360px viewport (tab target width is only ~50px, risking mistaps).
- No direct tab for **Sleep** or **Audiobook / Listen**.
- The Audiobook is currently hidden behind secondary buttons inside `HomeScreen` (lines 114–125 and 312–353) or via `MiniPlayerBar`.

---

## 3. Deep Dive: Audio Architecture & Players

### 3.1 The Two Disconnected Audio Systems

| Feature | System A: Audiobook (`AudioContext.tsx`) | System B: Sleep / Mindfulness (`AudioConstructionPlayer.tsx`) |
| :--- | :--- | :--- |
| **Component** | `AudioChaptersScreen.tsx` | `AudioConstructionPlayer.tsx` |
| **Data Source** | `AUDIO_CHAPTERS` in `data/audioChaptersData.ts` | `ConstructionAudioSession` in `data/extendedMindfulnessData.ts` |
| **Audio Mechanism** | HTML5 `<audio>` element with local MP3 files (`/audio/Chapter X.mp3`) + Google Drive download fallback | Web Audio API synth (`audioEngine.toggleAmbientDrone()`) or custom file upload via `<input type="file">` |
| **MiniPlayerBar** | Connected and synchronised | **Not connected**; no mini-player |
| **Persistence** | Saves `human2_last_chapter_id` and `human2_last_timestamp` | **None** |
| **Scrubbing/Rate** | Full seek bar, 0.75x–1.5x rates, skip ±15s | Basic range input, 1.0x–2.0x rates, skip ±15s |
| **Sleep Timer** | Integrated (15, 30, 45, 60m) with 200ms volume fadeout | No sleep timer |
| **UI Presentation** | Embedded screen with parts filter, search, tool cross-links | Full-screen modal overlay in `App.tsx` |

### 3.2 Global Audio Provider (`src/context/AudioContext.tsx`)
Lines 35–325 define `AudioContextType`:
- `currentChapter: AudioChapter`
- `isPlaying: boolean`
- `currentTime: number`, `duration: number`
- `playbackRate: number`, `isMuted: boolean`
- `sleepTimerMinutes: number | null`, `sleepTimerSecondsLeft: number | null`
- `showMiniPlayer: boolean`
- Methods: `playChapter()`, `togglePlay()`, `seek()`, `skip()`, `nextChapter()`, `prevChapter()`, `setRate()`, `toggleMute()`, `setSleepTimer()`, `dismissMiniPlayer()`, `restoreMiniPlayer()`.

#### The Problem:
`AudioContext` is currently hardcoded to `AudioChapter` and `AUDIO_CHAPTERS`. If a user starts a sleepcast (e.g., *Rain on Kyoto Bamboo Groves*) or a 432Hz Solfeggio soundscape from the Sleep catalog, `AudioContext` cannot represent it, and `MiniPlayerBar` cannot display it.

### 3.3 Web Audio Engine (`src/utils/audioEngine.ts`)
The `AudioEngine` singleton uses standard Web Audio API:
- `initContext()`: Handles audio context suspension and autoplay policies.
- `playBowlChime(freq = 320, duration = 4)`: Generates Tibetan Singing Bowl harmonics (`[1, 2.01, 3.02, 4.05]` harmonics with exponential gain decays and slight frequency drift).
- `playBreathChime(type: 'inhale' | 'exhale' | 'hold')`: Sine wave frequency ramps for breathing guidance.
- `toggleAmbientDrone()` / `stopAmbientDrone()`: 432Hz harmonic pad chord `[216, 324, 432, 648]` through a 450Hz low-pass biquad filter.

#### Immediate Opportunity:
Because `audioEngine.ts` generates sound algorithmically via oscillators and biquad filters, it operates **100% offline with 0 network calls and 0 asset storage**. By adding:
1. `playSolfeggioTone(freq: 528 | 432 | 396)`
2. `playBinauralDelta(carrierFreq: 200, beatFreq: 2)` (left channel 200Hz, right channel 202Hz)
3. `startRainSoundscape()` (filtered pink/white noise buffer loop with gentle envelope modulations)
4. `startEmergencyResetVoiceOrChimes()`
...the app can provide **instant, high-fidelity sleep soundscapes and emergency SOS resets** completely offline within the PWA shell!

---

## 4. Deep Dive: Audio Catalog & Data Assets

### 4.1 Physical Audio Files in Repository
In `public/audio/`:
- `Chapter 1.mp3` through `Chapter 45.mp3` (totaling 48 MP3 files, including `Chapter 5.1`, `5.2`, `19.1`, `19.2`, `19.3`).
- All 45 chapters of the Human 2.0 Audiobook written and narrated by Vinay Kapoor are present locally and verified functional.

### 4.2 Mindfulness & Sleep Session Ontologies (`src/data/extendedMindfulnessData.ts`)
The repository contains rich structured session metadata:
1. `SLEEP_LIBRARY` (lines 220–329):
   - `sleepcast-kyoto-rain`: *Rain on Kyoto Bamboo Groves* (45 min)
   - `sleepcast-alpine-train`: *Midnight Sleeper Train Through the Swiss Alps* (50 min)
   - `sleepcast-desert-observatory`: *The Starlit Atacama Desert Observatory* (45 min)
   - `winddown-somatic-unwind`: *Deep Somatic Body Melt* (16 min)
   - `story-alexandria-library`: *The Lost Library of Alexandria* (Stephen Fry, 38 min)
   - `story-aegean-sunset`: *Sailing into the Aegean Twilight* (Eva Green, 42 min)
   - `story-hokkaido-forest`: *Walking the Ancient Hokkaido Pines* (Kenji Sato, 40 min)
2. `SOS_SESSIONS` (lines 119–195):
   - `sos-panic-reset`: *Panic & Spiral Circuit Breaker* (90 sec physiological sigh)
   - `sos-anger-halt`: *Angry Reactivity Halt* (2 min)
   - `sos-imposter-grounding`: *Imposter Syndrome Emergency Grounding* (3 min)
   - `sos-meeting-decompression`: *Post-Meeting Stress Decompression* (2 min)
   - `sos-sensory-overload`: *Sensory & Notification Overload Reset* (3 min)
3. `BREADTH_COLLECTION` (lines 334–387):
   - `soundscape-theta-waves`: *432Hz Stillness & Theta Deep Wave Resonance* (60 min)
   - `soundscape-tibetan-bowls`: *Singing Bowls of Lhasa: 7 Chakra Chimes* (45 min)
   - `breathwork-box-breathing`: *Box Breathing (4-4-4-4) for Tactical Presence* (8 min)
   - `breathwork-478-relax`: *The 4-7-8 Parasympathetic Sedation Breath* (10 min)
4. `MASTERCLASSES` (lines 392–453):
   - `masterclass-sleep-science`: *The Neurobiology of Deep Rest & Circadian Health* by Dr. Matthew Walker (65 min)
   - `masterclass-anxiety-habit`: *Unwinding Real-Life Anxiety* by Dr. Judson Brewer (72 min)
   - `masterclass-radical-acceptance`: *Radical Compassion & The RAIN Method* by Tara Brach (58 min)
   - `masterclass-human-ai-awareness`: *Staying Conscious in the Age of AI* by Vinay Kapoor (62 min)

### 4.3 Synthesizing the Curated 12–20 Sleep Catalog
We can organize these into a dedicated, cohesive catalog in `src/data/sleepCatalogData.ts` (16 total recordings):

| ID | Title | Category | Duration | Tier | Sound Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sleep-sos-reset` | **Emergency SOS: 90s Racing Mind Silencer** | Emergency SOS | 01:30 | **FREE** | AudioEngine Physiological Sigh Synth |
| `sleep-432hz-stillness` | **432Hz Solfeggio Deep Stillness Drone** | Solfeggio Soundscape | 60:00 | **FREE** | AudioEngine 432Hz Harmonic Pad |
| `sleep-kyoto-rain` | **Sleepcast: Rain on Kyoto Bamboo Groves** | Sleepcast Story | 45:00 | **FREE** | Local Audio / Rain Synth Engine |
| `sleep-somatic-melt` | **Wind-Down: Deep Somatic Body Melt** | Nighttime Guided | 16:00 | **FREE** | Ambient Voice / Drone Synth |
| `sleep-alpine-train` | Sleepcast: Midnight Sleeper Train (Swiss Alps) | Sleepcast Story | 50:00 | Sovereign | Ambient Train & Drone Synth |
| `sleep-desert-stars` | Sleepcast: Starlit Atacama Desert Observatory | Sleepcast Story | 45:00 | Sovereign | Cosmic Synth Drone |
| `sleep-alexandria` | Sleep Story: The Lost Library of Alexandria | Sleep Story | 38:00 | Sovereign | Ambient Story Engine |
| `sleep-aegean-twilight` | Sleep Story: Sailing the Aegean Twilight | Sleep Story | 42:00 | Sovereign | Sea Wave Acoustic Resonance |
| `sleep-hokkaido-pines` | Sleep Story: Ancient Hokkaido Pines | Sleep Story | 40:00 | Sovereign | Temple Bell & Forest Resonance |
| `sleep-528hz-repair` | **528Hz Solfeggio Miracle Drone (Delta Waves)** | Solfeggio Soundscape | 60:00 | Sovereign | AudioEngine 528Hz Synth |
| `sleep-delta-binaural` | **Delta Wave Sleep Entrainment (2Hz Binaural)** | Solfeggio Soundscape | 60:00 | Sovereign | AudioEngine Stereo Binaural Synth |
| `sleep-ocean-rain` | **Ocean Rain Nocturne (Pink Noise Sleep Wash)** | Soundscape | 60:00 | Sovereign | AudioEngine Pink Noise Rain Synth |
| `sleep-yoga-nidra` | Bedtime Yoga Nidra for Deep Psychic Sleep | Nighttime Guided | 25:00 | Sovereign | Guided Somatic Relaxation |
| `sleep-walker-masterclass`| Dr. Matthew Walker: Sleep Science & Circadian Health | Masterclass | 65:00 | Sovereign | Audio Masterclass Series |
| `sleep-478-breath` | The 4-7-8 Parasympathetic Sedation Breath | Wind-Down | 10:00 | Sovereign | Paced Breathing Guidance |
| `sleep-3min-worry-flush` | 3-Minute Bedside Worry Flush | Emergency SOS | 03:00 | Sovereign | Rapid Cognitive Defusion |

---

## 5. Deep Dive: User Vault & LocalStorage Handling

### 5.1 Comprehensive Audit of Existing Keys

| Key | Type / Value | Where Defined / Read | Where Modified | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `human2_dark_mode` | `'true'` \| `'false'` | `src/App.tsx:33` | `src/App.tsx:43` | Day / Night sanctuary theme |
| `human2_insights` | JSON stringified `UserInsight[]` | `src/App.tsx:59`, `VaultScreen` | `src/App.tsx:84, 127` | Reflections from Mirror/Pause |
| `human2_mams` | JSON stringified `AwarenessMoment[]` | `src/App.tsx:70`, `VaultScreen` | `src/App.tsx:92, 128` | Meaningful Awareness Moments |
| `human2_is_premium` | `'true'` \| `'false'` | `EbbCompanionScreen`, `ProfileScreen`, `SubscriptionScreen` | `SubscriptionScreen:45` | Sovereign Membership status |
| `human2_teacher_queries_today` | `string` (integer) | `EbbCompanionScreen:64` | `EbbCompanionScreen:134` | Daily free query quota tracker |
| `human2_last_chapter_id` | `string` (`'ch-1'`) | `AudioContext.tsx:39` | `AudioContext.tsx:198` | Audiobook resume point |
| `human2_last_timestamp` | `string` (float seconds) | `AudioContext.tsx:79` | `AudioContext.tsx:99, 199` | Audiobook audio scrub position |
| `human2_ai_teacher_chat_v1` | JSON stringified `ChatMessage[]` | `aiTeacherService.ts:296` | `aiTeacherService.ts:308, 316` | AI chat conversation history |
| `human2_haptics_enabled` | `'true'` \| `'false'` | `haptics.ts:9` | `haptics.ts:21` | Vibration haptics toggle |

### 5.2 Identified Storage Gaps
To fulfill R2 ("Favourites & Continue Listening: Persistent bookmarks and progress tracking saved locally in the user vault"):
1. **Favourites (`human2_favorites`):**
   - No mechanism currently exists to bookmark or favourite sleep tracks or audio chapters.
   - Proposed structure: JSON array of string IDs: `string[]`.
   - Utility functions: `isFavorite(id: string)`, `toggleFavorite(id: string)`, `getFavorites()`.
2. **Continue Listening (`human2_continue_listening`):**
   - Currently, only the single `human2_last_chapter_id` is tracked for audiobook chapters. If a user listens to a 45-minute sleepcast or soundscape, progress is lost upon exiting.
   - Proposed structure:
     ```typescript
     export interface ContinueListeningItem {
       id: string;
       title: string;
       subtitle?: string;
       category: string;
       progressSeconds: number;
       durationSeconds: number;
       progressPercent: number;
       lastPlayedTimestamp: number;
       trackType: 'sleep' | 'audiobook' | 'soundscape';
     }
     ```
   - Persisted as JSON in `localStorage.getItem('human2_continue_listening')`.
   - Rendered as a dedicated "Continue Listening" row on the Sleep Home Screen and inside `VaultScreen.tsx`.

---

## 6. Implementation Architecture Plan

### 6.1 Streamlining Default Landing View (`HomeScreen.tsx`)
Currently, `HomeScreen.tsx` (469 lines) has 8 stacked sections:
1. Top Greeting & 4 Action Pills (Theme, Audio 45, MAMs, Sovereign)
2. Eye-soothing Pause Card (30s)
3. Situational Anchor Chips ("What would help you right now?")
4. Today's Ritual Card (Quote + 2 steps)
5. Audio Chapters Card (Book preview)
6. Vinay Kapoor Profile Banner
7. Active Journey Snapshot (3-day journey)
8. Feature Grid (Mirror & Human+AI)
9. Stakeholder Preview Section (Ebb, 4-Pillar Hub, 100k Library)

#### Transformation to Sleep Supporting Mobile App:
The landing screen must immediately lower heart rate and eliminate visual chaos:
- **Serene Night/Sleep Sanctuary Theme:** Calming celestial navy palette (`#05070a` / `#0b1317` with warm stardust `#e8b98a` accents).
- **Bedtime Hero Card:**
  - One-tap "Begin Sleep Immersion" button (launches tonight's curated sleepcast or 432Hz ambient drone).
  - Prominent **Emergency SOS Night Reset** (acute 90-second racing mind silencer).
- **Quick Sleep Timers:** Presets (15m, 30m, 45m, 60m, Until Morning) with gentle fade-out.
- **Continue Listening:** Resumes last played sleep track or chapter right where the user left off.
- **Curated Sleep Catalog Carousels / Sections:**
  1. *Sleepcast Stories & Night Journeys* (Rain on Kyoto, Alpine Train, Atacama Desert)
  2. *Ambient Solfeggio Drones* (432Hz Stillness, 528Hz Miracle, Delta Wave Binaurals, Ocean Rain)
  3. *Emergency SOS Night Resets* (90s Panic Reset, 3m Bedside Worry Flush)
- **Favourites Shelf:** Fast access to starred bedtime soundscapes.
- **Zero Login Barrier:** Free tracks carry no modals or authentication gates.

### 6.2 Standalone "Listen" Section for the 45-Chapter Audiobook
- Move the entire 45-chapter Human 2.0 Audiobook experience into a top-level tab in `BottomTabBar.tsx` (`id: 'listen'`, label: `'Listen'`, icon: `Headphones` / `BookOpen`).
- When navigating to `listen`:
  - Renders `AudioChaptersScreen.tsx` with full chapter browsing, search, parts breakdown (Parts 1–5), timeline scrubber, variable playback speed, sleep timer, and seamless playback via `AudioContext`.
  - Chapters 1–3 are completely free to play without login.
  - Chapters 4–45 display a subtle gold lock icon (`Crown`). Clicking a locked chapter smoothly triggers the Sovereign unlock sheet.

### 6.3 Bottom Navigation Streamlining
Reduce `BottomTabBar.tsx` from 6 crowded tabs to 5 clear, mobile-optimized tabs:
1. **Sleep** (`home` or `sleep`): The primary Sleep Supporting sanctuary and catalog.
2. **Listen** (`listen` / `audio_chapters`): The complete 45-chapter Audiobook & Audio Library.
3. **Reset** (`pause`, Center Hero): The acute 90-second SOS racing mind silencer & 30s Sovereign Pause.
4. **Ebb** (`ebb`): The somatic AI wind-down companion & emotional weather triage.
5. **Vault** (`vault`): Personal sanctuary containing Favourites, Continue Listening progress, MAMs, and Sovereign Membership settings.

*(Touch targets will be >=48px wide and >=48px tall, conforming strictly to WCAG AA mobile touch target standards.)*

### 6.4 Unified Audio Player Context (`AudioContext.tsx`)
Refactor `AudioContext.tsx` to support **both** `AudioChapter` and `SleepTrack`:
```typescript
export interface PlayableTrack {
  id: string;
  title: string;
  subtitle?: string;
  category: 'sleepcast' | 'soundscape' | 'sos' | 'audiobook' | 'masterclass' | 'winddown';
  durationSeconds: number;
  durationFormatted: string;
  teacher?: string;
  audioUrl?: string; // e.g. /audio/Chapter 1.mp3
  isSynthTone?: boolean; // synthesized via audioEngine
  synthType?: '432hz' | '528hz' | 'delta_binaural' | 'ocean_rain' | 'sos_sigh';
  isPremium?: boolean;
}
```
- When playing an audio file (`audioUrl`): uses `<audio>` element with error fallbacks.
- When playing an ambient synth (`isSynthTone`): activates the corresponding `AudioEngine` generator.
- `MiniPlayerBar`: Displays the active track title, category, progress bar, play/pause, skip -15s, and 1-tap open.
- Sleep timer smoothly fades out both `<audio>` volume and Web Audio gain nodes.
- Automatically saves progress to `human2_continue_listening`.

### 6.5 Frictionless Free Tier & Single Sovereign Membership Simulation
- Free Tier tracks (3–5 tracks):
  - Emergency SOS 90s Reset
  - 432Hz Stillness Drone
  - Sleepcast: Rain on Kyoto Bamboo Groves
  - Bedtime Somatic Body Melt
  - Audiobook Chapters 1–3
  - Playable immediately on 1 tap with **zero login modal, zero email prompt, zero account creation**.
- Sovereign Paid Tier Simulation:
  - Locked tracks display a clean gold lock glyph.
  - Clicking a locked track presents `SubscriptionScreen.tsx` (annual $59.99/yr with 7-day trial or monthly $9.99/mo).
  - Clicking "Start 7-Day Free Trial & Unlock Sovereign":
    - Plays 528Hz Solfeggio clarity chime via `audioEngine`.
    - Triggers haptic feedback.
    - Sets `localStorage.setItem('human2_is_premium', 'true')`.
    - Instantly unlocks all 16 sleep tracks, all 45 audiobook chapters, masterclasses, and unlimited AI dialogue.
    - Provides a "Reset / Re-lock to Free Tier" toggle in `VaultScreen.tsx` or `ProfileScreen.tsx` for stakeholder testing.

---

## 7. Mobile Ergonomics & Native Wrapper Readiness Check

1. **360px Viewport Compliance:**
   - 5-tab bottom navigation with flex-1 layout guarantees >=44x44px touch targets.
   - Text inputs across search and filters are styled with `text-base sm:text-xs` (minimum 16px font-size) to prevent iOS WebKit automatic viewport zoom.
   - Container padding uses `px-3.5` or `px-4` ensuring no content overflows laterally (`overflow-x-hidden`).
2. **Safe Area Insets:**
   - Bottom tab bar incorporates `pb-[max(env(safe-area-inset-bottom),10px)]`.
   - Headers respect `pt-[max(env(safe-area-inset-top),12px)]`.
3. **Capacitor / Offline Readiness:**
   - Zero runtime SSR dependencies.
   - Procedural Web Audio API soundscapes ensure sleep audio functions even in airplane mode.

---

## 8. Summary of Proposed File Actions for Implementers

1. **`src/types/index.ts`:**
   - Define `SleepTrack`, `PlayableTrack`, `ContinueListeningItem`.
2. **`src/data/sleepCatalogData.ts` (New):**
   - Export `SLEEP_CATALOG: SleepTrack[]` with 16 curated recordings, duration, description, tier, and synth specs.
3. **`src/utils/audioEngine.ts`:**
   - Add Solfeggio 528Hz tone, Delta wave binaural beat generator, and pink noise rain generator.
4. **`src/context/AudioContext.tsx`:**
   - Expand context to play both `AudioChapter` and `SleepTrack`.
   - Implement `human2_continue_listening` and `human2_favorites` persistence.
5. **`src/components/HomeScreen.tsx`:**
   - Streamline into the Sleep Sanctuary core view (bedtime hero, SOS button, sleep timers, curated carousels, continue listening).
6. **`src/components/BottomTabBar.tsx`:**
   - Streamline into 5 tabs: `home` (Sleep), `listen` (Audiobook), `pause` (SOS Reset), `ebb` (AI Companion), `vault` (Vault & Sovereign).
7. **`src/components/MiniPlayerBar.tsx`:**
   - Link with the unified track player.
8. **`src/components/VaultScreen.tsx`:**
   - Add Favourites shelf, Continue Listening shelf, and Sovereign Membership test toggle.
