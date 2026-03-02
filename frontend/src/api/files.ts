import { apiClient } from './client';
import type { components } from './schema';

export type UploadedFile = components['schemas']['UploadedFile'];

export async function uploadFile(file: File): Promise<UploadedFile> {
  const { data, error } = await apiClient.POST('/files', {
    body: { file },
    bodySerializer(body) {
      const form = new FormData();
      form.append('file', body.file as Blob);
      return form;
    },
  });

  if (error) throw error;
  return data!;
}
