# Technical Implementation Plan: Custom PWA Install Hook, UI Modal & App Integration Strategy

**Agent**: `teamwork_preview_explorer` (Milestone 1 Explorer 3)  
**Date**: 2026-10-08  
**Working Directory**: `C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_m1_3`  
**Target Project**: `Human 2.0` (`C:\Users\annak\.gemini\antigravity\scratch\human2`)  
**Mission**: Formulate a concrete, production-ready implementation plan for:
1. Custom PWA Install Hook `src/pwa/usePwaInstall.ts`
2. Custom Install UI Modal / Sheet `src/components/InstallPromptModal.tsx`
3. Application-level integration in `src/App.tsx` (Service Worker registration, Update Toast, Install Modal, safe-area layer stacking, zero visual obstruction)

---

## 1. Executive Summary & Architecture Overview

The Human 2.0 application is transitioning into an installable, high-performance Progressive Web App (PWA) tailored as a serene "Sleep Supporting Mobile App". While basic browser-native install prompts (like Android's mini-infobar or desktop address bar icons) are generic, unpredictable, and absent on iOS Safari, a high-converting, native-feeling mobile experience demands:

1. **A polymorphic install state engine (`usePwaInstall.ts`)**:
   - Programmatic interception and management of Chromium's `beforeinstallprompt` event.
   - Reliable multi-variant detection of iOS Safari environments where programmatic prompts are unsupported.
   - Comprehensive detection of standalone display modes (`display-mode: standalone`, `navigator.standalone`, and Android WebAPK referrers) with dynamic `matchMedia` change listening.
   - Automatic, guaranteed suppression of all install banners and modals once the application is running in standalone mode.
   - User agency preservation with persistent dismissal remembrance (`localStorage`) alongside on-demand manual trigger hooks.

2. **A branded, dual-mode install sheet (`InstallPromptModal.tsx`)**:
   - Night Sanctuary aesthetic (`#05070a` deep obsidian, `#101b22` slate canvas, `#e8b98a` champagne gold, and `#17495e` sanctuary teal).
   - Dynamic UI adapting automatically to the host OS:
     - **Android & Desktop Chromium**: Direct 1-tap "Install App" button invoking the intercepted prompt.
     - **iOS Safari**: 3-step visual instruction sheet clearly explaining "Tap Share → Add to Home Screen".
   - Full compliance with mobile accessibility and touch target constraints (minimum 44×44px hit slop) and safe-area insets (`env(safe-area-inset-bottom)`).

3. **Seamless integration in `src/App.tsx`**:
   - Zero-conflict z-index layer hierarchy preventing collisions between `<SplashScreen />`, `<AudioConstructionPlayer />`, `<MiniPlayerBar />`, `<BottomTabBar />`, `<UpdateToast />`, and `<InstallPromptModal />`.
   - Coordinated service worker lifecycle registration triggering instant update toasts upon background code pushes.
   - Persistent manual access points in `HomeScreen` and `ProfileScreen` so users who dismiss the prompt can install later.

---

## 2. Requirement Traceability Matrix

| Requirement | Source | Target Component | Architectural Solution |
| :--- | :--- | :--- | :--- |
| **`beforeinstallprompt` Interception** | `ORIGINAL_REQUEST §R1` | `src/pwa/usePwaInstall.ts` | Intercept event, call `e.preventDefault()`, store in React ref/state, expose `promptInstall()` |
| **iOS Safari Environment Detection** | `ORIGINAL_REQUEST §R1` | `src/pwa/usePwaInstall.ts` | Multi-point detection: iPad/iPhone regex + iPadOS 13+ `MacIntel` touch check + Safari user agent filter |
| **Standalone Display Mode Detection** | `ORIGINAL_REQUEST §R1` | `src/pwa/usePwaInstall.ts` | Unified check: `matchMedia('(display-mode: standalone)')` + `navigator.standalone` + WebAPK referrer + change listener |
| **Automatic Standalone Suppression** | `ORIGINAL_REQUEST §R1` | `usePwaInstall.ts` & `InstallPromptModal.tsx` | When `isInstalled === true`, `isInstallable` forced to `false`; all prompts and sheets return `null` |
| **Native-Feeling Dark Mode UI** | `ORIGINAL_REQUEST §R1` | `src/components/InstallPromptModal.tsx` | Glassmorphic `#101b22` modal with gold 2.0 brand monogram, feature benefit list, and dark styling |
| **iOS Safari 1-Tap Instruction Sheet** | `ORIGINAL_REQUEST §R1` | `src/components/InstallPromptModal.tsx` | Tactile 3-step guide: "1. Tap Share (icon) → 2. Add to Home Screen (icon) → 3. Tap Add" |
| **Direct Install Trigger (Android/Chrome)** | `ORIGINAL_REQUEST §R1` | `src/components/InstallPromptModal.tsx` | Primary action button executing `promptInstall()` and responding to user choice outcome |
| **Safe-Area Inset & Zero Obstruction** | `ORIGINAL_REQUEST §R3` | `App.tsx` & `InstallPromptModal.tsx` | `z-[70]` backdrop, `pb-[max(env(safe-area-inset-bottom),20px)]`, non-blocking stacking |
| **Update Toast & SW Registration** | `ORIGINAL_REQUEST §R1` | `src/App.tsx` & `UpdateToast.tsx` | Register SW on load, capture `registration.waiting`, mount `<UpdateToast />` at `z-[60]` with safe top offset |

---

## 3. Custom PWA Install Hook Blueprint (`src/pwa/usePwaInstall.ts`)

### 3.1 Design Principles
1. **SSR and Hydration Safety**: All window/navigator checks are guarded with `typeof window !== 'undefined'`.
2. **Dynamic Mode Tracking**: The hook registers a media query change listener so that if the user installs the app during the current session, or if display-mode transitions, state synchronizes immediately without requiring a full page refresh.
3. **Respect for User Agency**: When a user dismisses the install modal, a timestamp is saved to `localStorage` (`human2_install_prompt_dismissed_at`). Automatic prompting is suppressed for 7 days, but manual invocation (via `openInstallPrompt()`) always works.

### 3.2 Complete Code Blueprint

```typescript
import { useState, useEffect, useCallback } from 'react';

/**
 * Standard W3C BeforeInstallPromptEvent interface specification.
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PwaInstallState {
  /** True if the application can be installed (either via native prompt or iOS Safari guide) */
  isInstallable: boolean;
  /** True if the app is currently launched in standalone mode or has already been installed */
  isInstalled: boolean;
  /** True if running on iOS (iPhone, iPad, iPod) */
  isIOS: boolean;
  /** True if running specifically in mobile Safari on iOS */
  isSafari: boolean;
  /** True if running on an Android device */
  isAndroid: boolean;
  /** True if the native browser beforeinstallprompt event was captured */
  canPromptDirectly: boolean;
  /** Triggers the native browser install dialog. Returns true if user accepted, false otherwise */
  promptInstall: () => Promise<boolean>;
  /** Visibility state of the custom InstallPromptModal */
  showInstallModal: boolean;
  /** Manually set visibility of the install modal */
  setShowInstallModal: (show: boolean) => void;
  /** Open the install modal (bypasses any previous dismissals) */
  openInstallPrompt: () => void;
  /** Dismiss the install modal and record dismissal timestamp to prevent nagging */
  dismissInstallPrompt: () => void;
}

const DISMISSAL_KEY = 'human2_install_dismissed_at';
const INSTALLED_KEY = 'human2_pwa_installed';
const DISMISSAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Checks whether the application is running in standalone mode across platforms.
 */
export function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
  const isFullscreenMedia = window.matchMedia('(display-mode: fullscreen)').matches;
  const isMinimalUIMedia = window.matchMedia('(display-mode: minimal-ui)').matches;
  const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const isAndroidWebAPK = document.referrer.includes('android-app://');

  return isStandaloneMedia || isFullscreenMedia || isMinimalUIMedia || isIOSStandalone || isAndroidWebAPK;
}

/**
 * Detects iOS device family (iPhone, iPod, iPad including iPadOS 13+).
 */
export function checkIsIOS(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = window.navigator.userAgent;
  const isStandardIOS = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;

  return (isStandardIOS || isIPadOS) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

/**
 * Detects iOS Safari browser (excluding Chrome iOS, Firefox iOS, and in-app webviews).
 */
export function checkIsIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  if (!checkIsIOS()) return false;

  const ua = window.navigator.userAgent;
  const isSafari = /Safari/i.test(ua);
  const isOtherBrowser = /CriOS|FxiOS|OPiOS|mercury|EdgiOS/i.test(ua);

  return isSafari && !isOtherBrowser;
}

/**
 * Detects Android device.
 */
export function checkIsAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /android/i.test(window.navigator.userAgent);
}

/**
 * Custom React hook managing PWA installation lifecycle and prompts.
 */
export function usePwaInstall(): PwaInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsStandalone());
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  const isIOS = checkIsIOS();
  const isSafari = checkIsIOSSafari();
  const isAndroid = checkIsAndroid();

  // 1. Synchronize standalone state and listen for display-mode changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check initial standalone state or persistent installed flag
    const standalone = checkIsStandalone();
    const storedInstalled = localStorage.getItem(INSTALLED_KEY) === 'true';
    if (standalone || storedInstalled) {
      setIsInstalled(true);
    }

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setShowInstallModal(false);
        try {
          localStorage.setItem(INSTALLED_KEY, 'true');
        } catch {}
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (typeof (mediaQuery as any).addListener === 'function') {
      (mediaQuery as any).addListener(handleMediaChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (typeof (mediaQuery as any).removeListener === 'function') {
        (mediaQuery as any).removeListener(handleMediaChange);
      }
    };
  }, []);

  // 2. Intercept beforeinstallprompt on Chromium browsers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent browser default mini-infobar
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Auto-display modal only if not previously dismissed recently and not installed
      if (!checkIsStandalone()) {
        try {
          const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
          if (!dismissedAt || Date.now() - parseInt(dismissedAt, 10) > DISMISSAL_COOLDOWN_MS) {
            setShowInstallModal(true);
          }
        } catch {
          setShowInstallModal(true);
        }
      }
    };

    // 3. Listen for successful installation event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallModal(false);
      try {
        localStorage.setItem(INSTALLED_KEY, 'true');
      } catch {}
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 4. Auto-show iOS guide once if user is on iOS Safari and hasn't installed/dismissed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isInstalled || !isIOS) return;

    try {
      const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
      if (!dismissedAt || Date.now() - parseInt(dismissedAt, 10) > DISMISSAL_COOLDOWN_MS) {
        // Delay slightly (1.5s) to allow first-time screens (like splash/home) to settle
        const timer = setTimeout(() => {
          if (!checkIsStandalone()) {
            setShowInstallModal(true);
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [isInstalled, isIOS]);

  // 5. Trigger native install prompt
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setShowInstallModal(false);
        try {
          localStorage.setItem(INSTALLED_KEY, 'true');
        } catch {}
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Error invoking install prompt:', err);
      return false;
    }
  }, [deferredPrompt]);

  // 6. Manual open trigger (e.g. from ProfileScreen or header button)
  const openInstallPrompt = useCallback(() => {
    if (isInstalled) return;
    setShowInstallModal(true);
  }, [isInstalled]);

  // 7. Dismissal handler recording timestamp
  const dismissInstallPrompt = useCallback(() => {
    setShowInstallModal(false);
    try {
      localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    } catch {}
  }, []);

  // Application is installable if not running standalone AND either prompt is captured or on iOS Safari
  const canPromptDirectly = deferredPrompt !== null;
  const isInstallable = !isInstalled && (canPromptDirectly || isIOS);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    isSafari,
    isAndroid,
    canPromptDirectly,
    promptInstall,
    showInstallModal: showInstallModal && !isInstalled,
    setShowInstallModal,
    openInstallPrompt,
    dismissInstallPrompt,
  };
}
```

---

## 4. Custom Install UI Modal / Sheet Blueprint (`src/components/InstallPromptModal.tsx`)

### 4.1 Visual Design & Ergonomics
- **Z-Index Layer**: `z-[70]` to float above all bottom navigation bars, mini players, and background modals.
- **Glassmorphic Surface**: Deep dark `#101b22`/95 with `backdrop-blur-md` and warm gold border (`border-[#d9a44a]/30`), matching the Night Sanctuary palette.
- **Brand Glyph Presentation**:
  - Displays the 192x192 brand icon (`/icons/icon-192x192.png`) with an inline SVG gold monogram fallback (`#e8b98a` on `#17495e` disc with stardust halo).
- **Adaptive Content**:
  - **Chromium / Android**: Renders 1-tap "Install App" button with `<Download />` and `<Sparkles />` icons.
  - **iOS Safari**: Renders an intuitive 3-step tactile guide with `<Share />` and `<PlusSquare />` icons.
- **Mobile Safe Area**: Enforces `pb-[max(env(safe-area-inset-bottom),20px)]` to clear the iPhone home indicator.
- **Touch Targets**: All buttons meet the `>= 44×44px` requirement.

### 4.2 Complete Code Blueprint

```tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, PlusSquare, X, Sparkles, Moon, Radio, Zap } from 'lucide-react';

export interface InstallPromptModalProps {
  show: boolean;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
  isIOS: boolean;
  canPromptDirectly: boolean;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  show,
  onClose,
  onInstall,
  isIOS,
  canPromptDirectly,
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center pointer-events-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal / Bottom Sheet Card */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-md bg-[#101b22] text-[#f2ede4] border-t sm:border border-[#d9a44a]/30 rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] p-6 z-10 overflow-hidden flex flex-col pb-[max(env(safe-area-inset-bottom),20px)]"
        >
          {/* Subtle top pull handle on mobile */}
          <div className="w-10 h-1 bg-[#223541] rounded-full mx-auto mb-4 sm:hidden" />

          {/* Close button (>= 44x44px touch target) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-[#17252e] hover:bg-[#1f3542] text-[#9eb2be] hover:text-[#f2ede4] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close install prompt"
          >
            <X size={18} />
          </button>

          {/* Brand Mark & Header */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#17495e] to-[#0d222c] border border-[#d9a44a]/40 flex items-center justify-center shadow-md shrink-0 overflow-hidden">
              {/* Attempt brand icon with SVG fallback */}
              <img
                src="/icons/icon-192x192.png"
                alt="Human 2.0"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to stylized vector monogram
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-serif-title font-bold text-lg text-[#e8b98a]">
                2.0
              </span>
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#e8b98a] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#e8b98a] font-semibold">
                  Official Mobile App
                </span>
                <span className="inline-block px-1.5 py-0.2 rounded-full text-[9px] bg-[#17495e] text-[#e8b98a] font-mono">
                  PWA
                </span>
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#f2ede4] leading-tight">
                Install Human 2.0
              </h3>
              <p className="text-[11px] text-[#9eb2be] leading-tight">
                Sleep Sanctuary & Personal Awareness Platform
              </p>
            </div>
          </div>

          {/* Benefits Feature Grid */}
          <div className="bg-[#14232c] rounded-2xl p-3.5 mb-5 border border-[#1d2e38] space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-[#9eb2be]">
              <div className="w-6 h-6 rounded-lg bg-[#17495e] text-[#e8b98a] flex items-center justify-center shrink-0">
                <Moon size={13} />
              </div>
              <span className="leading-snug">
                <strong className="text-[#f2ede4]">Offline Sleep Induction:</strong> Instant 432Hz/528Hz drone soundscapes and SOS racing mind silencer.
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-[#9eb2be]">
              <div className="w-6 h-6 rounded-lg bg-[#17495e] text-[#e8b98a] flex items-center justify-center shrink-0">
                <Radio size={13} />
              </div>
              <span className="leading-snug">
                <strong className="text-[#f2ede4]">Background Audio:</strong> Lock-screen audio controls & sleep auto-fade timers.
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-[#9eb2be]">
              <div className="w-6 h-6 rounded-lg bg-[#17495e] text-[#e8b98a] flex items-center justify-center shrink-0">
                <Zap size={13} />
              </div>
              <span className="leading-snug">
                <strong className="text-[#f2ede4]">Full-Screen Immersion:</strong> True native app display without browser toolbars.
              </span>
            </div>
          </div>

          {/* Action Area: OS-Dependent */}
          {canPromptDirectly ? (
            /* Android / Chromium Direct Install */
            <div className="space-y-2.5">
              <button
                onClick={async () => {
                  const accepted = await onInstall();
                  if (accepted) onClose();
                }}
                className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-gradient-to-r from-[#17495e] to-[#1f5f78] hover:from-[#1f5f78] hover:to-[#277899] text-[#e8b98a] font-semibold text-xs shadow-md border border-[#d9a44a]/40 hover:border-[#d9a44a] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Download size={15} />
                <span>Install App to Home Screen</span>
              </button>

              <button
                onClick={onClose}
                className="w-full min-h-[44px] py-2 px-3 rounded-xl text-xs text-[#9eb2be] hover:text-[#f2ede4] transition-colors cursor-pointer flex items-center justify-center"
              >
                Maybe Later
              </button>
            </div>
          ) : isIOS ? (
            /* iOS Safari Tactile 3-Step Guide */
            <div className="space-y-3">
              <div className="bg-[#0b1317] rounded-2xl p-3.5 border border-[#1d2e38] space-y-2.5">
                <div className="text-[11px] font-semibold text-[#e8b98a] flex items-center gap-1.5 mb-1">
                  <Sparkles size={13} />
                  <span>How to install on iOS Safari:</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#9eb2be]">
                  <div className="w-6 h-6 rounded-full bg-[#17495e] text-[#e8b98a] font-bold text-[11px] flex items-center justify-center shrink-0">
                    1
                  </div>
                  <span className="leading-tight">
                    Tap the <strong className="text-[#f2ede4] inline-flex items-center gap-1">Share <Share size={12} className="text-[#3ba2c7]" /></strong> button in Safari's bottom bar.
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#9eb2be]">
                  <div className="w-6 h-6 rounded-full bg-[#17495e] text-[#e8b98a] font-bold text-[11px] flex items-center justify-center shrink-0">
                    2
                  </div>
                  <span className="leading-tight">
                    Scroll down and select <strong className="text-[#f2ede4] inline-flex items-center gap-1">Add to Home Screen <PlusSquare size={12} className="text-[#e8b98a]" /></strong>.
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#9eb2be]">
                  <div className="w-6 h-6 rounded-full bg-[#17495e] text-[#e8b98a] font-bold text-[11px] flex items-center justify-center shrink-0">
                    3
                  </div>
                  <span className="leading-tight">
                    Tap <strong className="text-[#e8b98a]">Add</strong> in the top-right corner.
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-[#17495e] hover:bg-[#1f5f78] text-[#e8b98a] font-semibold text-xs shadow-md border border-[#d9a44a]/30 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center"
              >
                Got It, Thank You
              </button>
            </div>
          ) : (
            /* Desktop / Generic Browser Fallback */
            <div className="space-y-2.5">
              <p className="text-xs text-[#9eb2be] text-center leading-relaxed">
                To install, click the install icon in your browser's address bar or menu.
              </p>
              <button
                onClick={onClose}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#17495e] text-[#e8b98a] font-semibold text-xs cursor-pointer flex items-center justify-center"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
```

---

## 5. Application Integration Blueprint (`src/App.tsx`)

### 5.1 Layer Stacking & Visual Hierarchy (Zero Visual Obstruction)

To guarantee that notifications, modals, and navigation controls never visually collide or obscure each other, the z-index hierarchy must be structured as follows:

```
┌──────────────────────────────────────────────────────────────┐
│ Layer 7: z-[70]  <InstallPromptModal />                      │ (Full modal/sheet overlay)
├──────────────────────────────────────────────────────────────┤
│ Layer 6: z-[60]  <UpdateToast />                             │ (Top floating toast: safe-area top)
├──────────────────────────────────────────────────────────────┤
│ Layer 5: z-50    <AudioConstructionPlayer /> / Modals        │ (Fullscreen screen takeovers)
├──────────────────────────────────────────────────────────────┤
│ Layer 4: z-40    <BottomTabBar />                            │ (Bottom 5-tab bar: pb-safe)
├──────────────────────────────────────────────────────────────┤
│ Layer 3: z-30    <MiniPlayerBar />                           │ (Above tab bar: bottom-[calc(pb+56px)])
├──────────────────────────────────────────────────────────────┤
│ Layer 2: z-10    Active Screen Content (<HomeScreen />, etc.)│ (Main view viewport)
├──────────────────────────────────────────────────────────────┤
│ Layer 1: z-0     <PhoneFrame />                              │ (Bezel simulator / mobile container)
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Service Worker Registration & Update Coordination
In `src/App.tsx`:
1. Call `registerServiceWorker({ onUpdateAvailable: (reg) => setSwRegistration(reg) })` inside a top-level `useEffect`.
2. Keep state `swRegistration: ServiceWorkerRegistration | null`.
3. Pass `show={Boolean(swRegistration)}` and `onRefresh={() => swRegistration && applyServiceWorkerUpdate(swRegistration)}` to `<UpdateToast />`.

### 5.3 Concrete `src/App.tsx` Integration Blueprint

```tsx
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Screen, UserInsight, AwarenessMoment, MirrorSession, ConstructionAudioSession } from './types';
import { INITIAL_USER_INSIGHTS } from './data/bookContent';
import { AudioProvider } from './context/AudioContext';
import { PhoneFrame } from './components/PhoneFrame';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { PauseScreen } from './components/PauseScreen';
import { MirrorScreen } from './components/MirrorScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { JourneyScreen } from './components/JourneyScreen';
import { HumanAiScreen } from './components/HumanAiScreen';
import { VaultScreen } from './components/VaultScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AudioChaptersScreen } from './components/AudioChaptersScreen';
import { EbbCompanionScreen } from './components/EbbCompanionScreen';
import { UnguidedTimerScreen } from './components/UnguidedTimerScreen';
import { LiveCommunityScreen } from './components/LiveCommunityScreen';
import { ExploreLibraryScreen } from './components/ExploreLibraryScreen';
import { SubscriptionScreen } from './components/SubscriptionScreen';
import { AudioConstructionPlayer } from './components/AudioConstructionPlayer';
import { MiniPlayerBar } from './components/MiniPlayerBar';
import { BottomTabBar } from './components/BottomTabBar';

// PWA Engine & Notification Imports
import { registerServiceWorker, applyServiceWorkerUpdate } from './pwa/registerServiceWorker';
import { usePwaInstall } from './pwa/usePwaInstall';
import { UpdateToast } from './components/UpdateToast';
import { InstallPromptModal } from './components/InstallPromptModal';

export function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [activeConstructionSession, setActiveConstructionSession] = useState<ConstructionAudioSession | null>(null);

  // Service Worker Update State
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Custom PWA Install Engine Hook
  const {
    isInstallable,
    isInstalled,
    isIOS,
    canPromptDirectly,
    promptInstall,
    showInstallModal,
    openInstallPrompt,
    dismissInstallPrompt,
  } = usePwaInstall();

  // Initialize Service Worker Registration
  useEffect(() => {
    registerServiceWorker({
      onUpdateAvailable: (registration) => {
        setSwRegistration(registration);
      },
    });
  }, []);

  // Theme State — defaults to Warm Daylight Light Mode (false)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('human2_dark_mode');
      if (saved !== null) return saved === 'true';
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('human2_dark_mode', isDark ? 'true' : 'false');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, [isDark]);

  const handleToggleDark = () => setIsDark((prev) => !prev);

  // Insights & MAMs State
  const [insights, setInsights] = useState<UserInsight[]>(() => {
    try {
      const saved = localStorage.getItem('human2_insights');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_USER_INSIGHTS;
  });

  const [awarenessMoments, setAwarenessMoments] = useState<AwarenessMoment[]>(() => {
    try {
      const saved = localStorage.getItem('human2_mams');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'mam-1', timestamp: 'Yesterday', type: 'pause', title: 'The Sovereign Pause' },
      { id: 'mam-2', timestamp: '2 days ago', type: 'mirror_clarity', title: 'Mirror: Work Feedback' },
      { id: 'mam-3', timestamp: '3 days ago', type: 'experiment_committed', title: 'Journey 1: Notice Assumptions' },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('human2_insights', JSON.stringify(insights));
    } catch {}
  }, [insights]);

  useEffect(() => {
    try {
      localStorage.setItem('human2_mams', JSON.stringify(awarenessMoments));
    } catch {}
  }, [awarenessMoments]);

  const handleRecordMAM = (title: string) => {
    const newMAM: AwarenessMoment = {
      id: Date.now().toString(),
      timestamp: 'Just now',
      type: 'pause',
      title,
    };
    setAwarenessMoments((prev) => [newMAM, ...prev]);
  };

  const handleSaveInsight = (text: string, tag: string) => {
    const newInsight: UserInsight = {
      id: Date.now().toString(),
      timestamp: 'Just now',
      source: 'mirror',
      text,
      tag,
    };
    setInsights((prev) => [newInsight, ...prev]);
  };

  const handleSaveMirrorSession = (session: MirrorSession) => {
    const text = `Trigger: "${session.trigger}" -> Core Need: "${session.coreNeed}" -> Sovereign Choice: "${session.choice}"`;
    handleSaveInsight(text, 'Mirror Clarity');
  };

  const handleClearAll = () => {
    setInsights([]);
    setAwarenessMoments([]);
    localStorage.removeItem('human2_insights');
    localStorage.removeItem('human2_mams');
  };

  return (
    <PhoneFrame activeScreen={currentScreen} isDark={isDark} onToggleDark={handleToggleDark}>
      <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col bg-[#f7f3ec] dark:bg-[#0b1317] text-[#1f2a28] dark:text-[#f2ede4] transition-colors">
        
        {/* Layer 6: Instant OTA Update Toast (Safe Area Top offset) */}
        <UpdateToast
          show={Boolean(swRegistration)}
          onRefresh={() => {
            if (swRegistration) {
              applyServiceWorkerUpdate(swRegistration);
            }
          }}
        />

        {/* Layer 7: Custom Install Prompt Modal / Sheet */}
        <InstallPromptModal
          show={showInstallModal}
          onClose={dismissInstallPrompt}
          onInstall={promptInstall}
          isIOS={isIOS}
          canPromptDirectly={canPromptDirectly}
        />

        {/* Layer 5: Full-Screen Audio Under Construction Player Modal */}
        <AnimatePresence>
          {activeConstructionSession && (
            <motion.div
              key="construction-player"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="absolute inset-0 z-50 flex flex-col bg-[#f7f3ec] dark:bg-[#0b1317]"
            >
              <AudioConstructionPlayer
                session={activeConstructionSession}
                onBack={() => setActiveConstructionSession(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Screen Routing */}
        <AnimatePresence mode="wait">
          {currentScreen === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="absolute inset-0 z-50"
            >
              <SplashScreen onComplete={() => setCurrentScreen('home')} />
            </motion.div>
          )}

          {currentScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <HomeScreen
                onNavigate={(screen) => setCurrentScreen(screen)}
                mamsCount={awarenessMoments.length}
                isDark={isDark}
                onToggleDark={handleToggleDark}
                onOpenConstructionSession={(s) => setActiveConstructionSession(s)}
                /* Install hook bridge */
                canInstall={isInstallable && !isInstalled}
                onOpenInstallPrompt={openInstallPrompt}
              />
            </motion.div>
          )}

          {currentScreen === 'pause' && (
            <motion.div
              key="pause"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <PauseScreen
                onBack={() => setCurrentScreen('home')}
                onSaveInsight={handleSaveInsight}
                onRecordMAM={handleRecordMAM}
              />
            </motion.div>
          )}

          {currentScreen === 'mirror' && (
            <motion.div
              key="mirror"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <MirrorScreen
                onBack={() => setCurrentScreen('home')}
                onSaveSession={handleSaveMirrorSession}
                onRecordMAM={handleRecordMAM}
              />
            </motion.div>
          )}

          {currentScreen === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <PracticeScreen
                onBack={() => setCurrentScreen('home')}
                onRecordMAM={handleRecordMAM}
                onSaveInsight={handleSaveInsight}
              />
            </motion.div>
          )}

          {currentScreen === 'journey' && (
            <motion.div
              key="journey"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <JourneyScreen
                onBack={() => setCurrentScreen('home')}
                onRecordMAM={handleRecordMAM}
                onSaveInsight={handleSaveInsight}
              />
            </motion.div>
          )}

          {currentScreen === 'human_ai' && (
            <motion.div
              key="human_ai"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <HumanAiScreen
                onBack={() => setCurrentScreen('home')}
                onSaveInsight={handleSaveInsight}
                onRecordMAM={handleRecordMAM}
              />
            </motion.div>
          )}

          {currentScreen === 'vault' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <VaultScreen
                onBack={() => setCurrentScreen('home')}
                insights={insights}
                awarenessMoments={awarenessMoments}
                onClearAll={handleClearAll}
              />
            </motion.div>
          )}

          {currentScreen === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <ProfileScreen
                onBack={() => setCurrentScreen('home')}
                onNavigate={(screen) => setCurrentScreen(screen)}
                isDark={isDark}
                onToggleDark={handleToggleDark}
                /* Install hook bridge */
                canInstall={isInstallable && !isInstalled}
                onOpenInstallPrompt={openInstallPrompt}
              />
            </motion.div>
          )}

          {currentScreen === 'audio_chapters' && (
            <motion.div
              key="audio_chapters"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <AudioChaptersScreen
                onBack={() => setCurrentScreen('home')}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            </motion.div>
          )}

          {currentScreen === 'ebb' && (
            <motion.div
              key="ebb"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <EbbCompanionScreen
                onBack={() => setCurrentScreen('home')}
                onOpenSession={(s) => setActiveConstructionSession(s)}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            </motion.div>
          )}

          {currentScreen === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <UnguidedTimerScreen
                onBack={() => setCurrentScreen('home')}
                onRecordMAM={handleRecordMAM}
              />
            </motion.div>
          )}

          {currentScreen === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <LiveCommunityScreen onBack={() => setCurrentScreen('home')} />
            </motion.div>
          )}

          {currentScreen === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <ExploreLibraryScreen
                onBack={() => setCurrentScreen('home')}
                onOpenSession={(s) => setActiveConstructionSession(s)}
                onNavigate={(scr) => setCurrentScreen(scr)}
              />
            </motion.div>
          )}

          {currentScreen === 'subscription' && (
            <motion.div
              key="subscription"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              <SubscriptionScreen
                onBack={() => setCurrentScreen('home')}
                onSuccess={() => setCurrentScreen('home')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layer 3: Persistent Floating Mini-Player Bar */}
        {!activeConstructionSession &&
          currentScreen !== 'splash' &&
          currentScreen !== 'audio_chapters' &&
          currentScreen !== 'pause' &&
          currentScreen !== 'timer' && (
            <MiniPlayerBar onOpenFullPlayer={() => setCurrentScreen('audio_chapters')} />
          )}

        {/* Layer 4: Global Bottom Tab Bar */}
        {!activeConstructionSession &&
          currentScreen !== 'splash' &&
          currentScreen !== 'pause' && (
            <BottomTabBar
              currentScreen={currentScreen}
              onNavigate={(screen) => setCurrentScreen(screen)}
            />
          )}
      </div>
    </PhoneFrame>
  );
}

export function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}

export default App;
```

---

## 6. Access Points & Manual Triggers

When users dismiss the automatic prompt, they must still have intuitive ways to install the app when desired:

### 6.1 `HomeScreen.tsx` Top Bar Pill
In `HomeScreen.tsx`, if `canInstall === true`, render a subtle, elegant install pill alongside the existing top action pills (`Audio (45)`, `MAMs`, `Sovereign`):
```tsx
{canInstall && onOpenInstallPrompt && (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onOpenInstallPrompt}
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-[#17495e]/80 to-[#1f5f78]/80 text-[#e8b98a] border border-[#d9a44a]/40 shadow-xs text-xs font-semibold hover:border-[#d9a44a] transition-all cursor-pointer"
    title="Install Human 2.0 to Home Screen"
  >
    <Download size={13} className="text-[#e8b98a]" />
    <span>Install</span>
  </motion.button>
)}
```

### 6.2 `ProfileScreen.tsx` Installation & Offline Card
In `ProfileScreen.tsx`, render an "App Installation & Offline Mode" card:
```tsx
{canInstall && onOpenInstallPrompt && (
  <div className="bg-white dark:bg-[#14232c] p-4 rounded-3xl border border-[#e6dccb] dark:border-[#1d2e38] shadow-xs">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-[#17495e] text-[#e8b98a] flex items-center justify-center">
          <Download size={15} />
        </div>
        <div>
          <h4 className="text-xs font-serif-title font-bold text-[#17495e] dark:text-[#f1ede6]">
            Install Human 2.0
          </h4>
          <p className="text-[10px] text-[#5a6663] dark:text-[#98abb6]">
            Add to your home screen for full-screen offline access
          </p>
        </div>
      </div>
    </div>
    <button
      onClick={onOpenInstallPrompt}
      className="w-full py-2.5 px-3 rounded-2xl bg-[#17495e] hover:bg-[#1f5f78] text-[#e8b98a] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
    >
      <Download size={13} />
      <span>Install App</span>
    </button>
  </div>
)}
```

---

## 7. Platform Idiosyncrasies & Edge Case Hardening

| Edge Case / Platform Idiosyncrasy | Risk / Failure Mode | Mitigating Architecture |
| :--- | :--- | :--- |
| **Chromium User Gesture Requirement** | Calling `prompt()` outside a user tap event throws `DOMException: The play() request was interrupted` or prompt fails | `promptInstall()` is strictly bound to explicit user `onClick` on the modal CTA button. |
| **iOS Safari Missing `beforeinstallprompt`** | Hook returns `isInstallable: false` on iPhone, locking user out of PWA features | `checkIsIOS()` detects WebKit/iOS and activates the 3-step manual guide sheet instead. |
| **iPadOS 13+ User Agent Spoofing** | iPads report `MacIntel` rather than `iPad`, misidentifying as desktop Safari | Check `navigator.maxTouchPoints > 1 && navigator.platform === 'MacIntel'` to properly classify modern iPads as iOS. |
| **Android WebAPK Launch via Referrer** | WebAPK launch does not always set `display-mode: standalone` immediately during first frame | Check `document.referrer.includes('android-app://')` to instantly suppress prompts. |
| **Repetitive Modal Nagging** | Prompt opens every page navigation or refresh, annoying the user | Store `human2_install_dismissed_at` in `localStorage`; enforce 7-day cooldown on auto-popups while leaving manual triggers active. |
| **Safe-Area Notch / Dynamic Island Collision** | Toast or modal overlaps hardware cutout | Enforce `pt-[max(env(safe-area-inset-top),16px)]` on UpdateToast and `pb-[max(env(safe-area-inset-bottom),20px)]` on modal. |
| **Double Service Worker Controllers** | Multiple tabs reloading simultaneously on SW update | Guard reload in `controllerchange` with `let refreshing = false` flag. |

---

## 8. Verification & Test Plan

1. **Standalone Mode Emulation**:
   - In Chrome DevTools > Rendering > Emulate CSS media feature `display-mode: standalone`.
   - Verify `usePwaInstall().isInstalled` returns `true`.
   - Verify `usePwaInstall().isInstallable` returns `false`.
   - Verify `showInstallModal` evaluates to `false` and modal never renders.

2. **Android / Chromium Prompt Flow**:
   - Dispatch synthetic `beforeinstallprompt` event in DevTools Console:
     ```javascript
     window.dispatchEvent(new Event('beforeinstallprompt'));
     ```
   - Verify modal pops up with "Install App to Home Screen" CTA button.
   - Click "Install App to Home Screen" -> verify `prompt()` is invoked.
   - Dispatch `window.dispatchEvent(new Event('appinstalled'))` -> verify modal closes and `isInstalled` is set to `true`.

3. **iOS Safari Instruction Sheet**:
   - Emulate iPhone user agent in Chrome DevTools Device Mode (`iPhone 14 Pro`).
   - Open app in browser tab mode (non-standalone).
   - Verify modal renders the 3-step instruction card ("Tap Share → Add to Home Screen → Tap Add").
   - Click "Got It" -> verify modal dismisses and cooldown timestamp is written to `localStorage`.

4. **Layer Stacking & Safe-Area Verification**:
   - Set viewport to `390×844` with simulated `safe-area-inset-bottom: 34px` and `safe-area-inset-top: 59px`.
   - Mount `<UpdateToast />` and verify it clears top hardware cutout.
   - Mount `<InstallPromptModal />` and verify bottom action buttons clear the home indicator bar by >= 20px.
   - Verify all button touch targets measure >= 44×44px.

5. **Static Build Verification**:
   - Run `cmd /c "npm run build"`.
   - Ensure clean exit code 0 and valid output in `dist/`.

---
*Report formulated by Milestone 1 Explorer 3. Handoff report available at `handoff.md`.*
