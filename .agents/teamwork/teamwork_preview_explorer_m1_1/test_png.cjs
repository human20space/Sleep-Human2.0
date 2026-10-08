const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, rgbaBuffer) {
  // 1. Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // Helper to build chunk: length (4) + type (4) + data + crc (4)
  function createChunk(typeStr, data) {
    const typeBuf = Buffer.from(typeStr, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const typeAndData = Buffer.concat([typeBuf, data]);
    const crcVal = zlib.crc32(typeAndData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);

    return Buffer.concat([lenBuf, typeAndData, crcBuf]);
  }

  // 2. IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // 3. IDAT: Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let scanlineOffset = 0;
  let rgbaOffset = 0;

  for (let y = 0; y < height; y++) {
    scanlines[scanlineOffset++] = 0; // Filter 0 (None)
    rgbaBuffer.copy(scanlines, scanlineOffset, rgbaOffset, rgbaOffset + width * 4);
    scanlineOffset += width * 4;
    rgbaOffset += width * 4;
  }

  const compressedData = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressedData);

  // 4. IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Test: 16x16 red image
const testBuf = Buffer.alloc(16 * 16 * 4);
for (let i = 0; i < 16 * 16; i++) {
  testBuf[i * 4 + 0] = 255; // R
  testBuf[i * 4 + 1] = 0;   // G
  testBuf[i * 4 + 2] = 0;   // B
  testBuf[i * 4 + 3] = 255; // A
}

const png = createPng(16, 16, testBuf);
const outPath = path.join(__dirname, 'test_sample.png');
fs.writeFileSync(outPath, png);
console.log('PNG written successfully, size:', png.length, 'bytes');
