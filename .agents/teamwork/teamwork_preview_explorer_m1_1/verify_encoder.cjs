const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Pure Node.js PNG Encoder (zero external dependencies)
function encodePng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(typeStr, data) {
    const typeBuf = Buffer.from(typeStr, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const typeAndData = Buffer.concat([typeBuf, data]);
    const crc = zlib.crc32(typeAndData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([lenBuf, typeAndData, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

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

console.log('encodePng ready');
