import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { PutObjectInput, StorageAdapter, StorageClass, StoredObject } from './storage.types';

export interface S3AdapterOptions {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Public CDN/base URL. When unset, public objects are served via a signed URL. */
  publicBaseUrl?: string;
  forcePathStyle?: boolean;
}

/**
 * S3-compatible adapter (ADR-005).
 * Works against Supabase Storage, MinIO, Cloudflare R2, or AWS S3 by
 * configuration alone — the endpoint is the only difference.
 */
export class S3StorageAdapter implements StorageAdapter {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;

  constructor(options: S3AdapterOptions) {
    this.bucket = options.bucket;
    this.publicBaseUrl = options.publicBaseUrl?.replace(/\/$/, '');
    this.client = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      forcePathStyle: options.forcePathStyle ?? Boolean(options.endpoint),
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        ContentLength: input.body.byteLength,
      }),
    );
    return { key: input.key, size: input.body.byteLength, contentType: input.contentType };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async get(key: string): Promise<Buffer> {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    const bytes = await result.Body?.transformToByteArray();
    if (!bytes) throw new Error(`Object ${key} returned no body`);
    return Buffer.from(bytes);
  }

  async url(key: string, storageClass: StorageClass): Promise<string> {
    if (storageClass === 'PUBLIC' && this.publicBaseUrl) {
      return `${this.publicBaseUrl}/${key}`;
    }
    // Private objects (and public objects without a CDN) use a short-lived URL.
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: 300,
    });
  }
}
