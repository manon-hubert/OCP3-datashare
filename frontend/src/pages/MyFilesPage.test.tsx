import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import MyFilesPage from './MyFilesPage';
import * as filesApi from '../api/files';

vi.mock('../api/files');

const mockFiles: filesApi.FileListItem[] = [
  {
    id: '1',
    originalName: 'photo.jpg',
    size: 1024,
    expiresAt: '2025-01-01T00:00:00',
    downloadToken: 'token-abc',
    mimeType: 'image/jpeg',
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: '2',
    originalName: 'doc.pdf',
    size: 2048,
    expiresAt: '2025-01-01T00:00:00',
    downloadToken: 'token-def',
    mimeType: 'application/pdf',
    createdAt: '2024-01-01T00:00:00',
  },
];

const mockHistory: filesApi.FileHistoryItem[] = [
  {
    id: '3',
    originalName: 'old.zip',
    mimeType: 'application/zip',
    deletedAt: '2023-06-01T00:00:00',
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(filesApi.listFiles).mockResolvedValue(mockFiles);
  vi.mocked(filesApi.listFileHistory).mockResolvedValue(mockHistory);
  vi.mocked(filesApi.deleteFile).mockResolvedValue();
});

describe('MyFilesPage', () => {
  it('calls listFiles("active") and displays files on initial load', async () => {
    renderWithProviders(<MyFilesPage />);

    await waitFor(() => expect(screen.getByText('photo.jpg')).toBeInTheDocument());
    expect(screen.getByText('doc.pdf')).toBeInTheDocument();
    expect(filesApi.listFiles).toHaveBeenCalledWith('active');
    expect(filesApi.listFileHistory).not.toHaveBeenCalled();
  });

  it('calls listFileHistory (only) when switching to the "Expiré" tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyFilesPage />);
    await waitFor(() => expect(filesApi.listFiles).toHaveBeenCalled());

    await user.click(screen.getByRole('tab', { name: 'Expiré' }));

    await waitFor(() => expect(filesApi.listFileHistory).toHaveBeenCalledOnce());
    expect(filesApi.listFiles).not.toHaveBeenCalledWith('expired');
    expect(screen.getByText('old.zip')).toBeInTheDocument();
  });

  it('calls both listFiles("all") and listFileHistory when switching to the "Tous" tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyFilesPage />);
    await waitFor(() => expect(filesApi.listFiles).toHaveBeenCalled());

    await user.click(screen.getByRole('tab', { name: 'Tous' }));

    await waitFor(() => {
      expect(filesApi.listFiles).toHaveBeenCalledWith('all');
      expect(filesApi.listFileHistory).toHaveBeenCalledOnce();
    });
  });

  it('removes the deleted file from the list immediately', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyFilesPage />);
    await waitFor(() => screen.getByText('photo.jpg'));

    await user.click(screen.getAllByText('Supprimer')[0]);

    await waitFor(() => expect(screen.queryByText('photo.jpg')).not.toBeInTheDocument());
    expect(screen.getByText('doc.pdf')).toBeInTheDocument();
  });

  it('shows the API error message when delete fails', async () => {
    vi.mocked(filesApi.deleteFile).mockRejectedValue({ error: { message: 'Accès refusé' } });
    const user = userEvent.setup();
    renderWithProviders(<MyFilesPage />);
    await waitFor(() => screen.getByText('photo.jpg'));

    await user.click(screen.getAllByText('Supprimer')[0]);

    await waitFor(() => expect(screen.getByText('Accès refusé')).toBeInTheDocument());
  });

  it('shows an empty state when there are no files', async () => {
    vi.mocked(filesApi.listFiles).mockResolvedValue([]);
    renderWithProviders(<MyFilesPage />);

    await waitFor(() => expect(screen.getByText('Aucun fichier à afficher.')).toBeInTheDocument());
  });

  it('shows an error banner when loading fails', async () => {
    vi.mocked(filesApi.listFiles).mockRejectedValue(new Error('Network error'));
    renderWithProviders(<MyFilesPage />);

    await waitFor(() =>
      expect(screen.getByText('Impossible de charger les fichiers.')).toBeInTheDocument(),
    );
  });
});
