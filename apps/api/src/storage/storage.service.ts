import { Injectable, Logger } from '@nestjs/common';
import { loadApiConfig } from '@portfolio/config';
import { randomUUID } from 'node:crypto';
import { LocalStorageAdapter } from './local-storage.adapter';
import { S3StorageAdapter } from './s3-storage.adapter';
import type { StorageAdapter, StorageClass } from './storage.types';

/**
 * Chooses a storage adapter from configuration and exposes a provider-neutral
 * API to the rest of the application (ADR-005).
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly adapter: StorageAdapter;

  constructor() {
    this.adapter = StorageService.createAdapter();
  }

  private static createAdapter(): StorageAdapter {
    const config = loadApiConfig();
    const hasS3 =
      config.storageBucket && config.storageAccessKey && config.storageSecretKey;

    if (hasS3) {
      return new S3StorageAdapter({
        endpoint: config.storageEndpoint,
        region: config.storageRegion ?? 'auto',
        bucket: config.storageBucket as string,
        accessKeyId: config.storageAccessKey as string,
        secretAccessKey: config.storageSecretKey as string,
        publicBaseUrl: config.storagePublicBaseUrl,
      });
    }

    return new LocalStorageAdapter({
      root: config.storageLocalRoot,
      publicBaseUrl: config.storagePublicBaseUrl ?? `${config.apiOrigin}/api/media/public`,
      signingSecret: config.jwtSecret,
    });
  }

  buildKey(prefix: string, filename: string): string {
    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')).toLowerCase() : '';
    return `${prefix}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${ext}`;
  }

  put(key: string, body: Buffer, contentType: string, storageClass: StorageClass) {
    return this.adapter.put({ key, body, contentType, storageClass });
  }

  delete(key: string) {
    return this.adapter.delete(key);
  }

  get(key: string) {
    return this.adapter.get(key);
  }

  url(key: string, storageClass: StorageClass) {
    return this.adapter.url(key, storageClass);
  }

  /** Exposed for the private-download endpoint when the local adapter is active. */
  localAdapter(): LocalStorageAdapter | null {
    return this.adapter instanceof LocalStorageAdapter ? this.adapter : null;
  }

  describeProvider(): string {
    return this.adapter instanceof LocalStorageAdapter ? 'local' : 's3';
  }
}
