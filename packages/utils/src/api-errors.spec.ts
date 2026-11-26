import { describe, expect, it } from 'vitest';
import { describeApiError, isNetworkError } from './api-errors';

class FakeApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

describe('describeApiError', () => {
  it('reports an expired session for 401 instead of a connectivity problem', () => {
    const message = describeApiError(new FakeApiError(401, 'Invalid or expired token'));
    expect(message).toMatch(/session has expired/i);
    expect(message).not.toMatch(/API is running/i);
    expect(message).not.toMatch(/reach the API/i);
  });

  it('reports a permission problem for 403', () => {
    expect(describeApiError(new FakeApiError(403, 'Forbidden'))).toMatch(/not allowed/i);
  });

  it('reports a missing record for 404 and accepts a specific explanation', () => {
    expect(describeApiError(new FakeApiError(404, 'Not found'))).toMatch(/not found/i);

    const settingsMessage = describeApiError(new FakeApiError(404, 'Not found'), {
      notFound: 'Site settings have not been created on the server yet.',
    });
    expect(settingsMessage).toMatch(/have not been created/i);
    expect(settingsMessage).not.toMatch(/reach the API/i);
  });

  it('surfaces the validation detail for 400', () => {
    const message = describeApiError(new FakeApiError(400, 'repositoryUrl: Invalid url'));
    expect(message).toMatch(/rejected the submitted values/i);
    expect(message).toContain('repositoryUrl: Invalid url');
  });

  it('says the API is reachable for 5xx instead of blaming connectivity', () => {
    const message = describeApiError(new FakeApiError(500, 'Internal server error'));
    expect(message).toMatch(/API is reachable/i);
    expect(message).toMatch(/server error \(500\)/i);
    expect(message).not.toMatch(/Is the API running/i);
  });

  it('reports a network failure when fetch itself rejects', () => {
    const message = describeApiError(new TypeError('Failed to fetch'));
    expect(message).toMatch(/Could not reach the API/i);
    expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true);
  });

  it('falls back safely for unknown errors without leaking internals', () => {
    const message = describeApiError(new Error('boom at /srv/app/dist/main.js:42'));
    expect(message).not.toContain('/srv/app');
    expect(message).not.toContain('undefined');
    expect(message.length).toBeGreaterThan(0);
  });

  it('never mentions stack frames or secrets', () => {
    const messages = [
      describeApiError(new FakeApiError(400, 'bad')),
      describeApiError(new FakeApiError(401, 'bad')),
      describeApiError(new FakeApiError(403, 'bad')),
      describeApiError(new FakeApiError(404, 'bad')),
      describeApiError(new FakeApiError(500, 'bad')),
      describeApiError(new TypeError('Failed to fetch')),
      describeApiError('nonsense'),
    ];

    for (const message of messages) {
      expect(message).not.toMatch(/at \w+ \(/);
      expect(message).not.toMatch(/postgres:\/\//);
      expect(message).not.toMatch(/prisma/i);
    }
  });
});
