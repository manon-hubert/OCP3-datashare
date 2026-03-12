import { type APIRequestContext } from '@playwright/test';

export async function registerUser(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<void> {
  const apiUrl = process.env.API_URL ?? 'http://localhost:3000';
  await request.post(`${apiUrl}/auth/register`, {
    data: { email, password },
  });
}

export async function loginUser(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<string> {
  const apiUrl = process.env.API_URL ?? 'http://localhost:3000';
  const response = await request.post(`${apiUrl}/auth/login`, {
    data: { email, password },
  });
  const body = await response.json();
  return body.access_token as string;
}
