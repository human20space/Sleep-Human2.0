import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import test, { describe } from 'node:test';
import sharp from 'sharp';

const PROJECT_ROOT = path.resolve('.');

// ============================================================================
// 1. MANIFEST SUITE EMPIRICAL VALIDATION
// ============================================================================
describe('Challenger M1: Manifest Empirical Validation', () => {
  const publicManifestPath = path.join(PROJECT_ROOT, 'public', 'manifest.webmanifest');
  const publicManifestJsonPath = path.join(PROJECT_ROOT, 'public', 'manifest.json');
  const distManifestPath = path.join(PROJECT_ROOT, 'dist', 'manifest.webmanifest');
  const distManifestJsonPath = path.join(PROJECT_ROOT, 'dist', 'manifest.json');

  test('Both public and dist manifest files exist and are non-empty', () => {
    assert.ok(fs.existsSync(publicManifestPath), 'public/manifest.webmanifest exists');
    assert.ok(fs.existsSync(publicManifestJsonPath), 'public/manifest.json exists');
    assert.ok(fs.existsSync(distManifestPath), 'dist/manifest.webmanifest exists');
    assert.ok(fs.existsSync(distManifestJsonPath), 'dist/manifest.json exists');

    assert.ok(fs.statSync(publicManifestPath).size > 100);
    assert.ok(fs.statSync(publicManifestJsonPath).size > 100);
    assert.ok(fs.statSync(distManifestPath).size > 100);
    assert.ok(fs.statSync(distManifestJsonPath).size > 100);
  });

  test('Manifest contents parse as identical valid JSON', () => {
    const rawWeb = fs.readFileSync(publicManifestPath, 'utf8');
    const rawJson = fs.readFileSync(publicManifestJsonPath, 'utf8');
    const distWeb = fs.readFileSync(distManifestPath, 'utf8');
    const distJson = fs.readFileSync(distManifestJsonPath, 'utf8');

    const parsedWeb = JSON.parse(rawWeb);
    const parsedJson = JSON.parse(rawJson);
    const parsedDistWeb = JSON.parse(distWeb);
    const parsedDistJson = JSON.parse(distJson);

    assert.deepStrictEqual(parsedWeb, parsedJson, 'public webmanifest and json must be identical');
    assert.deepStrictEqual(parsedWeb, parsedDistWeb, 'dist webmanifest must match public');
    assert.deepStrictEqual(parsedWeb, parsedDistJson, 'dist json must match public');
  });

  test('Required W3C PWA Manifest fields conform strictly to spec', () => {
    const manifest = JSON.parse(fs.readFileSync(publicManifestPath, 'utf8'));

    assert.strictEqual(manifest.name, 'Human 2.0');
    assert.strictEqual(manifest.short_name, 'Human 2.0');
    assert.strictEqual(manifest.start_url, '/');
    assert.strictEqual(manifest.scope, '/');
    assert.strictEqual(manifest.display, 'standalone');
    assert.strictEqual(manifest.orientation, 'portrait');
    assert.strictEqual(manifest.theme_color, '#05070a');
    assert.strictEqual(manifest.background_color, '#05070a');
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 4);
    assert.ok(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 3);
  });

  test('Manifest icon definitions point to existing files with correct MIME and sizes', () => {
    const manifest = JSON.parse(fs.readFileSync(publicManifestPath, 'utf8'));

    const expectedResolutions = new Set(['192x192', '512x512', '180x180']);
    const foundResolutions = new Set();
    let hasMaskable = false;

    for (const icon of manifest.icons) {
      assert.strictEqual(icon.type, 'image/png', `Icon ${icon.src} must have MIME image/png`);
      assert.ok(icon.src.startsWith('/icons/'), `Icon src must be in /icons/`);

      const publicIconPath = path.join(PROJECT_ROOT, 'public', icon.src.replace(/^\//, ''));
      const distIconPath = path.join(PROJECT_ROOT, 'dist', icon.src.replace(/^\//, ''));

      assert.ok(fs.existsSync(publicIconPath), `Icon file must exist at ${publicIconPath}`);
      assert.ok(fs.existsSync(distIconPath), `Icon file must exist in dist at ${distIconPath}`);

      foundResolutions.add(icon.sizes);
      if (icon.purpose === 'maskable') {
        hasMaskable = true;
        assert.strictEqual(icon.sizes, '512x512', 'Maskable icon must be 512x512');
      }
    }

    assert.ok(hasMaskable, 'Manifest must contain at least one maskable icon');
    for (const res of expectedResolutions) {
      assert.ok(foundResolutions.has(res), `Manifest must include icon size ${res}`);
    }
  });
});

// ============================================================================
// 2. ICON FILES EMPIRICAL VALIDATION (SIGNATURE, DIMENSIONS, MASKABLE SAFE-ZONE)
// ============================================================================
describe('Challenger M1: Icon Binary & Safe-Zone Validation', () => {
  const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ICONS_CONFIG = [
    { file: 'icon-192x192.png', width: 192, height: 192, maskable: false },
    { file: 'icon-512x512.png', width: 512, height: 512, maskable: false },
    { file: 'icon-maskable-512x512.png', width: 512, height: 512, maskable: true },
    { file: 'apple-touch-icon-180x180.png', width: 180, height: 180, maskable: false },
  ];

  for (const item of ICONS_CONFIG) {
    test(`Icon ${item.file}: Valid PNG 8-byte magic signature and non-trivial file size`, () => {
      const publicPath = path.join(PROJECT_ROOT, 'public', 'icons', item.file);
      const distPath = path.join(PROJECT_ROOT, 'dist', 'icons', item.file);

      const bufPublic = fs.readFileSync(publicPath);
      const bufDist = fs.readFileSync(distPath);

      assert.ok(bufPublic.length > 10000, `${item.file} public file size must be > 10KB`);
      assert.ok(bufDist.length > 10000, `${item.file} dist file size must be > 10KB`);

      assert.ok(bufPublic.subarray(0, 8).equals(PNG_MAGIC), `${item.file} public must start with PNG magic`);
      assert.ok(bufDist.subarray(0, 8).equals(PNG_MAGIC), `${item.file} dist must start with PNG magic`);
    });

    test(`Icon ${item.file}: IHDR chunk headers verify exact width=${item.width}, height=${item.height}, depth=8`, () => {
      const publicPath = path.join(PROJECT_ROOT, 'public', 'icons', item.file);
      const buf = fs.readFileSync(publicPath);

      const chunkLength = buf.readUInt32BE(8);
      const chunkType = buf.toString('ascii', 12, 16);
      assert.strictEqual(chunkLength, 13, 'IHDR chunk data length must be 13 bytes');
      assert.strictEqual(chunkType, 'IHDR', 'First chunk must be IHDR');

      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      const bitDepth = buf.readUInt8(24);
      const colorType = buf.readUInt8(25);

      assert.strictEqual(width, item.width, `Width must match ${item.width}`);
      assert.strictEqual(height, item.height, `Height must match ${item.height}`);
      assert.strictEqual(bitDepth, 8, 'Bit depth must be 8-bit');
      assert.ok(colorType === 6 || colorType === 2, 'Color type must be RGBA (6) or RGB (2)');
    });
  }

  test('Maskable icon (icon-maskable-512x512.png): Safe-zone & full-bleed opacity compliance', async () => {
    const maskablePath = path.join(PROJECT_ROOT, 'public', 'icons', 'icon-maskable-512x512.png');
    const image = sharp(maskablePath);
    const metadata = await image.metadata();

    assert.strictEqual(metadata.width, 512);
    assert.strictEqual(metadata.height, 512);

    // Extract raw RGBA pixel buffer
    const rawPixels = await image.raw().toBuffer();
    const channels = metadata.channels || 4;

    // Check corners (outside the safe zone circle): must NOT be transparent
    // Maskable icons MUST bleed background edge-to-edge
    const cornerCoordinates = [
      { x: 0, y: 0 },
      { x: 511, y: 0 },
      { x: 0, y: 511 },
      { x: 511, y: 511 },
    ];

    for (const { x, y } of cornerCoordinates) {
      const offset = (y * 512 + x) * channels;
      const r = rawPixels[offset];
      const g = rawPixels[offset + 1];
      const b = rawPixels[offset + 2];
      const a = channels === 4 ? rawPixels[offset + 3] : 255;

      assert.strictEqual(a, 255, `Corner (${x}, ${y}) must be 100% opaque for maskable full bleed`);
      // Background must be dark space (#05070a / #0a151d)
      assert.ok(r <= 25 && g <= 30 && b <= 40, `Corner (${x}, ${y}) color must be dark background`);
    }

    // Check center pixel (256, 256) inside safe zone: should have non-background monogram / disc element
    const centerOffset = (256 * 512 + 256) * channels;
    const centerR = rawPixels[centerOffset];
    const centerG = rawPixels[centerOffset + 1];
    const centerB = rawPixels[centerOffset + 2];
    assert.ok(
      centerR > 30 || centerG > 50 || centerB > 50,
      'Center pixel must be active brand glyph / disc element'
    );
  });
});

// ============================================================================
// 3. SERVICE WORKER ADVERSARIAL STRESS TEST HARNESS
// ============================================================================
describe('Challenger M1: Service Worker sw.js Adversarial Stress Testing', () => {
  const swCode = fs.readFileSync(path.join(PROJECT_ROOT, 'public', 'sw.js'), 'utf8');

  // Simulated Service Worker Environment
  function setupSwEnvironment() {
    const listeners = {};
    const cacheStorage = new Map();
    let skipWaitingCalled = false;
    let clientsClaimCalled = false;

    class MockCache {
      constructor(name) {
        this.name = name;
        this.items = new Map();
      }
      async addAll(urls) {
        for (const url of urls) {
          this.items.set(url, new Response('mock-content'));
        }
      }
      async put(req, res) {
        const key = typeof req === 'string' ? req : req.url;
        this.items.set(key, res);
      }
      async match(req) {
        const key = typeof req === 'string' ? req : req.url;
        return this.items.get(key) || null;
      }
    }

    const mockCaches = {
      open: async (name) => {
        if (!cacheStorage.has(name)) {
          cacheStorage.set(name, new MockCache(name));
        }
        return cacheStorage.get(name);
      },
      match: async (req) => {
        for (const cache of cacheStorage.values()) {
          const res = await cache.match(req);
          if (res) return res;
        }
        return null;
      },
      keys: async () => Array.from(cacheStorage.keys()),
      delete: async (name) => cacheStorage.delete(name),
    };

    const mockSelf = {
      location: new URL('https://human2.app/sw.js'),
      addEventListener: (type, handler) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(handler);
      },
      skipWaiting: () => {
        skipWaitingCalled = true;
      },
      clients: {
        claim: async () => {
          clientsClaimCalled = true;
        },
      },
    };

    // Execute sw.js in mock sandbox
    const swFunction = new Function(
      'self',
      'caches',
      'Response',
      'Request',
      'Headers',
      'URL',
      'fetch',
      swCode
    );

    // Mock global fetch
    const mockFetch = async (req) => {
      return new Response('mock-network-response', { status: 200, headers: { 'Content-Type': 'text/html' } });
    };

    swFunction(mockSelf, mockCaches, Response, Request, Headers, URL, mockFetch);

    return {
      listeners,
      mockCaches,
      getSkipWaitingCalled: () => skipWaitingCalled,
      getClientsClaimCalled: () => clientsClaimCalled,
    };
  }

  test('Fetch listener is successfully registered', () => {
    const env = setupSwEnvironment();
    assert.ok(env.listeners['fetch'] && env.listeners['fetch'].length > 0, 'Fetch event listener registered');
    assert.ok(env.listeners['install'] && env.listeners['install'].length > 0, 'Install event listener registered');
    assert.ok(env.listeners['activate'] && env.listeners['activate'].length > 0, 'Activate event listener registered');
    assert.ok(env.listeners['message'] && env.listeners['message'].length > 0, 'Message event listener registered');
  });

  // Adversarial Scenarios where Service Worker MUST NOT intercept / cache
  const ADVERSARIAL_HAZARD_CASES = [
    {
      name: 'Range header: bytes=0-',
      request: new Request('https://human2.app/audio/chapter1.mp3', {
        headers: { range: 'bytes=0-' },
      }),
    },
    {
      name: 'Range header: bytes=1024-2048',
      request: new Request('https://human2.app/some-stream', {
        headers: { Range: 'bytes=1024-2048' },
      }),
    },
    {
      name: 'Destination: audio',
      request: new Request('https://human2.app/track', {
        // destination is set via RequestInit in spec, mocked here
      }),
      destination: 'audio',
    },
    {
      name: 'Destination: video',
      request: new Request('https://human2.app/video', {}),
      destination: 'video',
    },
    {
      name: 'Excluded Path: /audio/chapter1.mp3',
      request: new Request('https://human2.app/audio/chapter1.mp3'),
    },
    {
      name: 'Excluded Path: /videos/sleep_preview.mp4',
      request: new Request('https://human2.app/videos/sleep_preview.mp4'),
    },
    {
      name: 'Excluded Path: /video_2026-10-03_17-42-43.mp4',
      request: new Request('https://human2.app/video_2026-10-03_17-42-43.mp4'),
    },
    {
      name: 'Excluded extension: .mp3 with complex query parameters',
      request: new Request('https://human2.app/stream/track.mp3?token=xyz123&ts=99999'),
    },
    {
      name: 'Excluded extension: uppercase .MP4',
      request: new Request('https://human2.app/assets/HERO_SLEEP.MP4'),
    },
    {
      name: 'Excluded extension: .wav',
      request: new Request('https://human2.app/sfx/chime.wav'),
    },
    {
      name: 'Excluded extension: .ogg',
      request: new Request('https://human2.app/sfx/drone.ogg'),
    },
    {
      name: 'Excluded extension: .webm',
      request: new Request('https://human2.app/media/night.webm'),
    },
    {
      name: 'Excluded extension: .m4a',
      request: new Request('https://human2.app/audio/meditation.m4a'),
    },
    {
      name: 'Excluded extension: .flac',
      request: new Request('https://human2.app/audio/lossless.flac'),
    },
    {
      name: 'External Media Host: drive.google.com',
      request: new Request('https://drive.google.com/uc?export=download&id=chapter45'),
    },
    {
      name: 'External Media Host: drive.usercontent.google.com',
      request: new Request('https://drive.usercontent.google.com/download?id=ch1'),
    },
    {
      name: 'Non-GET method: POST request',
      request: new Request('https://human2.app/api/save', { method: 'POST', body: 'data' }),
    },
    {
      name: 'Non-GET method: PUT request',
      request: new Request('https://human2.app/api/vault', { method: 'PUT', body: '{}' }),
    },
    {
      name: 'Non-GET method: DELETE request',
      request: new Request('https://human2.app/api/session', { method: 'DELETE' }),
    },
  ];

  for (const tc of ADVERSARIAL_HAZARD_CASES) {
    test(`HAZARD GUARD: ${tc.name} MUST NOT call event.respondWith()`, () => {
      const env = setupSwEnvironment();
      const fetchHandler = env.listeners['fetch'][0];

      let respondWithCalled = false;
      const mockEvent = {
        request: tc.request,
        respondWith: () => {
          respondWithCalled = true;
        },
      };

      if (tc.destination) {
        Object.defineProperty(tc.request, 'destination', {
          value: tc.destination,
          configurable: true,
        });
      }

      fetchHandler(mockEvent);

      assert.strictEqual(
        respondWithCalled,
        false,
        `Hazard guard failed: respondWith was called for ${tc.name}`
      );
    });
  }

  test('App shell request (GET /index.html) MUST call event.respondWith()', () => {
    const env = setupSwEnvironment();
    const fetchHandler = env.listeners['fetch'][0];

    let respondWithCalled = false;
    const req = new Request('https://human2.app/index.html');
    Object.defineProperty(req, 'mode', { value: 'navigate', configurable: true });

    fetchHandler({
      request: req,
      respondWith: () => {
        respondWithCalled = true;
      },
    });

    assert.strictEqual(respondWithCalled, true, 'App shell navigation must be handled by SW');
  });

  test('Message event: { type: "SKIP_WAITING" } calls self.skipWaiting()', () => {
    const env = setupSwEnvironment();
    const messageHandler = env.listeners['message'][0];

    messageHandler({ data: { type: 'SKIP_WAITING' } });
    assert.strictEqual(env.getSkipWaitingCalled(), true, 'self.skipWaiting() must be called');
  });

  test('Message event: unknown type does NOT call self.skipWaiting()', () => {
    const env = setupSwEnvironment();
    const messageHandler = env.listeners['message'][0];

    messageHandler({ data: { type: 'PING' } });
    assert.strictEqual(env.getSkipWaitingCalled(), false, 'self.skipWaiting() must not be called');
  });

  test('Activate event: purges stale caches starting with human2- and preserves current shell cache', async () => {
    const env = setupSwEnvironment();
    const activateHandler = env.listeners['activate'][0];

    // Seed caches
    await env.mockCaches.open('human2-shell-v1');
    await env.mockCaches.open('human2-shell-v0-stale');
    await env.mockCaches.open('other-app-cache');

    let waitUntilPromise = null;
    activateHandler({
      waitUntil: (p) => {
        waitUntilPromise = p;
      },
    });

    assert.ok(waitUntilPromise, 'activate must call waitUntil');
    await waitUntilPromise;

    const remainingKeys = await env.mockCaches.keys();
    assert.ok(remainingKeys.includes('human2-shell-v1'), 'Must preserve current cache');
    assert.ok(!remainingKeys.includes('human2-shell-v0-stale'), 'Must purge stale human2 cache');
    assert.ok(remainingKeys.includes('other-app-cache'), 'Must preserve non-human2 caches');
    assert.strictEqual(env.getClientsClaimCalled(), true, 'Must call self.clients.claim()');
  });
});

// ============================================================================
// 4. HTML PWA META TAGS AND VIEWPORT COMPLIANCE
// ============================================================================
describe('Challenger M1: HTML Meta Tags & Viewport Hardening', () => {
  const indexHtmlPath = path.join(PROJECT_ROOT, 'index.html');
  const distHtmlPath = path.join(PROJECT_ROOT, 'dist', 'index.html');

  test('index.html contains all required PWA meta tags and link rels', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');

    assert.ok(html.includes('<link rel="manifest" href="/manifest.webmanifest"'), 'Must link manifest.webmanifest');
    assert.ok(html.includes('rel="apple-touch-icon"'), 'Must have apple-touch-icon link');
    assert.ok(html.includes('name="apple-mobile-web-app-capable" content="yes"'), 'apple-mobile-web-app-capable yes');
    assert.ok(html.includes('name="apple-mobile-web-app-status-bar-style" content="black-translucent"'), 'status-bar-style black-translucent');
    assert.ok(html.includes('viewport-fit=cover'), 'viewport-fit=cover present');
    assert.ok(html.includes('theme-color'), 'theme-color present');
  });

  test('dist/index.html retains PWA meta tags in compiled output', () => {
    const html = fs.readFileSync(distHtmlPath, 'utf8');

    assert.ok(html.includes('/manifest.webmanifest'), 'dist index.html links manifest');
    assert.ok(html.includes('apple-mobile-web-app-capable'), 'dist index.html has standalone meta');
    assert.ok(html.includes('viewport-fit=cover'), 'dist index.html has viewport-fit=cover');
  });
});
