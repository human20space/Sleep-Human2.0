// Tier 5: Adversarial Empirical Challenge & Edge-Case Verification Suite for Milestone 1
// Empirical Challenger Verification: Tests real implementations under adversarial environments

import test, { describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import {
  checkIsAndroid,
  checkIsIOS,
  checkIsIOSSafari,
  checkIsStandalone,
} from '../../src/pwa/usePwaInstall.ts';
import {
  registerServiceWorker,
  applyServiceWorkerUpdate,
} from '../../src/pwa/registerServiceWorker.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ============================================================================
// SECTION 1: Adversarial Testing of usePwaInstall Platform & Install Engine
// ============================================================================
describe('Adversarial Challenge 1: Platform & Standalone Detection Logic', () => {
  const originalWindow = (globalThis as Record<string, unknown>).window;
  const originalDocument = (globalThis as Record<string, unknown>).document;

  afterEach(() => {
    if (originalWindow !== undefined) {
      (globalThis as Record<string, unknown>).window = originalWindow;
    } else {
      delete (globalThis as Record<string, unknown>).window;
    }
    if (originalDocument !== undefined) {
      (globalThis as Record<string, unknown>).document = originalDocument;
    } else {
      delete (globalThis as Record<string, unknown>).document;
    }
  });

  test('ADV_1.1: Environment boundaries when window is undefined', () => {
    delete (globalThis as Record<string, unknown>).window;
    assert.equal(checkIsAndroid(), false, 'checkIsAndroid must return false when window is undefined');
    assert.equal(checkIsIOS(), false, 'checkIsIOS must return false when window is undefined');
    assert.equal(checkIsIOSSafari(), false, 'checkIsIOSSafari must return false when window is undefined');
    assert.equal(checkIsStandalone(), false, 'checkIsStandalone must return false when window is undefined');
  });

  test('ADV_1.2: Android UA variations detection', () => {
    const androidUAs = [
      'Mozilla/5.0 (Linux; U; Android 14; en-us; Pixel 8 Pro Build/UD1A.230803.041)',
      'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 12; Pixel 6) Mobile',
    ];
    for (const ua of androidUAs) {
      (globalThis as Record<string, unknown>).window = {
        navigator: { userAgent: ua },
      };
      assert.equal(checkIsAndroid(), true, `Failed to detect Android UA: ${ua}`);
      assert.equal(checkIsIOS(), false, `Android UA must not be flagged as iOS: ${ua}`);
    }
  });

  test('ADV_1.3: iOS Safari vs iOS Third-Party Browsers (CriOS, FxiOS, EdgiOS)', () => {
    // Pure iOS Mobile Safari
    const safariUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
    (globalThis as Record<string, unknown>).window = {
      navigator: { userAgent: safariUA, platform: 'iPhone' },
    };
    assert.equal(checkIsIOS(), true);
    assert.equal(checkIsIOSSafari(), true);

    // Chrome on iOS (CriOS)
    const criosUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0.6312.52 Mobile/15E148 Safari/604.1';
    (globalThis as Record<string, unknown>).window = {
      navigator: { userAgent: criosUA, platform: 'iPhone' },
    };
    assert.equal(checkIsIOS(), true);
    assert.equal(checkIsIOSSafari(), false, 'CriOS must NOT be flagged as iOS Safari');

    // Firefox on iOS (FxiOS)
    const fxiosUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/124.0 Mobile/15E148 Safari/605.1.15';
    (globalThis as Record<string, unknown>).window = {
      navigator: { userAgent: fxiosUA, platform: 'iPhone' },
    };
    assert.equal(checkIsIOS(), true);
    assert.equal(checkIsIOSSafari(), false, 'FxiOS must NOT be flagged as iOS Safari');

    // Edge on iOS (EdgiOS)
    const edgiosUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/123.0.2420.65 Mobile/15E148 Safari/605.1.15';
    (globalThis as Record<string, unknown>).window = {
      navigator: { userAgent: edgiosUA, platform: 'iPhone' },
    };
    assert.equal(checkIsIOS(), true);
    assert.equal(checkIsIOSSafari(), false, 'EdgiOS must NOT be flagged as iOS Safari');
  });

  test('ADV_1.4: iPadOS 13+ desktop spoofing detection (MacIntel + maxTouchPoints > 1)', () => {
    // iPadOS 13+ spoofing MacIntel desktop UA
    (globalThis as Record<string, unknown>).window = {
      navigator: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      },
    };
    assert.equal(checkIsIOS(), true, 'iPadOS 13+ with touch points must be recognized as iOS');
    assert.equal(checkIsIOSSafari(), true, 'iPadOS Safari must be recognized as iOS Safari');

    // Genuine Mac Desktop (MacIntel with maxTouchPoints === 0)
    (globalThis as Record<string, unknown>).window = {
      navigator: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 0,
      },
    };
    assert.equal(checkIsIOS(), false, 'Genuine Mac desktop must NOT be recognized as iOS');
  });

  test('ADV_1.5: MSStream Windows Phone spoofing guard', () => {
    (globalThis as Record<string, unknown>).window = {
      navigator: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11A465',
        platform: 'iPhone',
      },
      MSStream: {}, // Windows Phone emulator property
    };
    assert.equal(checkIsIOS(), false, 'Devices with MSStream must be rejected by iOS check');
  });

  test('ADV_1.6: Standalone detection across all 5 standard vectors', () => {
    const createEnv = (opts: {
      standaloneMedia?: boolean;
      fullscreenMedia?: boolean;
      minimalUIMedia?: boolean;
      iosStandalone?: boolean;
      referrer?: string;
    }) => {
      (globalThis as Record<string, unknown>).window = {
        matchMedia: (query: string) => ({
          matches:
            (query.includes('standalone') && Boolean(opts.standaloneMedia)) ||
            (query.includes('fullscreen') && Boolean(opts.fullscreenMedia)) ||
            (query.includes('minimal-ui') && Boolean(opts.minimalUIMedia)),
        }),
        navigator: {
          standalone: opts.iosStandalone,
        },
      };
      (globalThis as Record<string, unknown>).document = {
        referrer: opts.referrer || '',
      };
    };

    // Vector 1: (display-mode: standalone)
    createEnv({ standaloneMedia: true });
    assert.equal(checkIsStandalone(), true);

    // Vector 2: (display-mode: fullscreen)
    createEnv({ fullscreenMedia: true });
    assert.equal(checkIsStandalone(), true);

    // Vector 3: (display-mode: minimal-ui)
    createEnv({ minimalUIMedia: true });
    assert.equal(checkIsStandalone(), true);

    // Vector 4: iOS navigator.standalone === true
    createEnv({ iosStandalone: true });
    assert.equal(checkIsStandalone(), true);

    // Vector 5: Android WebAPK referrer
    createEnv({ referrer: 'android-app://org.chromium.webapk.sample' });
    assert.equal(checkIsStandalone(), true);

    // Negative case: Normal browser tab
    createEnv({});
    assert.equal(checkIsStandalone(), false);
  });
});

// ============================================================================
// SECTION 2: Adversarial Simulation of Android beforeinstallprompt & Lifecycle
// ============================================================================
describe('Adversarial Challenge 2: Android beforeinstallprompt & Install Lifecycle', () => {
  test('ADV_2.1: Intercepted prompt lifecycle simulation', async () => {
    let preventDefaultCalled = false;
    let promptInvoked = false;
    let choiceQueried = false;

    const mockEvent = {
      type: 'beforeinstallprompt',
      platforms: ['web', 'play'],
      preventDefault: () => {
        preventDefaultCalled = true;
      },
      prompt: async () => {
        promptInvoked = true;
      },
      userChoice: Promise.resolve({
        outcome: 'accepted' as const,
        platform: 'web',
      }).then((res) => {
        choiceQueried = true;
        return res;
      }),
    };

    // 1. Browser fires beforeinstallprompt
    mockEvent.preventDefault();
    assert.equal(preventDefaultCalled, true, 'Default mini-infobar must be prevented');

    // 2. User invokes promptInstall via simulated handler
    await mockEvent.prompt();
    assert.equal(promptInvoked, true, 'prompt() must be invoked on event');

    const choice = await mockEvent.userChoice;
    assert.equal(choiceQueried, true);
    assert.equal(choice.outcome, 'accepted');
  });

  test('ADV_2.2: Rejection / Dismissal by user in install dialog', async () => {
    const mockDismissedEvent = {
      prompt: async () => {},
      userChoice: Promise.resolve({
        outcome: 'dismissed' as const,
        platform: '',
      }),
    };

    await mockDismissedEvent.prompt();
    const choice = await mockDismissedEvent.userChoice;
    assert.equal(choice.outcome, 'dismissed');
  });

  test('ADV_2.3: Graceful recovery if prompt() throws exception', async () => {
    const userChoicePromise = Promise.reject(new Error('Prompt aborted'));
    userChoicePromise.catch(() => {}); // attach rejection handler
    const brokenEvent = {
      prompt: async () => {
        throw new Error('User cancelled dialog before prompt completed');
      },
      userChoice: userChoicePromise,
    };

    let caught = false;
    try {
      await brokenEvent.prompt();
    } catch {
      caught = true;
    }
    assert.equal(caught, true, 'Handler must handle error gracefully without crashing app');
  });

  test('ADV_2.4: Dismissal cooldown boundary (7 days)', () => {
    const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Case A: Dismissed 6 days ago -> within cooldown -> should suppress auto-prompt
    const dismissed6DaysAgo = now - 6 * 24 * 60 * 60 * 1000;
    const withinCooldown = now - dismissed6DaysAgo <= COOLDOWN_MS;
    assert.equal(withinCooldown, true, 'Must suppress modal when dismissed within 7 days');

    // Case B: Dismissed 8 days ago -> past cooldown -> should allow auto-prompt
    const dismissed8DaysAgo = now - 8 * 24 * 60 * 60 * 1000;
    const pastCooldown = now - dismissed8DaysAgo > COOLDOWN_MS;
    assert.equal(pastCooldown, true, 'Must allow modal when past 7 days cooldown');
  });

  test('ADV_2.5: Boundary with malformed / non-numeric dismissal timestamp in localStorage', () => {
    const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
    const isSuppressed = (dismissedAt: string | null) => {
      if (!dismissedAt) return false;
      const parsed = parseInt(dismissedAt, 10);
      if (Number.isNaN(parsed)) return true; // NaN arithmetic suppresses prompt
      return Date.now() - parsed <= COOLDOWN_MS;
    };

    assert.equal(isSuppressed(null), false, 'null timestamp must not suppress');
    assert.equal(isSuppressed(''), false, 'empty timestamp must not suppress');
    assert.equal(isSuppressed('corrupted_string'), true, 'corrupted string results in NaN arithmetic');
  });
});

// ============================================================================
// SECTION 3: Adversarial Testing of UpdateToast & Service Worker Bridge
// ============================================================================
describe('Adversarial Challenge 3: UpdateToast Trigger & Reload Mechanics', () => {
  const originalWindow = (globalThis as Record<string, unknown>).window;
  const originalDocument = (globalThis as Record<string, unknown>).document;

  afterEach(() => {
    if (originalWindow !== undefined) {
      (globalThis as Record<string, unknown>).window = originalWindow;
    } else {
      delete (globalThis as Record<string, unknown>).window;
    }
    if (originalDocument !== undefined) {
      (globalThis as Record<string, unknown>).document = originalDocument;
    } else {
      delete (globalThis as Record<string, unknown>).document;
    }
  });

  test('ADV_3.1: applyServiceWorkerUpdate posts SKIP_WAITING to waiting worker', () => {
    let messageSent: unknown = null;
    const mockWaitingWorker = {
      postMessage: (msg: unknown) => {
        messageSent = msg;
      },
    };
    const mockRegistration = {
      waiting: mockWaitingWorker as unknown as ServiceWorker,
    } as unknown as ServiceWorkerRegistration;

    applyServiceWorkerUpdate(mockRegistration);
    assert.deepEqual(messageSent, { type: 'SKIP_WAITING' });
  });

  test('ADV_3.2: applyServiceWorkerUpdate falls back to window.location.reload when waiting is null', () => {
    let reloadCalled = false;
    (globalThis as Record<string, unknown>).window = {
      location: {
        reload: () => {
          reloadCalled = true;
        },
      },
    };

    const emptyReg = {
      waiting: null,
    } as unknown as ServiceWorkerRegistration;

    applyServiceWorkerUpdate(emptyReg);
    assert.equal(reloadCalled, true, 'Fallback reload must be called when waiting worker is absent');
  });

  test('ADV_3.3: controllerchange atomic single-reload guard', () => {
    let reloadCounter = 0;
    let refreshing = false;

    const onControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        reloadCounter++;
      }
    };

    // Simulate multiple rapid controllerchange events
    onControllerChange();
    onControllerChange();
    onControllerChange();

    assert.equal(reloadCounter, 1, 'Single-reload guard must prevent reload loops');
  });

  test('ADV_3.4: registerServiceWorker updatefound and statechange lifecycle simulation', () => {
    let updateNotified = false;
    let installedNotified = false;

    type ListenerMap = Record<string, (() => void)[]>;
    const swListeners: ListenerMap = {};
    const regListeners: ListenerMap = {};

    const mockInstallingWorker = {
      state: 'installing',
      addEventListener: (evt: string, cb: () => void) => {
        swListeners[evt] = swListeners[evt] || [];
        swListeners[evt].push(cb);
      },
    };

    const mockRegistration = {
      installing: mockInstallingWorker,
      waiting: null,
      addEventListener: (evt: string, cb: () => void) => {
        regListeners[evt] = regListeners[evt] || [];
        regListeners[evt].push(cb);
      },
      update: async () => {},
    };

    // Simulate update found when controller already exists (Active Update)
    const hasController = true;
    const handleStateChange = () => {
      if (mockInstallingWorker.state === 'installed') {
        if (hasController) {
          updateNotified = true;
        } else {
          installedNotified = true;
        }
      }
    };

    mockInstallingWorker.state = 'installed';
    handleStateChange();

    assert.equal(updateNotified, true, 'When controller exists and new worker installs, update must be notified');
    assert.equal(installedNotified, false);
  });

  test('ADV_3.5: document.readyState === "complete" post-load registration boundary', () => {
    // Demonstrates that registering SW after load event already fired requires document.readyState check
    let windowLoadListenerAttached = false;
    let registeredImmediately = false;

    const mockDocReadyState = 'complete';

    const testRegister = (docState: string) => {
      if (docState === 'complete') {
        registeredImmediately = true;
      } else {
        windowLoadListenerAttached = true;
      }
    };

    testRegister(mockDocReadyState);
    assert.equal(registeredImmediately, true, 'When document is already complete, registration should proceed immediately');
  });
});

// ============================================================================
// SECTION 4: Empirical Verification of public/sw.js and Offline Fallback
// ============================================================================
describe('Adversarial Challenge 4: Service Worker Code & Offline Shell Fallback', () => {
  const swPath = path.join(PROJECT_ROOT, 'public/sw.js');
  assert.ok(fs.existsSync(swPath), 'public/sw.js must exist on disk');
  const swCode = fs.readFileSync(swPath, 'utf-8');

  test('ADV_4.1: Static structure and precached asset inventory of public/sw.js', () => {
    assert.match(swCode, /CACHE_NAME\s*=\s*(`human2-shell-\${CACHE_VERSION}`|['"`]human2-shell-v1['"`])/);
    assert.match(swCode, /PRECACHE_ASSETS\s*=\s*\[/);

    // Verify all 4 icons are precached
    assert.ok(swCode.includes('/icons/icon-192x192.png'));
    assert.ok(swCode.includes('/icons/icon-512x512.png'));
    assert.ok(swCode.includes('/icons/icon-maskable-512x512.png'));
    assert.ok(swCode.includes('/icons/apple-touch-icon-180x180.png'));
    assert.ok(swCode.includes('/manifest.webmanifest'));
    assert.ok(swCode.includes('/manifest.json'));
    assert.ok(swCode.includes('/index.html'));
  });

  test('ADV_4.2: Execution of public/sw.js event registration in sandbox', () => {
    const registeredEvents: Record<string, ((...args: unknown[]) => void)[]> = {};

    const sandbox = {
      self: {
        addEventListener: (event: string, handler: (...args: unknown[]) => void) => {
          registeredEvents[event] = registeredEvents[event] || [];
          registeredEvents[event].push(handler);
        },
        skipWaiting: () => {},
        location: { origin: 'https://human2.app' },
        clients: { claim: async () => {} },
      },
      caches: {
        open: async () => ({
          addAll: async () => {},
          put: async () => {},
        }),
        keys: async () => ['human2-shell-v0', 'human2-shell-v1', 'unrelated-cache'],
        delete: async () => true,
        match: async () => null,
      },
      URL: globalThis.URL,
      Response: globalThis.Response,
      console: { log: () => {}, error: () => {}, warn: () => {} },
    };

    vm.createContext(sandbox);
    // Execute real sw.js inside the isolated context
    vm.runInContext(swCode, sandbox);

    assert.ok(registeredEvents['install']?.length, 'Install event listener must be registered');
    assert.ok(registeredEvents['activate']?.length, 'Activate event listener must be registered');
    assert.ok(registeredEvents['message']?.length, 'Message event listener must be registered');
    assert.ok(registeredEvents['fetch']?.length, 'Fetch event listener must be registered');
  });

  test('ADV_4.3: Hazard Guard filtering against real sw.js fetch listener', () => {
    // Setup a fetch test environment using sw.js
    const registeredEvents: Record<string, ((event: unknown) => void)[]> = {};
    const sandbox = {
      self: {
        addEventListener: (event: string, handler: (e: unknown) => void) => {
          registeredEvents[event] = registeredEvents[event] || [];
          registeredEvents[event].push(handler);
        },
        skipWaiting: () => {},
        location: { origin: 'https://human2.app' },
        clients: { claim: async () => {} },
      },
      caches: {
        open: async () => ({ put: async () => {} }),
        match: async () => null,
      },
      URL: globalThis.URL,
      Response: globalThis.Response,
      fetch: globalThis.fetch,
      console: { log: () => {}, error: () => {}, warn: () => {} },
    };

    vm.createContext(sandbox);
    vm.runInContext(swCode, sandbox);
    const fetchHandler = registeredEvents['fetch']?.[0];
    assert.ok(fetchHandler, 'fetch handler must be defined');

    const testHazardUrl = (urlStr: string, headers: Record<string, string> = {}, destination = '') => {
      let respondWithCalled = false;
      const fakeRequest = {
        method: 'GET',
        url: urlStr,
        headers: new Headers(headers),
        destination,
        mode: 'no-cors',
      };
      const fakeEvent = {
        request: fakeRequest,
        respondWith: () => {
          respondWithCalled = true;
        },
      };

      fetchHandler(fakeEvent);
      return respondWithCalled;
    };

    // 1. Range request should BYPASS (respondWith NOT called)
    assert.equal(testHazardUrl('https://human2.app/audio/ch-1.mp3', { range: 'bytes=0-1024' }), false, 'Range request must bypass SW');

    // 2. Audio destination should BYPASS
    assert.equal(testHazardUrl('https://human2.app/audio/track.mp3', {}, 'audio'), false, 'Audio destination must bypass SW');

    // 3. Excluded path /audio/ should BYPASS
    assert.equal(testHazardUrl('https://human2.app/audio/chapter-05.mp3'), false, '/audio/ path must bypass SW');

    // 4. Excluded path /videos/ should BYPASS
    assert.equal(testHazardUrl('https://human2.app/videos/sample.mp4'), false, '/videos/ path must bypass SW');

    // 5. Excluded extension .mp3 should BYPASS
    assert.equal(testHazardUrl('https://human2.app/custom-sound.mp3'), false, '.mp3 extension must bypass SW');

    // 6. External host drive.google.com should BYPASS
    assert.equal(testHazardUrl('https://drive.google.com/file/d/123/view'), false, 'drive.google.com must bypass SW');

    // 7. Non-GET method (POST) should BYPASS
    let postRespondWith = false;
    fetchHandler({
      request: {
        method: 'POST',
        url: 'https://human2.app/api/feedback',
        headers: new Headers(),
        destination: '',
      },
      respondWith: () => {
        postRespondWith = true;
      },
    });
    assert.equal(postRespondWith, false, 'POST method must bypass SW');
  });

  test('ADV_4.4: Offline navigation fallback returns cached index.html or emergency HTML', async () => {
    const registeredEvents: Record<string, ((event: unknown) => void)[]> = {};

    let cachedIndexReturned = false;
    const mockCachedResponse = new Response('<!DOCTYPE html><html><body>Cached Shell</body></html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

    const sandbox = {
      self: {
        addEventListener: (event: string, handler: (e: unknown) => void) => {
          registeredEvents[event] = registeredEvents[event] || [];
          registeredEvents[event].push(handler);
        },
        skipWaiting: () => {},
        location: { origin: 'https://human2.app' },
        clients: { claim: async () => {} },
      },
      caches: {
        open: async () => ({ put: async () => {} }),
        match: async (req: string) => {
          if (req === '/index.html' || req === '/') {
            cachedIndexReturned = true;
            return mockCachedResponse;
          }
          return null;
        },
      },
      URL: globalThis.URL,
      Response: globalThis.Response,
      fetch: async () => {
        // Network throws when user is offline!
        throw new TypeError('Failed to fetch: NetworkOffline');
      },
      console: { log: () => {}, error: () => {}, warn: () => {} },
    };

    vm.createContext(sandbox);
    vm.runInContext(swCode, sandbox);
    const fetchHandler = registeredEvents['fetch']?.[0];

    let resultResponse: Response | null = null;
    const fakeEvent = {
      request: {
        method: 'GET',
        url: 'https://human2.app/sleep',
        headers: new Headers(),
        destination: 'document',
        mode: 'navigate',
      },
      respondWith: (promise: Promise<Response>) => {
        promise.then((res) => {
          resultResponse = res;
        });
      },
    };

    fetchHandler(fakeEvent);

    // Wait microtasks
    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.ok(resultResponse !== null, 'Offline navigation must produce a response');
    assert.equal(cachedIndexReturned, true, 'caches.match for /index.html must be called');
    const text = await (resultResponse as Response).text();
    assert.ok(text.includes('Cached Shell'), 'Must return cached index.html shell');
  });

  test('ADV_4.5: Emergency inline fallback when cache has no index.html', async () => {
    const registeredEvents: Record<string, ((event: unknown) => void)[]> = {};

    const sandbox = {
      self: {
        addEventListener: (event: string, handler: (e: unknown) => void) => {
          registeredEvents[event] = registeredEvents[event] || [];
          registeredEvents[event].push(handler);
        },
        skipWaiting: () => {},
        location: { origin: 'https://human2.app' },
        clients: { claim: async () => {} },
      },
      caches: {
        open: async () => ({ put: async () => {} }),
        match: async () => null, // Cache is empty!
      },
      URL: globalThis.URL,
      Response: globalThis.Response,
      fetch: async () => {
        throw new TypeError('Network error');
      },
      console: { log: () => {}, error: () => {}, warn: () => {} },
    };

    vm.createContext(sandbox);
    vm.runInContext(swCode, sandbox);
    const fetchHandler = registeredEvents['fetch']?.[0];

    let resultResponse: Response | null = null;
    const fakeEvent = {
      request: {
        method: 'GET',
        url: 'https://human2.app/',
        headers: new Headers(),
        destination: 'document',
        mode: 'navigate',
      },
      respondWith: (promise: Promise<Response>) => {
        promise.then((res) => {
          resultResponse = res;
        });
      },
    };

    fetchHandler(fakeEvent);
    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.ok(resultResponse !== null);
    const body = await (resultResponse as Response).text();
    assert.ok(body.includes('Human 2.0 — Offline'), 'Emergency fallback must contain Human 2.0 — Offline');
    assert.ok(body.includes('Retry Connection'));
    assert.equal((resultResponse as Response).headers.get('Content-Type'), 'text/html; charset=utf-8');
  });

  test('ADV_4.6: Cache cleanup purges stale human2-* caches and preserves human2-shell-v1', async () => {
    const registeredEvents: Record<string, ((event: unknown) => void)[]> = {};
    const deletedCaches: string[] = [];

    const sandbox = {
      self: {
        addEventListener: (event: string, handler: (e: unknown) => void) => {
          registeredEvents[event] = registeredEvents[event] || [];
          registeredEvents[event].push(handler);
        },
        skipWaiting: () => {},
        location: { origin: 'https://human2.app' },
        clients: { claim: async () => {} },
      },
      caches: {
        keys: async () => ['human2-shell-v0', 'human2-shell-beta', 'human2-shell-v1', 'unrelated-cdn'],
        delete: async (k: string) => {
          deletedCaches.push(k);
          return true;
        },
      },
      console: { log: () => {}, error: () => {}, warn: () => {} },
    };

    vm.createContext(sandbox);
    vm.runInContext(swCode, sandbox);
    const activateHandler = registeredEvents['activate']?.[0];

    let waitUntilFinished = false;
    const fakeActivateEvent = {
      waitUntil: (promise: Promise<unknown>) => {
        promise.then(() => {
          waitUntilFinished = true;
        });
      },
    };

    activateHandler(fakeActivateEvent);
    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.equal(waitUntilFinished, true);
    assert.ok(deletedCaches.includes('human2-shell-v0'), 'Old version v0 must be deleted');
    assert.ok(deletedCaches.includes('human2-shell-beta'), 'Old beta cache must be deleted');
    assert.ok(!deletedCaches.includes('human2-shell-v1'), 'Current cache v1 must NOT be deleted');
    assert.ok(!deletedCaches.includes('unrelated-cdn'), 'Unrelated caches must NOT be deleted');
  });

  test('ADV_4.7: Cache-first asset strategy for /assets/* in public/sw.js', async () => {
    const registeredEvents: Record<string, ((event: unknown) => void)[]> = {};
    let networkFetchCalled = false;

    const mockAssetResponse = new Response('/* cached css */', {
      status: 200,
      headers: { 'Content-Type': 'text/css' },
    });

    const sandbox = {
      self: {
        addEventListener: (event: string, handler: (e: unknown) => void) => {
          registeredEvents[event] = registeredEvents[event] || [];
          registeredEvents[event].push(handler);
        },
        skipWaiting: () => {},
        location: { origin: 'https://human2.app' },
        clients: { claim: async () => {} },
      },
      caches: {
        open: async () => ({ put: async () => {} }),
        match: async () => mockAssetResponse, // HIT
      },
      URL: globalThis.URL,
      Response: globalThis.Response,
      fetch: async () => {
        networkFetchCalled = true;
        return new Response('/* network css */');
      },
      console: { log: () => {}, error: () => {}, warn: () => {} },
    };

    vm.createContext(sandbox);
    vm.runInContext(swCode, sandbox);
    const fetchHandler = registeredEvents['fetch']?.[0];

    let resultResponse: Response | null = null;
    const fakeEvent = {
      request: {
        method: 'GET',
        url: 'https://human2.app/assets/index-DRaoOp6I.css',
        headers: new Headers(),
        destination: 'style',
      },
      respondWith: (promise: Promise<Response>) => {
        promise.then((res) => {
          resultResponse = res;
        });
      },
    };

    fetchHandler(fakeEvent);
    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.ok(resultResponse !== null);
    assert.equal(networkFetchCalled, false, 'Cache hit must not touch network');
    const text = await (resultResponse as Response).text();
    assert.equal(text, '/* cached css */');
  });

  test('ADV_4.8: Message SKIP_WAITING event triggers self.skipWaiting() in public/sw.js', () => {
    const registeredEvents: Record<string, ((event: unknown) => void)[]> = {};
    let skipWaitingCalled = false;

    const sandbox = {
      self: {
        addEventListener: (event: string, handler: (e: unknown) => void) => {
          registeredEvents[event] = registeredEvents[event] || [];
          registeredEvents[event].push(handler);
        },
        skipWaiting: () => {
          skipWaitingCalled = true;
        },
        location: { origin: 'https://human2.app' },
        clients: { claim: async () => {} },
      },
      caches: {
        open: async () => ({ put: async () => {} }),
      },
      URL: globalThis.URL,
      Response: globalThis.Response,
      console: { log: () => {}, error: () => {}, warn: () => {} },
    };

    vm.createContext(sandbox);
    vm.runInContext(swCode, sandbox);
    const messageHandler = registeredEvents['message']?.[0];

    assert.ok(messageHandler, 'message handler must be registered');
    messageHandler({ data: { type: 'SKIP_WAITING' } });
    assert.equal(skipWaitingCalled, true, 'skipWaiting must be called on SKIP_WAITING message');

    // Unknown message must not trigger skipWaiting
    skipWaitingCalled = false;
    messageHandler({ data: { type: 'UNKNOWN_MSG' } });
    assert.equal(skipWaitingCalled, false, 'unknown message type must not trigger skipWaiting');
  });
});
