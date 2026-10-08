// Helper for PNG binary validation and header parsing

export interface PngMetadata {
  isValid: boolean;
  width: number;
  height: number;
  aspectRatio: number;
  bitDepth: number;
  colorType: number;
  error?: string;
}

export const PNG_MAGIC_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function parsePngHeader(buffer: Buffer): PngMetadata {
  if (buffer.length < 24) {
    return {
      isValid: false,
      width: 0,
      height: 0,
      aspectRatio: 0,
      bitDepth: 0,
      colorType: 0,
      error: 'Buffer too short for PNG header (< 24 bytes)',
    };
  }

  // Validate 8-byte PNG signature
  if (!buffer.subarray(0, 8).equals(PNG_MAGIC_BYTES)) {
    return {
      isValid: false,
      width: 0,
      height: 0,
      aspectRatio: 0,
      bitDepth: 0,
      colorType: 0,
      error: 'Invalid PNG signature bytes',
    };
  }

  // Verify IHDR chunk marker at byte 12
  const chunkType = buffer.subarray(12, 16).toString('ascii');
  if (chunkType !== 'IHDR') {
    return {
      isValid: false,
      width: 0,
      height: 0,
      aspectRatio: 0,
      bitDepth: 0,
      colorType: 0,
      error: `Expected IHDR chunk marker at offset 12, got: ${chunkType}`,
    };
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const bitDepth = buffer.readUInt8(24);
  const colorType = buffer.readUInt8(25);

  const aspectRatio = height === 0 ? 0 : width / height;

  return {
    isValid: true,
    width,
    height,
    aspectRatio,
    bitDepth,
    colorType,
  };
}

/**
 * Creates a minimal valid PNG buffer with specified dimensions for testing / oracle verification
 */
export function createMockPng(width: number, height: number): Buffer {
  const buf = Buffer.alloc(33);
  // PNG signature
  PNG_MAGIC_BYTES.copy(buf, 0);
  // IHDR length: 13 bytes
  buf.writeUInt32BE(13, 8);
  // IHDR type
  buf.write('IHDR', 12, 'ascii');
  // Dimensions
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  // Bit depth 8, Color type 6 (RGBA)
  buf.writeUInt8(8, 24);
  buf.writeUInt8(6, 25);
  // Compression 0, Filter 0, Interlace 0
  buf.writeUInt8(0, 26);
  buf.writeUInt8(0, 27);
  buf.writeUInt8(0, 28);
  // CRC dummy
  buf.writeUInt32BE(0x12345678, 29);
  return buf;
}
