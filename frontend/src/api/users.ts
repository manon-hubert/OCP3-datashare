import { apiClient } from './client';

export async function register(email: string, password: string): Promise<void> {
  const { error } = await apiClient.POST('/auth/register', {
    body: { email, password },
  });
  if (error) {
    throw error;
  }
}

export async function login(email: string, password: string): Promise<string> {
  const { data, error } = await apiClient.POST('/auth/login', {
    body: { email, password },
  });
  if (error) {
    throw error;
  }
  return data!.access_token;
}
