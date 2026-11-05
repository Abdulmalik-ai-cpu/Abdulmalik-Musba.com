import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { UploadValidator } from './upload-validator';

function file(name: string, mime: string, bytes: number[]) {
  const buffer = Buffer.from(bytes);
  return { originalname: name, mimetype: mime, size: buffer.length, buffer };
}

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d];

describe('UploadValidator', () => {
  const validator = new UploadValidator();

  it('accepts a PNG whose magic bytes match its extension', () => {
    const result = validator.validate(file('photo.png', 'image/png', PNG));
    expect(result.extension).toBe('.png');
    expect(result.mimeType).toBe('image/png');
    expect(result.safeFilename).toMatch(/^[a-f0-9]{32}\.png$/);
  });

  it('rebuilds the filename from a content hash instead of trusting the client', () => {
    const result = validator.validate(file('../../etc/passwd.png', 'image/png', PNG));
    expect(result.safeFilename).not.toContain('passwd');
    expect(result.safeFilename).not.toContain('/');
  });

  it('rejects an extension that is not on the allow-list', () => {
    expect(() => validator.validate(file('payload.exe', 'application/octet-stream', [0x4d, 0x5a]))).toThrow(
      BadRequestException,
    );
  });

  it('rejects a declared MIME type that disagrees with the extension', () => {
    expect(() => validator.validate(file('photo.png', 'image/jpeg', PNG))).toThrow(BadRequestException);
  });

  it('rejects a file whose bytes do not match a binary extension', () => {
    // A PDF named .png: extension allows image/png, magic bytes say application/pdf.
    expect(() => validator.validate(file('sneaky.png', 'image/png', PDF))).toThrow(BadRequestException);
  });

  it('rejects empty files', () => {
    expect(() => validator.validate(file('empty.png', 'image/png', []))).toThrow(BadRequestException);
  });

  it('accepts a JPEG by magic bytes', () => {
    expect(validator.validate(file('shot.jpg', 'image/jpeg', JPEG)).extension).toBe('.jpg');
  });
});
