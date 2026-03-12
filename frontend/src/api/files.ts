import { apiClient } from './client';
import type { components } from './schema';

export type UploadedFile = components['schemas']['FileEntity'];
export type FileListItem = components['schemas']['FileEntity'];
export type FileHistoryItem = components['schemas']['FileHistoryEntity'];
export type FileInfo = components['schemas']['FileInfoDto'];
export type PaginatedFileList = components['schemas']['PaginatedFileListDto'];
export type PaginatedFileHistory = components['schemas']['PaginatedFileHistoryDto'];

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
  page = 1,
  limit = 20,
): Promise<PaginatedFileList> {
  const { data, error } = await apiClient.GET('/files', {
    params: { query: { filter, page, limit } },
  });
  if (error) throw error;
  return data!;
}

export async function listFileHistory(page = 1, limit = 20): Promise<PaginatedFileHistory> {
  const { data, error } = await apiClient.GET('/files/history', {
    params: { query: { page, limit } },
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
