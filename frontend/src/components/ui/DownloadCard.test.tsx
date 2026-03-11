import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import DownloadCard from './DownloadCard';
import type { FileInfo } from '../../api/files';

// Pin "today" to 2024-06-15
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-06-15T12:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

const baseFileInfo: FileInfo = {
  originalName: 'photo.png',
  mimeType: 'image/png',
  size: 1024,
  createdAt: '2024-06-10T00:00:00',
  expiresAt: '2024-06-20T00:00:00',
};

describe('DownloadCard', () => {
  describe('when fileInfo is not provided (file not found)', () => {
    it('shows the generic expired message', () => {
      renderWithProviders(<DownloadCard token="abc" />);

      expect(
        screen.getByText("Ce fichier n'est plus disponible en téléchargement car il a expiré"),
      ).toBeInTheDocument();
    });

    it('does not show the download button', () => {
      renderWithProviders(<DownloadCard token="abc" />);

      expect(screen.queryByRole('link', { name: /Télécharger/ })).not.toBeInTheDocument();
    });
  });

  describe('when the file is expired (date in the past)', () => {
    const expiredFileInfo = { ...baseFileInfo, expiresAt: '2024-06-14T00:00:00' };

    it('shows the expired error message', () => {
      renderWithProviders(<DownloadCard token="abc" fileInfo={expiredFileInfo} />);

      expect(
        screen.getByText("Ce fichier n'est plus disponible en téléchargement car il a expiré"),
      ).toBeInTheDocument();
    });

    it('does not show the download button', () => {
      renderWithProviders(<DownloadCard token="abc" fileInfo={expiredFileInfo} />);

      expect(screen.queryByRole('link', { name: /Télécharger/ })).not.toBeInTheDocument();
    });
  });

  describe('when the file expires today', () => {
    const todayFileInfo = { ...baseFileInfo, expiresAt: '2024-06-15T23:59:59' };

    it('shows the "expires tonight" warning message', () => {
      renderWithProviders(<DownloadCard token="abc" fileInfo={todayFileInfo} />);

      expect(screen.getByText('Ce fichier expirera ce soir')).toBeInTheDocument();
    });

    it('shows the download button', () => {
      renderWithProviders(<DownloadCard token="abc" fileInfo={todayFileInfo} />);

      expect(screen.getByRole('link', { name: /Télécharger/ })).toBeInTheDocument();
    });
  });

  describe('when the file expires tomorrow', () => {
    const tomorrowFileInfo = { ...baseFileInfo, expiresAt: '2024-06-16T00:00:00' };

    it('shows the "expires tomorrow" warning message', () => {
      renderWithProviders(<DownloadCard token="abc" fileInfo={tomorrowFileInfo} />);

      expect(screen.getByText('Ce fichier expirera demain')).toBeInTheDocument();
    });

    it('shows the download button', () => {
      renderWithProviders(<DownloadCard token="abc" fileInfo={tomorrowFileInfo} />);

      expect(screen.getByRole('link', { name: /Télécharger/ })).toBeInTheDocument();
    });
  });

  describe('when the file expires in multiple days', () => {
    const futureFileInfo = { ...baseFileInfo, expiresAt: '2024-06-20T00:00:00' };

    it('shows the "expires in N days" info message', () => {
      renderWithProviders(<DownloadCard token="abc" fileInfo={futureFileInfo} />);

      expect(screen.getByText('Ce fichier expirera dans 5 jours')).toBeInTheDocument();
    });

    it('shows the download button', () => {
      renderWithProviders(<DownloadCard token="abc" fileInfo={futureFileInfo} />);

      expect(screen.getByRole('link', { name: /Télécharger/ })).toBeInTheDocument();
    });
  });
});
