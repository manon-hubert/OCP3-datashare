import { apiClient } from './client';
import type { components } from './schema';

export type UploadedFile = components['schemas']['FileEntity'];
export type FileListItem = components['schemas']['FileEntity'];
export type FileHistoryItem = components['schemas']['FileHistoryEntity'];
export type FileInfo = components['schemas']['FileInfoDto'];

export async function getFileInfo(token: string): Promise<FileInfo> {
  const { data, error } = await apiClient.GET('/files/download/{token}', {
    params: { path: { token } },
  });
  if (error) throw error;
  return data!;
}

export async function uploadFile(file: File, expiresIn: number): Promise<UploadedFile> {
  const { data, error } = await apiClient.POST('/files', {
    body: { file: file as unknown as string },
    bodySerializer() {
      const form = new FormData();
      form.append('file', file);
      form.append('expiresIn', String(expiresIn));
      return form;
    },
  });

  if (error) throw error;
  return data!;
}

export async function listFiles(
  filter: 'all' | 'active' | 'expired' = 'all',
): Promise<FileListItem[]> {
  const { data, error } = await apiClient.GET('/files', {
    params: { query: { filter } },
  });
  if (error) throw error;
  return data!;
}

export async function listFileHistory(): Promise<FileHistoryItem[]> {
  const { data, error } = await apiClient.GET('/files/history');
  if (error) throw error;
  return data!;
}

export async function deleteFile(id: string): Promise<void> {
  const { error } = await apiClient.DELETE('/files/{id}', {
    params: { path: { id } },
  });
  if (error) throw error;
}
