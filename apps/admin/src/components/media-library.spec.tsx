import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { api } from '@/lib/api';
import type { Media } from '@portfolio/types';
import { MediaLibrary } from './media-library';

vi.mock('@/lib/api', () => ({
  api: {
    admin: {
      media: {
        list: vi.fn(),
        upload: vi.fn(),
        url: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
      },
    },
  },
  setAuthToken: vi.fn(),
  getAuthToken: vi.fn(() => null),
  API_URL: 'http://localhost:3001/api',
}));

const mediaApi = api.admin.media as unknown as Record<'list' | 'url' | 'remove', Mock>;

const asset: Media = {
  id: 'media-1',
  filename: 'headshot.png',
  originalName: 'headshot.png',
  storageKey: 'media/headshot.png',
  mimeType: 'image/png',
  size: 2048,
  url: null,
  altText: 'Portrait',
  caption: null,
  type: 'IMAGE',
  storageClass: 'PRIVATE',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const SIGNED_URL = 'https://cdn.example/headshot.png?token=abc';

const writeText = vi.fn();

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode });
}

async function renderLibrary() {
  mediaApi.list.mockResolvedValue([asset]);
  render(<MediaLibrary />);
  await screen.findByText('headshot.png');
}

function copyLink() {
  fireEvent.click(screen.getByRole('button', { name: /^link$/i }));
}

beforeEach(() => {
  vi.clearAllMocks();
  writeText.mockReset();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
});

describe('MediaLibrary — copying a link', () => {
  it('generates a link and copies it to the clipboard', async () => {
    await renderLibrary();
    mediaApi.url.mockResolvedValue({ url: SIGNED_URL });
    writeText.mockResolvedValue(undefined);

    copyLink();

    await screen.findByText('Link copied to clipboard.');
    expect(mediaApi.url).toHaveBeenCalledWith('media-1');
    expect(writeText).toHaveBeenCalledWith(SIGNED_URL);
    expect(screen.queryByText(/did not allow copying/i)).toBeNull();
  });

  it('reports an API failure when the link cannot be generated', async () => {
    await renderLibrary();
    mediaApi.url.mockRejectedValue(httpError(500, 'Internal server error'));

    copyLink();

    const message = await screen.findByText(/server error \(500\)/);
    expect(message.textContent).toContain('not a connection problem');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('reports a clipboard permission failure without blaming the API', async () => {
    await renderLibrary();
    mediaApi.url.mockResolvedValue({ url: SIGNED_URL });
    writeText.mockRejectedValue(
      Object.assign(new Error('Write permission denied.'), { name: 'NotAllowedError' }),
    );

    copyLink();

    const message = await screen.findByText(/did not allow copying it to the clipboard/i);
    expect(message.textContent).toContain('Grant clipboard access');
  });

  it('does not show an API error or a success notice when only the clipboard fails', async () => {
    await renderLibrary();
    mediaApi.url.mockResolvedValue({ url: SIGNED_URL });
    writeText.mockRejectedValue(
      Object.assign(new Error('Write permission denied.'), { name: 'NotAllowedError' }),
    );

    copyLink();

    await screen.findByText(/did not allow copying it to the clipboard/i);
    expect(screen.queryByText(/Could not reach the API/i)).toBeNull();
    expect(screen.queryByText(/server error/i)).toBeNull();
    expect(screen.queryByText(/check the API logs/i)).toBeNull();
    expect(screen.queryByText('Link copied to clipboard.')).toBeNull();
  });
});
