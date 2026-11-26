/**
 * Turns an API failure into a message the Super Admin can act on.
 *
 * The admin portal used to report every failure as "Is the API running?", which
 * hid 400 validation errors, 404 configuration gaps and server errors behind a
 * connectivity claim. Each class of failure now gets its own wording; nothing
 * here exposes stack traces, request internals or credentials.
 */

export interface ApiErrorOptions {
  /** Replaces the generic message for HTTP 404 (e.g. "settings were never seeded"). */
  notFound?: string;
  /** Replaces the generic message for HTTP 400. */
  badRequest?: string;
}

const MAX_DETAIL_LENGTH = 160;

function statusOf(error: unknown): number | null {
  if (typeof error !== 'object' || error === null) return null;
  const status = (error as { statusCode?: unknown }).statusCode;
  return typeof status === 'number' && Number.isInteger(status) ? status : null;
}

function messageOf(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) return null;
  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' && message.trim() ? message.trim() : null;
}

function detailSuffix(error: unknown): string {
  const message = messageOf(error);
  if (!message || message.length > MAX_DETAIL_LENGTH) return '';
  return `: ${message}`;
}

/** A rejected `fetch` surfaces as a TypeError, not as an HTTP status. */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (typeof error === 'object' && error !== null) {
    const name = (error as { name?: unknown }).name;
    if (name === 'TypeError') return true;
  }
  return false;
}

export function describeApiError(error: unknown, options: ApiErrorOptions = {}): string {
  const status = statusOf(error);

  if (status !== null) {
    switch (status) {
      case 400:
        return options.badRequest ?? `The server rejected the submitted values${detailSuffix(error)}.`;
      case 401:
        return 'Your session has expired. Sign in again and retry.';
      case 403:
        return 'Your account is not allowed to perform this action.';
      case 404:
        return options.notFound ?? 'The requested record was not found.';
      case 409:
        return 'That change conflicts with an existing record.';
      case 429:
        return 'Too many requests. Wait a moment and try again.';
      default:
        if (status >= 500) {
          return `The API is reachable but returned a server error (${status}). This is a server-side failure, not a connection problem.`;
        }
        return `The API rejected the request (HTTP ${status}).`;
    }
  }

  if (isNetworkError(error)) {
    return 'Could not reach the API. Check your connection and try again.';
  }

  return 'Something went wrong. Try again, and check the API logs if it keeps happening.';
}
