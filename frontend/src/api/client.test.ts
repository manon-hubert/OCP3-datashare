import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, setUnauthorizedHandler } from './client';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  setUnauthorizedHandler(vi.fn());
});

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('request middleware', () => {
  it('attaches Bearer token from localStorage when present', async () => {
    localStorage.setItem('access_token', 'my-token');
    const fetchMock = stubFetch(new Response('[]', { status: 200 }));

    await apiClient.GET('/files', { params: { query: { filter: 'all' } } });

    const req = fetchMock.mock.calls[0][0] as Request;
    expect(req.headers.get('Authorization')).toBe('Bearer my-token');
  });

  it('omits Authorization header when no token in localStorage', async () => {
    const fetchMock = stubFetch(new Response('[]', { status: 200 }));

    await apiClient.GET('/files', { params: { query: { filter: 'all' } } });

    const req = fetchMock.mock.calls[0][0] as Request;
    expect(req.headers.get('Authorization')).toBeNull();
  });
});

describe('response middleware', () => {
  it('calls the unauthorized handler on 401', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    stubFetch(new Response('{}', { status: 401 }));

    await apiClient.GET('/files', { params: { query: { filter: 'all' } } });

    expect(handler).toHaveBeenCalledOnce();
  });

  it('does NOT call the unauthorized handler on 401 for /auth/login', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    stubFetch(new Response('{}', { status: 401 }));

    await apiClient.POST('/auth/login', { body: { email: 'a@b.com', password: 'pass' } });

    expect(handler).not.toHaveBeenCalled();
  });
});
