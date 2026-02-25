import { apiClient } from './client';

export async function register(email: string, password: string): Promise<void> {
  const { error } = await apiClient.POST('/users', {
    body: { email, password },
  });
  if (error) {
    throw error;
  }
}
