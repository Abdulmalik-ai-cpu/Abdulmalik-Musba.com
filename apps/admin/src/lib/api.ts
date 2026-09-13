import { createApiClient } from '@portfolio/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

let token: string | null = null;

export function setAuthToken(value: string | null) {
  token = value;
  if (typeof window !== 'undefined') {
    if (value) localStorage.setItem('admin.token', value);
    else localStorage.removeItem('admin.token');
  }
}

export function getAuthToken(): string | null {
  if (token) return token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('admin.token');
  }
  return token;
}

export const api = createApiClient({
  baseUrl: API_URL,
  getToken: getAuthToken,
});

export { API_URL };