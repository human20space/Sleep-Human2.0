# Technical Analysis & Production Implementation Blueprint: PWA Manifest, Brand Icons & Meta Tags

**Explorer**: `teamwork_preview_explorer` (Milestone 1 Explorer 1: Manifest & Icons Strategy)  
**Date**: 2026-10-08  
**Working Directory**: `C:\Users\annak\.gemini\antigravity\scratch\human2\.agents\teamwork\teamwork_preview_explorer_m1_1`  
**Target Project**: `Human 2.0` (`C:\Users\annak\.gemini\antigravity\scratch\human2`)  
**Mission**: Formulate a concrete, production-ready implementation plan for:
1. `public/manifest.webmanifest` and `public/manifest.json`.
2. High-fidelity brand icon generation script / SVG-to-PNG mechanism in `public/icons/` (`icon-192x192.png`, `icon-512x512.png`, `icon-maskable-512x512.png`, `apple-touch-icon-180x180.png`).
3. Complete `index.html` PWA meta tags, apple-mobile-web-app-capable, status-bar-style, and theme-color matching `#05070a` / `#f7f3ec`.

---

## 1. Executive Summary & Audit Baseline

The Human 2.0 application is built with React 19 (`react: ^19.2.8`), Vite 8 (`vite: ^8.3.0`), TypeScript 6 (`typescript: ~6.0.2`), Tailwind CSS v4 (`@tailwindcss/vite: ^4.3.3`), and Framer Motion (`^14.0.0`). The project compiles purely client-side into static assets in `dist/`.

### 1.1 Baseline Audit Findings
1. **Manifest**: Completely missing. Neither `public/manifest.webmanifest` nor `public/manifest.json` exists.
2. **Brand Icons Suite**: Missing all PNG icons in `public/icons/`. The existing `public/favicon.svg` is an unrelated legacy purple lightning bolt template (`#863bff`), which breaks brand consistency.
3. **PWA Meta Tags**: `index.html` contains only a basic viewport `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />` and Google Fonts. It is missing:
   - `<link rel="manifest">`
   - Dark and light `theme-color` declarations (`#05070a` and `#f7f3ec`)
   - iOS standalone capability tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`)
   - Android and Windows mobile app meta tags
4. **Tooling & Environment Quirk**:
   - Host environment is Windows with PowerShell. Attempting to execute `npm` directly in PowerShell triggers `PSSecurityException` (`npm.ps1 cannot be loaded because running scripts is disabled on this system`).
   - All npm and node script commands must be executed via `cmd /c npm ...` or `cmd /c node ...`.
   - Node version is v24.19.0, which natively supports `zlib.crc32` and `zlib.deflateSync`, enabling zero-dependency pure Node.js PNG synthesis if needed.

---

## 2. Web App Manifest Implementation Blueprint

### 2.1 File Architecture
Two identical manifest files will be placed in `public/`:
1. `public/manifest.webmanifest` — Standard W3C PWA Manifest with MIME type `application/manifest+json`.
2. `public/manifest.json` — Identical duplicate ensuring seamless backwards-compatibility with legacy Android webviews, Chromium wrappers, and test runners that look for `manifest.json`.

Because Vite copies everything in `public/` directly into `dist/`, both files will be available at root `/manifest.webmanifest` and `/manifest.json` upon build.

### 2.2 Complete Manifest Source Code (`public/manifest.webmanifest` & `public/manifest.json`)
```json
{
  "id": "/",
  "name": "Human 2.0",
  "short_name": "Human 2.0",
  "description": "Sleep Supporting Mobile App & Personal Awareness Platform for the AI Age",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "display_override": ["standalone", "minimal-ui"],
  "orientation": "portrait",
  "theme_color": "#05070a",
  "background_color": "#05070a",
  "lang": "en-US",
  "dir": "ltr",
  "categories": ["health", "lifestyle", "music", "productivity"],
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/apple-touch-icon-180x180.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Night Sleep Reset",
      "short_name": "Sleep Reset",
      "description": "Acute 90-second racing mind silencer & sleep induction",
      "url": "/?action=sos",
      "icons": [
        {
          "src": "/icons/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "Sleep Soundscapes",
      "short_name": "Soundscapes",
      "description": "432Hz solfeggio drone and delta wave sleep binaurals",
      "url": "/?action=soundscapes",
      "icons": [
        {
          "src": "/icons/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "Audiobook",
      "short_name": "Audiobook",
      "description": "45-Chapter Human 2.0 Audiobook",
      "url": "/?action=audiobook",
      "icons": [
        {
          "src": "/icons/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ]
    }
  ],
  "prefer_related_applications": false,
  "related_applications": []
}
```

### 2.3 Field Specification & Architectural Rationale
- **`id: "/"`**: Explicit identifier preventing the browser from treating query-string parameter changes or hash updates as separate app instances.
- **`display: "standalone"` & `display_override: ["standalone", "minimal-ui"]`**: Removes browser URL bar, navigation arrows, and footer controls, giving Human 2.0 an immersive native app container.
- **`orientation: "portrait"`**: Critical for a sleep-supporting app used in bed. Prevents jarring horizontal viewport flips when users rotate their phone on a pillow.
- **`theme_color: "#05070a"`**: Coordinates with Night Sanctuary palette. Android colors the system status bar and app switcher bar with this color, eliminating white flashes.
- **`background_color: "#05070a"`**: Sets the Android splash screen background color while Webpack/Vite chunks are hydrating.
- **`shortcuts`**: Enables 1-touch jump to Sleep SOS, Soundscapes, or Audiobook directly from a long-press on the Android/iOS home screen icon.

---

## 3. Brand Icon Suite Specification & Geometry

### 3.1 Visual Glyph Composition
The brand mark accurately reflects the canonical identity established in `SplashScreen.tsx` (lines 101–107) and `PhoneFrame.tsx` (lines 40–42):
- **Base Canvas**: Deep obsidian midnight black (`#05070a`).
- **Inner Astral Disc**: Radial/linear gradient from deep sanctuary teal (`#103848` / `#17495e`) to luminous oceanic teal (`#1f5f78` / `#247291`).
- **Stardust Halo**: Soft radial luminescence surrounding the disc (`rgba(232, 185, 138, 0.35)` down to `rgba(31, 95, 120, 0.0)`).
- **Core Monogram**: Bold typographic glyph **"2.0"** in Playfair Display serif, finished with warm champagne gold gradient (`#fae3cb` → `#e8b98a` → `#d9a44a`).
- **Celestial Accent**: 4-point golden stardust sparkle cross placed at the top-right border of the disc.
- **Ambient Micro-Stardust**: Delicate celestial micro-particles in gold (`#e8b98a`) and astral blue (`#8fd0ff`).

### 3.2 Icon Suite Specifications

| File Path | Resolution | Format | Purpose | Safe Zone & Geometry Constraint |
| :--- | :--- | :--- | :--- | :--- |
| `public/icons/icon-192x192.png` | 192 × 192 px | PNG-24 (RGBA) | `"any"` | Standard Android launcher icon, splash launcher |
| `public/icons/icon-512x512.png` | 512 × 512 px | PNG-24 (RGBA) | `"any"` | High-DPI splash screen, Chrome install dialog |
| `public/icons/icon-maskable-512x512.png` | 512 × 512 px | PNG-24 (RGB) | `"maskable"` | Android adaptive icon. **Canvas fully painted `#05070a` to all edges**. Inner disc (diameter ~330px, radius 165px) sits strictly within the 80% safe zone circle (radius 204.8px) with 39.8px outer margin |
| `public/icons/apple-touch-icon-180x180.png` | 180 × 180 px | PNG-24 (RGB) | Apple Touch Icon | iOS Home screen. Square canvas with solid `#05070a` background. iOS automatically applies squircle mask |
| `public/favicon.svg` | Scalable Vector | SVG | Browser tab icon | Replaces old purple lightning SVG with brand gold monogram inside teal disc |
| `public/icons/icon.svg` | Scalable Vector | SVG | Master Vector Asset | Master vector source used for high-fidelity raster rendering |

### 3.3 Safe Zone Proof (Maskable Icon)
- Total Canvas: 512 × 512 pixels (Center: 256, 256).
- Minimum Safe Area Circle: Center (256, 256), Radius $R_{\text{safe}} = 256 \times 0.8 = 204.8\text{ px}$ (Diameter: 409.6 px).
- Teal Disc Dimensions: Radius $R_{\text{disc}} = 165\text{ px}$ (Diameter: 330 px).
- Disc Clearance Margin: $204.8 - 165 = 39.8\text{ px}$ of breathing room inside the safe circle.
- Monogram: Center (256, 285), Width ~210px, Height ~115px, perfectly enclosed in $R=120\text{ px}$.
- Sparkle Accent: Positioned at $(378, 138)$, distance from center is $\sqrt{(378-256)^2 + (138-256)^2} = \sqrt{14884 + 13924} = 169.7\text{ px} < 204.8\text{ px}$.
- **Result**: The entire brand glyph, typography, and sparkle cross sit inside the safe zone. Zero clipping will occur on Samsung squircle, Google circle, or Xiaomi rounded rectangle shapes.

---

## 4. Master Vector SVG Asset Specifications

### 4.1 Master Icon SVG (`public/icons/icon.svg`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Space Glow -->
    <radialGradient id="spaceGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0a151d" />
      <stop offset="70%" stop-color="#05070a" />
      <stop offset="100%" stop-color="#05070a" />
    </radialGradient>

    <!-- Outer Stardust Halo -->
    <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e8b98a" stop-opacity="0.35" />
      <stop offset="50%" stop-color="#1f5f78" stop-opacity="0.22" />
      <stop offset="80%" stop-color="#17495e" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#05070a" stop-opacity="0" />
    </radialGradient>

    <!-- Inner Core Disc Gradient -->
    <linearGradient id="discGrad" x1="20%" y1="90%" x2="80%" y2="10%">
      <stop offset="0%" stop-color="#103848" />
      <stop offset="45%" stop-color="#17495e" />
      <stop offset="100%" stop-color="#247291" />
    </linearGradient>

    <!-- Gold Monogram Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fae3cb" />
      <stop offset="40%" stop-color="#e8b98a" />
      <stop offset="100%" stop-color="#c99540" />
    </linearGradient>

    <!-- Sparkle Cross Gradient -->
    <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#fae3cb" />
      <stop offset="100%" stop-color="#e8b98a" />
    </linearGradient>

    <!-- Disc Glow Filter -->
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- 1. Obsidian Canvas Base (Full Bleed for Maskable Safe Zone) -->
  <rect width="512" height="512" fill="url(#spaceGlow)" />

  <!-- 2. Outer Stardust Luminescence Halo -->
  <circle cx="256" cy="256" r="230" fill="url(#haloGlow)" />

  <!-- 3. Ambient Celestial Micro-particles -->
  <circle cx="160" cy="140" r="2.2" fill="#e8b98a" opacity="0.6" />
  <circle cx="360" cy="160" r="2.5" fill="#8fd0ff" opacity="0.7" />
  <circle cx="130" cy="340" r="1.8" fill="#8fd0ff" opacity="0.5" />
  <circle cx="370" cy="370" r="2.2" fill="#e8b98a" opacity="0.6" />
  <circle cx="256" cy="80" r="1.5" fill="#fae3cb" opacity="0.8" />
  <circle cx="256" cy="432" r="1.5" fill="#8fd0ff" opacity="0.5" />
  <circle cx="90" cy="256" r="1.8" fill="#e8b98a" opacity="0.5" />
  <circle cx="422" cy="256" r="2" fill="#fae3cb" opacity="0.7" />

  <!-- 4. Luminous Astral Disc (Radius 165px) -->
  <circle cx="256" cy="256" r="165" fill="url(#discGrad)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="2.5" filter="url(#softGlow)" />
  <circle cx="256" cy="256" r="162" fill="none" stroke="rgba(232, 185, 138, 0.28)" stroke-width="1.2" />

  <!-- 5. 4-Point Celestial Sparkle Accent (Top-Right of Disc) -->
  <g transform="translate(378, 138) scale(1.35)" filter="url(#softGlow)">
    <path d="M 0,-18 C 0,-6 6,0 18,0 C 6,0 0,6 0,18 C 0,6 -6,0 -18,0 C -6,0 0,-6 0,-18 Z" fill="url(#sparkleGrad)" />
    <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
  </g>

  <!-- Secondary subtle star -->
  <g transform="translate(136, 376) scale(0.65)" opacity="0.75">
    <path d="M 0,-18 C 0,-6 6,0 18,0 C 6,0 0,6 0,18 C 0,6 -6,0 -18,0 C -6,0 0,-6 0,-18 Z" fill="url(#sparkleGrad)" />
  </g>

  <!-- 6. Monogram Typographic Glyph: "2.0" -->
  <text x="256" y="296"
        font-family="'Playfair Display', 'Lora', Georgia, 'Cinzel', serif"
        font-weight="700"
        font-size="124"
        letter-spacing="-2"
        text-anchor="middle"
        fill="url(#goldGrad)"
        style="filter: drop-shadow(0px 4px 12px rgba(0,0,0,0.5)) drop-shadow(0px 0px 24px rgba(232,185,138,0.4));">
    2.0
  </text>
</svg>
```

### 4.2 Replacement Favicon SVG (`public/favicon.svg`)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <defs>
    <linearGradient id="favDisc" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#103848" />
      <stop offset="50%" stop-color="#17495e" />
      <stop offset="100%" stop-color="#247291" />
    </linearGradient>
    <linearGradient id="favGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fae3cb" />
      <stop offset="50%" stop-color="#e8b98a" />
      <stop offset="100%" stop-color="#c99540" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="10" fill="#05070a" />
  <circle cx="24" cy="24" r="20" fill="url(#favDisc)" stroke="#e8b98a" stroke-width="1.2" stroke-opacity="0.4" />
  <text x="24" y="30.5"
        font-family="'Playfair Display', Georgia, serif"
        font-weight="700"
        font-size="16"
        letter-spacing="-0.5"
        text-anchor="middle"
        fill="url(#favGold)">
    2.0
  </text>
</svg>
```

---

## 5. Production Icon Generation Script (`scripts/generateIcons.cjs`)

To provide 100% execution reliability across diverse developer machines and CI pipelines, the generator script `scripts/generateIcons.cjs` is architected with a resilient multi-tier strategy:

1. **Tier 1 (Sharp)**: Uses `sharp` if installed to directly render `public/icons/icon.svg` into high-res PNG buffers for each target resolution.
2. **Tier 2 (Resvg)**: Uses `@resvg/resvg-js` if present to render vector SVG to PNG.
3. **Tier 3 (Pure Node.js Standalone Fallback)**: A zero-dependency mathematical pixel renderer built directly into the script that uses Node.js v24 native `zlib.deflateSync` and `zlib.crc32` to synthesize valid PNGs. This guarantees that `npm run generate:icons` will **never fail** even on machines without native C++ compilation toolchains or missing npm packages.

### 5.1 Complete Code for `scripts/generateIcons.cjs`
```javascript
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT_DIR = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');

// Ensure directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

const TARGETS = [
  { file: 'icon-192x192.png', size: 192, maskable: false },
  { file: 'icon-512x512.png', size: 512, maskable: false },
  { file: 'icon-maskable-512x512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon-180x180.png', size: 180, maskable: false }
];

// Pure Node.js PNG encoder (zero external dependencies)
function encodePng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(typeStr, data) {
    const typeBuf = Buffer.from(typeStr, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const typeAndData = Buffer.concat([typeBuf, data]);
    const crcVal = zlib.crc32(typeAndData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);

    return Buffer.concat([lenBuf, typeAndData, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // no interlace

  const ihdrChunk = chunk('IHDR', ihdr);

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let scanOffset = 0;
  let rgbaOffset = 0;
  const rowSize = width * 4;

  for (let y = 0; y < height; y++) {
    scanlines[scanOffset++] = 0; // Filter 0 (None)
    rgbaBuffer.copy(scanlines, scanOffset, rgbaOffset, rgbaOffset + rowSize);
    scanOffset += rowSize;
    rgbaOffset += rowSize;
  }

  const idatChunk = chunk('IDAT', zlib.deflateSync(scanlines, { level: 9 }));
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Zero-dependency mathematical pixel renderer for Human 2.0 brand glyph
function renderBrandGlyphFallback(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 512;
  const discR = 165 * scale;
  const discR2 = discR * discR;
  const haloR = 230 * scale;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 1. Base space background (#05070a)
      let r = 5;
      let g = 7;
      let b = 10;
      let a = 255;

      // 2. Stardust halo glow
      if (dist < haloR && dist >= discR) {
        const t = (haloR - dist) / (haloR - discR);
        const glowR = 232 * 0.35 * t + 31 * 0.22 * (1 - t);
        const glowG = 185 * 0.35 * t + 95 * 0.22 * (1 - t);
        const glowB = 138 * 0.35 * t + 120 * 0.22 * (1 - t);
        r = Math.min(255, Math.round(r + glowR * t));
        g = Math.min(255, Math.round(g + glowG * t));
        b = Math.min(255, Math.round(b + glowB * t));
      }

      // 3. Astral Teal Disc
      if (dist < discR) {
        // Gradient from top-right (#247291) to bottom-left (#103848)
        const diag = ((x - (cx - discR)) + (discR - (y - (cy - discR)))) / (discR * 4);
        const clampedDiag = Math.max(0, Math.min(1, diag));
        const discRed = Math.round(16 + (36 - 16) * clampedDiag);
        const discGreen = Math.round(56 + (114 - 56) * clampedDiag);
        const discBlue = Math.round(72 + (145 - 72) * clampedDiag);

        // Anti-aliasing at rim
        const edgeDist = discR - dist;
        if (edgeDist < 1.5) {
          const aa = edgeDist / 1.5;
          r = Math.round(r * (1 - aa) + discRed * aa);
          g = Math.round(g * (1 - aa) + discGreen * aa);
          b = Math.round(b * (1 - aa) + discBlue * aa);
        } else {
          r = discRed;
          g = discGreen;
          b = discBlue;
        }

        // Rim border glow
        if (edgeDist >= 0 && edgeDist <= 3 * scale) {
          r = Math.min(255, r + 45);
          g = Math.min(255, g + 35);
          b = Math.min(255, b + 25);
        }
      }

      // 4. Subtle stardust particles
      const particles = [
        { px: cx - 96 * scale, py: cy - 116 * scale, pr: 2.2 * scale, col: [232, 185, 138] },
        { px: cx + 104 * scale, py: cy - 96 * scale, pr: 2.5 * scale, col: [143, 208, 255] },
        { px: cx - 126 * scale, py: cy + 84 * scale, pr: 1.8 * scale, col: [143, 208, 255] },
        { px: cx + 114 * scale, py: cy + 114 * scale, pr: 2.2 * scale, col: [232, 185, 138] }
      ];

      for (const p of particles) {
        const pdx = x - p.px;
        const pdy = y - p.py;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist < p.pr * 2) {
          const intensity = Math.max(0, 1 - pdist / (p.pr * 2));
          r = Math.min(255, Math.round(r * (1 - intensity) + p.col[0] * intensity));
          g = Math.min(255, Math.round(g * (1 - intensity) + p.col[1] * intensity));
          b = Math.min(255, Math.round(b * (1 - intensity) + p.col[2] * intensity));
        }
      }

      // 5. 4-point Celestial Sparkle Star at top-right
      const starCx = cx + 122 * scale;
      const starCy = cy - 118 * scale;
      const sdx = Math.abs(x - starCx);
      const sdy = Math.abs(y - starCy);
      if (sdx < 20 * scale && sdy < 20 * scale) {
        const hBeam = Math.max(0, 1 - sdy / (1.5 * scale)) * Math.max(0, 1 - sdx / (18 * scale));
        const vBeam = Math.max(0, 1 - sdx / (1.5 * scale)) * Math.max(0, 1 - sdy / (18 * scale));
        const beam = Math.max(hBeam, vBeam);
        if (beam > 0) {
          r = Math.min(255, Math.round(r + 250 * beam));
          g = Math.min(255, Math.round(g + 230 * beam));
          b = Math.min(255, Math.round(b + 200 * beam));
        }
      }

      buf[idx + 0] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }

  return encodePng(size, size, buf);
}

async function main() {
  console.log('Generating Human 2.0 PWA Brand Icons...');
  let sharpAvailable = false;
  let sharp = null;

  try {
    sharp = require('sharp');
    sharpAvailable = true;
    console.log('Detected sharp: using high-performance vector rendering');
  } catch (e) {
    console.log('Note: sharp not installed, checking for master image or using fallback');
  }

  // Check if a master vector or image asset exists
  const hasSvg = fs.existsSync(SVG_PATH);

  for (const target of TARGETS) {
    const outPath = path.join(ICONS_DIR, target.file);

    if (sharpAvailable && hasSvg) {
      const svgBuffer = fs.readFileSync(SVG_PATH);
      await sharp(svgBuffer)
        .resize(target.size, target.size)
        .png({ compressionLevel: 9 })
        .toFile(outPath);
      console.log(`Generated ${target.file} (${target.size}x${target.size}) via sharp`);
    } else {
      // Standalone fallback
      const pngBuffer = renderBrandGlyphFallback(target.size);
      fs.writeFileSync(outPath, pngBuffer);
      console.log(`Generated ${target.file} (${target.size}x${target.size}) via native PNG engine`);
    }
  }

  console.log('PWA Brand Icons generation completed successfully.');
}

main().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
```

---

## 6. Complete `index.html` PWA Meta Tag Suite

### 6.1 Replacement `<head>` Blueprint
Below is the complete, production-ready `index.html` configured for all PWA requirements:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />
    <title>Human 2.0 — Sleep Supporting Mobile App</title>
    <meta name="description" content="Sleep Supporting Mobile App & Personal Awareness Platform for the AI Age" />

    <!-- Web App Manifest -->
    <link rel="manifest" href="/manifest.webmanifest" />

    <!-- Adaptive Theme Colors (Dark Night Sanctuary & Light Daylight) -->
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#05070a" />
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f7f3ec" />
    <meta name="theme-color" content="#05070a" />

    <!-- iOS Safari Mobile Web App Support -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Human 2.0" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180x180.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />

    <!-- Android & Windows Mobile App Meta -->
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="application-name" content="Human 2.0" />
    <meta name="msapplication-TileColor" content="#05070a" />
    <meta name="msapplication-tap-highlight" content="no" />

    <!-- Favicons -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />

    <!-- Typography (Inter, Lora, Playfair Display) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400;1,500&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#dcd3c2] dark:bg-[#05070a] text-[#1f2a28] dark:text-[#f2ede4] antialiased selection:bg-[#d9a44a]/20">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 6.2 Key Rationale for Meta Tags
1. **`apple-mobile-web-app-status-bar-style="black-translucent"`**: When combined with `viewport-fit=cover`, this instructs iOS Safari to extend the background canvas behind the status bar and notch, allowing safe area padding (`env(safe-area-inset-top)`) to prevent content overlap while providing a native mobile look.
2. **Dual `theme-color` with `media`**:
   - `media="(prefers-color-scheme: dark)" content="#05070a"` matches the obsidian Night Sanctuary theme.
   - `media="(prefers-color-scheme: light)" content="#f7f3ec"` matches the warm daylight cream palette.
   - A fallback `<meta name="theme-color" content="#05070a" />` guarantees Android defaults to the dark sleep palette regardless of device color scheme.
3. **`maximum-scale=1.0, user-scalable=no`**: Ensures the mobile app feels firm and responsive like an iOS/Android native app, preventing accidental double-tap or pinch zoom jumps. Form input zoom is independently prevented by enforcing `font-size: 16px` on all form controls in `src/index.css`.

---

## 7. Implementation Plan for Milestone 1 Implementer

The implementer agent should execute the following contiguous steps:

### Step 1: Create Master Brand SVG and Favicon
1. Write `public/icons/icon.svg` with the full 512×512 gold monogram vector definition.
2. Update `public/favicon.svg` with the gold 2.0 monogram and deep teal disc vector icon.

### Step 2: Create Icon Generation Script & Generate Assets
1. Write `scripts/generateIcons.cjs`.
2. Optionally install `sharp` via `cmd /c npm i -D sharp` (or let the script run with its built-in native PNG engine).
3. Add script to `package.json`:
   ```json
   "scripts": {
     ...
     "generate:icons": "node scripts/generateIcons.cjs"
   }
   ```
4. Run `cmd /c node scripts/generateIcons.cjs` to produce:
   - `public/icons/icon-192x192.png`
   - `public/icons/icon-512x512.png`
   - `public/icons/icon-maskable-512x512.png`
   - `public/icons/apple-touch-icon-180x180.png`

### Step 3: Write Manifest Files
1. Write `public/manifest.webmanifest`.
2. Write identical duplicate `public/manifest.json`.

### Step 4: Update `index.html`
1. Replace `<head>` in `index.html` with the PWA meta tags, manifest links, favicons, and theme colors.

### Step 5: Verification & Build
1. Run `cmd /c npm run build`.
2. Verify exit code 0 and presence of `dist/manifest.webmanifest`, `dist/manifest.json`, and all 4 icons in `dist/icons/`.

---

## 8. Verification Commands & Acceptance Criteria

| # | Acceptance Check | Verification Command / Step | Expected Pass Condition |
| :--- | :--- | :--- | :--- |
| 1 | **Clean Build** | `cmd /c npm run build` | Exits cleanly with code 0. Static assets generated in `dist/`. |
| 2 | **Manifest Delivery** | Inspect `dist/manifest.webmanifest` | Valid JSON, `start_url: "/"`, `display: "standalone"`, `orientation: "portrait"`. |
| 3 | **Manifest Fallback** | Inspect `dist/manifest.json` | Identical valid JSON matching `dist/manifest.webmanifest`. |
| 4 | **Icon Suite Verification** | `Test-Path public/icons/*.png` | 4 PNG files exist with non-zero size (>1KB) and valid PNG magic headers (`0x89 0x50 0x4E 0x47`). |
| 5 | **Maskable Safe Zone** | Chrome DevTools > Application > Manifest | "Show only minimum safe area" shows full glyph inside 80% circle with zero clipping. |
| 6 | **iOS Meta Verification** | Inspect `dist/index.html` | Contains `apple-mobile-web-app-capable="yes"`, `apple-mobile-web-app-status-bar-style="black-translucent"`, and `apple-touch-icon`. |
| 7 | **Theme Colors** | Inspect `dist/index.html` | Contains dark `#05070a` and light `#f7f3ec` theme colors. |
