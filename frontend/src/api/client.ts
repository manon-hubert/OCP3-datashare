import createClient from 'openapi-fetch';
import type { paths } from './schema';

export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL as string,
});

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

apiClient.use({
  async onRequest({ request }) {
    const token = localStorage.getItem('access_token');
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response, request }) {
    if (response.status === 401 && unauthorizedHandler && !request.url.endsWith('/auth/login')) {
      unauthorizedHandler();
    }
    return response;
  },
});
