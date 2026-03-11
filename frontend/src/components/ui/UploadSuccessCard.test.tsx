import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import UploadSuccessCard from './UploadSuccessCard';
import type { UploadedFile } from '../../api/files';

const uploadedFile: UploadedFile = {
  id: 'uuid-1',
  originalName: 'photo.png',
  mimeType: 'image/png',
  size: 1024,
  downloadToken: 'tok-xyz',
  createdAt: '2024-06-15T00:00:00',
  expiresAt: '2024-06-16T00:00:00',
};

describe('UploadSuccessCard — TTL label', () => {
  it('displays the French label for a known TTL option', () => {
    renderWithProviders(<UploadSuccessCard uploadedFile={uploadedFile} ttlDays={1} />);

    // TTL_OPTIONS[0] = { days: 1, label: 'Une journée' }
    expect(screen.getByText(/une journée/i)).toBeInTheDocument();
  });

  it('falls back to "{N} jours" for a TTL not in the predefined options', () => {
    renderWithProviders(<UploadSuccessCard uploadedFile={uploadedFile} ttlDays={10} />);

    expect(screen.getByText(/10 jours/)).toBeInTheDocument();
  });

  it('displays the full French label for each predefined TTL option', () => {
    const cases: [number, RegExp][] = [
      [1, /une journée/i],
      [2, /deux jours/i],
      [7, /une semaine/i],
    ];

    for (const [days, labelPattern] of cases) {
      const { unmount } = renderWithProviders(
        <UploadSuccessCard uploadedFile={uploadedFile} ttlDays={days} />,
      );
      expect(screen.getByText(labelPattern)).toBeInTheDocument();
      unmount();
    }
  });

  it('displays the share URL built from the download token', () => {
    renderWithProviders(<UploadSuccessCard uploadedFile={uploadedFile} ttlDays={1} />);

    expect(screen.getByText(/\/share\/tok-xyz/)).toBeInTheDocument();
  });
});
