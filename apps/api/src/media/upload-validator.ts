import { BadRequestException, Injectable } from '@nestjs/common';
import { loadApiConfig } from '@portfolio/config';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';

export interface ValidatedUpload {
  safeFilename: string;
  extension: string;
  mimeType: string;
  size: number;
}

/** Extensions we accept, mapped to the MIME types they must sniff as. */
const ALLOWED: Record<string, string[]> = {
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.webp': ['image/webp'],
  '.gif': ['image/gif'],
  '.svg': ['image/svg+xml'],
  '.pdf': ['application/pdf'],
  '.txt': ['text/plain'],
  '.md': ['text/markdown', 'text/plain'],
  '.csv': ['text/csv', 'text/plain'],
  '.json': ['application/json', 'text/plain'],
  '.zip': ['application/zip'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.ppt': ['application/vnd.ms-powerpoint'],
  '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  '.mp4': ['video/mp4'],
  '.webm': ['video/webm'],
  '.mp3': ['audio/mpeg'],
  '.wav': ['audio/wav'],
};

/** Magic-byte prefixes for the binary formats we accept. */
const MAGIC: Array<{ mime: string; bytes: number[] }> = [
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
  { mime: 'application/zip', bytes: [0x50, 0x4b, 0x03, 0x04] },
];

/**
 * Upload validation (§37, §140.54).
 * Filenames are discarded and rebuilt from a hash; type is checked by
 * extension allow-list and, for binary formats, by magic bytes rather than
 * trusting the client-supplied MIME type.
 */
@Injectable()
export class UploadValidator {
  private readonly maxBytes = loadApiConfig().storageMaxUploadBytes;

  validate(file: { originalname: string; mimetype: string; size: number; buffer: Buffer }): ValidatedUpload {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    if (file.size <= 0) {
      throw new BadRequestException('File is empty');
    }

    if (file.size > this.maxBytes) {
      throw new BadRequestException(
        `File exceeds the ${Math.floor(this.maxBytes / (1024 * 1024))} MB limit`,
      );
    }

    const extension = extname(file.originalname).toLowerCase();
    const allowedMimes = ALLOWED[extension];
    if (!allowedMimes) {
      throw new BadRequestException(`File type ${extension || '(none)'} is not allowed`);
    }

    const declared = (file.mimetype || '').toLowerCase();
    if (declared && !allowedMimes.includes(declared)) {
      throw new BadRequestException(`Content type ${declared} does not match extension ${extension}`);
    }

    const magic = MAGIC.find((entry) => this.matches(file.buffer, entry.bytes));
    if (magic && !allowedMimes.includes(magic.mime)) {
      throw new BadRequestException('File contents do not match its extension');
    }

    const hash = createHash('sha256').update(file.buffer).digest('hex').slice(0, 32);
    return {
      safeFilename: `${hash}${extension}`,
      extension,
      mimeType: allowedMimes[0] as string,
      size: file.size,
    };
  }

  private matches(buffer: Buffer, signature: number[]): boolean {
    if (buffer.length < signature.length) return false;
    return signature.every((byte, index) => buffer[index] === byte);
  }
}
