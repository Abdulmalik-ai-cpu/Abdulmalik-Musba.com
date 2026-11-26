import { describe, expect, it } from 'vitest';
import { ApiClient, ApiError } from '@portfolio/api-client';
import { describeApiError } from '@portfolio/utils';

/**
 * Regression coverage for how the shared client turns a real HTTP failure into an
 * `ApiError`.
 *
 * The API's `ZodValidationPipe` throws `new BadRequestException({ code, message,
 * details })`. Nest returns an object-bodied exception verbatim, so a 400
 * validation response has **no `statusCode` field** even though every
 * string-bodied exception does. The client must therefore fall back to the HTTP
 * status, or `describeApiError` cannot classify the most common admin failure.
 *
 * No network is touched: every `fetchImpl` below is a stub.
 */

/** The body the API actually sends for a Zod validation failure. */
const VALIDATION_BODY = {
  code: 'VALIDATION_ERROR',
  message: 'repositoryUrl: Invalid url',
  details: [{ path: 'repositoryUrl', message: 'Invalid url' }],
};

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

function unparsableResponse(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      throw new SyntaxError('Unexpected token < in JSON at position 0');
    },
  } as unknown as Response;
}

function clientReturning(response: Response): ApiClient {
  return new ApiClient({
    baseUrl: 'http://localhost:3001/api',
    fetchImpl: (async () => response) as unknown as typeof fetch,
  });
}

async function rejectionOf(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error('Expected the client to reject, but it resolved.');
}

describe('ApiClient — error status', () => {
  it('classifies a real Zod validation 400 as a 400 even though the body has no statusCode', async () => {
    // Guard the fixture: the whole point is that this body omits statusCode.
    expect(VALIDATION_BODY).not.toHaveProperty('statusCode');

    const client = clientReturning(jsonResponse(400, VALIDATION_BODY));
    const error = await rejectionOf(client.admin.projects.create({ title: 'x' }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('repositoryUrl: Invalid url');
  });

  it('renders the validation detail for that error instead of the generic fallback', async () => {
    const client = clientReturning(jsonResponse(400, VALIDATION_BODY));
    const error = await rejectionOf(client.admin.projects.create({ title: 'x' }));

    const message = describeApiError(error);

    expect(message).toBe(
      'The server rejected the submitted values: repositoryUrl: Invalid url.',
    );
    expect(message).not.toContain('Something went wrong');
  });

  it('keeps the statusCode an exception body does provide', async () => {
    // UnauthorizedException('...') produces a string-bodied response, which does
    // include statusCode. The fallback must not override it.
    const client = clientReturning(
      jsonResponse(401, {
        statusCode: 401,
        code: 'HTTP_EXCEPTION',
        message: 'Invalid or expired token',
      }),
    );
    const error = await rejectionOf(client.admin.projects.create({ title: 'x' }));

    expect(error.statusCode).toBe(401);
    expect(describeApiError(error)).toContain('session has expired');
  });

  it('falls back to the HTTP status when the response body is not JSON', async () => {
    const client = clientReturning(unparsableResponse(502));
    const error = await rejectionOf(client.admin.projects.create({ title: 'x' }));

    expect(error.statusCode).toBe(502);
    expect(error.code).toBe('UNKNOWN_ERROR');
    expect(describeApiError(error)).toContain('server error (502)');
  });

  it('returns the parsed body on success and undefined on 204', async () => {
    const created = clientReturning(jsonResponse(201, { id: 'p1', title: 'x' }));
    await expect(created.admin.projects.create({ title: 'x' })).resolves.toEqual({
      id: 'p1',
      title: 'x',
    });

    const deleted = clientReturning(jsonResponse(204, null));
    await expect(deleted.admin.projects.remove('p1')).resolves.toBeUndefined();
  });
});
