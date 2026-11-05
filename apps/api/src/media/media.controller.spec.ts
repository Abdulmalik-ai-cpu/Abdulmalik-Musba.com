import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { PATH_METADATA } from '@nestjs/common/constants';
import { MediaController } from './media.controller';

function makeRes() {
  return { setHeader: vi.fn(), send: vi.fn() };
}

function makeController(media: unknown) {
  const prisma = { media: { findFirst: vi.fn().mockResolvedValue(media) } };
  const storage = { get: vi.fn().mockResolvedValue(Buffer.from('bytes')), localAdapter: () => null };
  const controller = new MediaController(prisma as never, storage as never);
  return { controller, prisma, storage };
}

describe('MediaController route wiring', () => {
  // Regression: `public/*key` is not a valid Express 4 wildcard — path-to-regexp
  // treats it as a wildcard followed by a literal `key`, so real keys 404 and
  // keys ending in `key` crash the handler.
  it('declares the public route as a plain wildcard', () => {
    expect(Reflect.getMetadata(PATH_METADATA, MediaController.prototype.publicAsset)).toBe('public/*');
  });

  it('declares the private route as a plain wildcard', () => {
    expect(Reflect.getMetadata(PATH_METADATA, MediaController.prototype.privateAsset)).toBe('private/*');
  });
});

describe('MediaController.publicAsset', () => {
  it('streams a PUBLIC asset captured from params[0]', async () => {
    const { controller, storage } = makeController({
      storageKey: 'public/2026/photo.png',
      storageClass: 'PUBLIC',
      mimeType: 'image/png',
    });
    const res = makeRes();

    await controller.publicAsset({ params: { 0: 'public/2026/photo.png' } } as never, res as never);

    expect(storage.get).toHaveBeenCalledWith('public/2026/photo.png');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(res.send).toHaveBeenCalledWith(Buffer.from('bytes'));
  });

  it('url-decodes the captured key', async () => {
    const { controller, storage } = makeController({
      storageKey: 'public/2026/my file.png',
      storageClass: 'PUBLIC',
      mimeType: 'image/png',
    });

    await controller.publicAsset({ params: { 0: 'public/2026/my%20file.png' } } as never, makeRes() as never);

    expect(storage.get).toHaveBeenCalledWith('public/2026/my file.png');
  });

  it('does not serve a non-PUBLIC record', async () => {
    const { controller, storage } = makeController({
      storageKey: 'private/secret.pdf',
      storageClass: 'PRIVATE',
      mimeType: 'application/pdf',
    });

    await expect(
      controller.publicAsset({ params: { 0: 'private/secret.pdf' } } as never, makeRes() as never),
    ).rejects.toThrow(/not found/i);
    expect(storage.get).not.toHaveBeenCalled();
  });

  it('does not serve an unknown key', async () => {
    const { controller } = makeController(null);

    await expect(
      controller.publicAsset({ params: { 0: 'public/missing.png' } } as never, makeRes() as never),
    ).rejects.toThrow(/not found/i);
  });
});
