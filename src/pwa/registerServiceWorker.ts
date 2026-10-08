/**
 * Human 2.0 — Service Worker Registration Bridge
 * Provides lifecycle coordination, update detection, and reload triggering.
 */

import { useState, useEffect } from 'react';

export interface ServiceWorkerHooks {
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;
  onInstalled?: () => void;
  onError?: (error: Error) => void;
}

// Global reference to the active registration
let swRegistration: ServiceWorkerRegistration | null = null;
let updateAvailableCallback: ((reg: ServiceWorkerRegistration) => void) | null = null;

/**
 * Registers the Service Worker and sets up update listeners.
 */
export function registerServiceWorker(hooks?: ServiceWorkerHooks): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Defer registration until window load to optimize initial render and TTI
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        swRegistration = registration;

        // Check if an updated worker is already waiting in the background
        if (registration.waiting) {
          hooks?.onUpdateAvailable?.(registration);
          updateAvailableCallback?.(registration);
        }

        // Listen for new updates discovered during the session
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // An active controller exists; this installed worker is an update
                hooks?.onUpdateAvailable?.(registration);
                updateAvailableCallback?.(registration);
              } else {
                // First-time app shell precache completed
                hooks?.onInstalled?.();
              }
            }
          });
        });

        // Periodic background update check (every 60 minutes)
        const hourlyInterval = setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        // Check for updates when app returns to foreground (tab switch or mobile unlock)
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup if window unloads
        window.addEventListener('unload', () => {
          clearInterval(hourlyInterval);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        });
      })
      .catch((error) => {
        console.warn('[SW Bridge] ServiceWorker registration failed:', error);
        hooks?.onError?.(error instanceof Error ? error : new Error(String(error)));
      });

    // Handle controller change: Reload page once new worker activates
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

/**
 * Tells the waiting Service Worker to skip waiting and activate immediately.
 */
export function applyServiceWorkerUpdate(registration?: ServiceWorkerRegistration | null): void {
  const targetReg = registration || swRegistration;
  if (!targetReg || !targetReg.waiting) {
    // If no waiting worker is found, attempt fallback reload
    window.location.reload();
    return;
  }

  // Post message to waiting service worker
  targetReg.waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * React Hook for consuming Service Worker update states.
 */
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    updateAvailableCallback = (reg) => {
      setRegistration(reg);
      setUpdateAvailable(true);
    };

    // If an update was already detected prior to hook mounting
    if (swRegistration?.waiting) {
      setRegistration(swRegistration);
      setUpdateAvailable(true);
    }

    return () => {
      updateAvailableCallback = null;
    };
  }, []);

  const triggerUpdate = () => {
    applyServiceWorkerUpdate(registration);
  };

  return {
    updateAvailable,
    triggerUpdate,
    dismissUpdate: () => setUpdateAvailable(false),
  };
}
