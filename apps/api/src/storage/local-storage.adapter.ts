import { createHmac, randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, normalize, resolve, sep } from 'node:path';
import type { PutObjectInput, StorageAdapter, StorageClass, StoredObject } from './storage.types';

/**
 * Local-disk adapter for development and single-node deployments.
 * Objects live outside the web root; private objects are only ever served
 * through the authenticated download endpoint, never a static path.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private readonly root: string;
  private readonly publicBaseUrl: string;
  private readonly signingSecret: string;

  constructor(options: { root: string; publicBaseUrl: string; signingSecret: string }) {
    this.root = resolve(options.root);
    this.publicBaseUrl = options.publicBaseUrl.replace(/\/$/, '');
    this.signingSecret = options.signingSecret;
  }

  private absolutePath(key: string): string {
    const normalized = normalize(key).replace(/^([/\\])+/, '');
    if (!normalized || normalized === '..' || normalized.startsWith(`..${sep}`)) {
      throw new Error('Refusing to write outside the storage root');
    }
    const full = resolve(this.root, normalized);
    if (full !== this.root && !full.startsWith(this.root + sep)) {
      throw new Error('Refusing to write outside the storage root');
    }
    return full;
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    const target = this.absolutePath(input.key);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, input.body);
    return { key: input.key, size: input.body.byteLength, contentType: input.contentType };
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(this.absolutePath(key));
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') throw error;
    }
  }

  async get(key: string): Promise<Buffer> {
    return readFile(this.absolutePath(key));
  }

  async url(key: string, storageClass: StorageClass): Promise<string> {
    if (storageClass === 'PUBLIC') {
      return `${this.publicBaseUrl}/${key}`;
    }
    return this.signedUrl(key, 300);
  }

  /**
   * Deterministic, expiring signature. The API verifies it before serving a
   * private object, so a leaked URL stops working when it expires.
   */
  signedUrl(key: string, ttlSeconds: number): string {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    const signature = createHmac('sha256', this.signingSecret).update(`${key}:${expires}`).digest('hex');
    const params = new URLSearchParams({ expires: String(expires), signature });
    return `${this.publicBaseUrl}/${key}?${params.toString()}`;
  }

  verifySignedUrl(key: string, expires: number, signature: string): boolean {
    if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
    const expected = createHmac('sha256', this.signingSecret).update(`${key}:${expires}`).digest('hex');
    return expected === signature;
  }

  buildKey(prefix: string, filename: string): string {
    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')).toLowerCase() : '';
    return `${prefix}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${ext}`;
  }
}
