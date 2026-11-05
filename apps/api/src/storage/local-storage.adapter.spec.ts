import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalStorageAdapter } from './local-storage.adapter';

describe('LocalStorageAdapter', () => {
  let root: string;
  let adapter: LocalStorageAdapter;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'portfolio-storage-'));
    adapter = new LocalStorageAdapter({
      root,
      publicBaseUrl: 'https://cdn.example.com',
      signingSecret: 'test-secret',
    });
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('round-trips an object through put and get', async () => {
    const body = Buffer.from('hello world');
    await adapter.put({ key: 'docs/2026-01-01/a.txt', body, contentType: 'text/plain', storageClass: 'PUBLIC' });
    expect((await adapter.get('docs/2026-01-01/a.txt')).toString()).toBe('hello world');
  });

  it('returns a stable public URL for public objects', async () => {
    const url = await adapter.url('docs/a.txt', 'PUBLIC');
    expect(url).toBe('https://cdn.example.com/docs/a.txt');
  });

  it('returns a signed, expiring URL for private objects', async () => {
    const url = await adapter.url('private/secret.pdf', 'PRIVATE');
    expect(url).toContain('expires=');
    expect(url).toContain('signature=');

    const params = new URL(url).searchParams;
    expect(
      adapter.verifySignedUrl('private/secret.pdf', Number(params.get('expires')), params.get('signature')!),
    ).toBe(true);
  });

  it('rejects a signed URL whose key has been swapped', async () => {
    const url = await adapter.url('private/secret.pdf', 'PRIVATE');
    const params = new URL(url).searchParams;
    expect(
      adapter.verifySignedUrl('private/other.pdf', Number(params.get('expires')), params.get('signature')!),
    ).toBe(false);
  });

  it('rejects an expired signature', () => {
    const past = Math.floor(Date.now() / 1000) - 10;
    const signature = require('node:crypto')
      .createHmac('sha256', 'test-secret')
      .update(`private/secret.pdf:${past}`)
      .digest('hex');
    expect(adapter.verifySignedUrl('private/secret.pdf', past, signature)).toBe(false);
  });

  it('refuses to escape the storage root via path traversal', async () => {
    await expect(
      adapter.put({
        key: '../../escape.txt',
        body: Buffer.from('x'),
        contentType: 'text/plain',
        storageClass: 'PUBLIC',
      }),
    ).rejects.toThrow(/outside the storage root/);
  });

  it('treats deleting a missing object as a no-op', async () => {
    await expect(adapter.delete('does/not/exist.txt')).resolves.toBeUndefined();
  });
});
