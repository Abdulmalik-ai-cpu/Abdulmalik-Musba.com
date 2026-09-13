import { createApiClient } from '@portfolio/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const api = createApiClient({
  baseUrl: API_URL,
});

export { api, API_URL };

export type { ApiClient } from '@portfolio/api-client';