import { apiClient } from './client';
import type { components } from './schema';

export type UploadedFile = components['schemas']['FileEntity'];
export type FileListItem = components['schemas']['FileListItem'];

export interface FileInfo {
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export async function getFileInfo(token: string): Promise<FileInfo> {
  const response = await fetch(`${import.meta.env.VITE_API_URL as string}/files/download/${token}`);
  if (!response.ok) throw new Error('FILE_NOT_FOUND');
  return (await response.json()) as FileInfo;
}

export async function uploadFile(file: File): Promise<UploadedFile> {
  const { data, error } = await apiClient.POST('/files', {
    body: { file: file as unknown as string },
    bodySerializer() {
      const form = new FormData();
      form.append('file', file);
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

export async function deleteFile(id: string): Promise<void> {
  const { error } = await apiClient.DELETE('/files/{id}', {
    params: { path: { id } },
  });
  if (error) throw error;
}
