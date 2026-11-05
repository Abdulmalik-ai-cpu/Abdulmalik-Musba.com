/**
 * Storage abstraction (ADR-005).
 * Domain code depends on this interface, never on a provider SDK, so the
 * backing store can move from local disk to any S3-compatible endpoint
 * (Supabase Storage, MinIO, R2) without touching callers.
 */

export type StorageClass = 'PUBLIC' | 'PRIVATE' | 'ADMIN_ONLY';

export interface PutObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
  storageClass: StorageClass;
}

export interface StoredObject {
  key: string;
  size: number;
  contentType: string;
}

export interface StorageAdapter {
  /** Persist an object. Returns the storage key and byte size. */
  put(input: PutObjectInput): Promise<StoredObject>;

  /** Remove an object. Must be idempotent for a missing key. */
  delete(key: string): Promise<void>;

  /** Read an object's bytes. Used for private, authorized downloads. */
  get(key: string): Promise<Buffer>;

  /**
   * A URL a browser can use. Public objects return a stable URL; private
   * objects return a short-lived signed URL so they are never permanently
   * reachable (§16, §143.22).
   */
  url(key: string, storageClass: StorageClass): Promise<string>;
}

export const STORAGE_ADAPTER = Symbol('STORAGE_ADAPTER');
