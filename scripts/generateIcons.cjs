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

// Pure Node.js PNG encoder (zero external dependencies fallback)
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

  const hasSvg = fs.existsSync(SVG_PATH);

  for (const target of TARGETS) {
    const outPath = path.join(ICONS_DIR, target.file);

    if (sharpAvailable && hasSvg) {
      const svgBuffer = fs.readFileSync(SVG_PATH);
      await sharp(svgBuffer)
        .resize(target.size, target.size)
        .png({ compressionLevel: 9 })
        .toFile(outPath);
      const stats = fs.statSync(outPath);
      console.log(`Generated ${target.file} (${target.size}x${target.size}) via sharp (${stats.size} bytes)`);
    } else {
      const pngBuffer = renderBrandGlyphFallback(target.size);
      fs.writeFileSync(outPath, pngBuffer);
      const stats = fs.statSync(outPath);
      console.log(`Generated ${target.file} (${target.size}x${target.size}) via native PNG engine (${stats.size} bytes)`);
    }
  }

  console.log('PWA Brand Icons generation completed successfully.');
}

main().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
