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
    let storedInstalled = false;
    try {
      storedInstalled = localStorage.getItem(INSTALLED_KEY) === 'true';
    } catch {}

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
    } else if (typeof (mediaQuery as { addListener?: (cb: (e: MediaQueryListEvent) => void) => void }).addListener === 'function') {
      (mediaQuery as { addListener: (cb: (e: MediaQueryListEvent) => void) => void }).addListener(handleMediaChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (typeof (mediaQuery as { removeListener?: (cb: (e: MediaQueryListEvent) => void) => void }).removeListener === 'function') {
        (mediaQuery as { removeListener: (cb: (e: MediaQueryListEvent) => void) => void }).removeListener(handleMediaChange);
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
