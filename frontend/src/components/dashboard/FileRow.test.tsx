import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/utils';
import { FileRow } from './FileRow';
import type { FileListItem, FileHistoryItem } from '../../api/files';

const activeFile: FileListItem = {
  id: 'uuid-1',
  originalName: 'report.pdf',
  mimeType: 'application/pdf',
  size: 2048,
  downloadToken: 'tok-abc',
  createdAt: '2024-06-10T00:00:00',
  expiresAt: '2099-01-01T00:00:00', // far future — always "Expire dans N jours"
};

const historyItem: FileHistoryItem = {
  id: 'uuid-2',
  originalName: 'archive.zip',
  mimeType: 'application/zip',
  deletedAt: '2024-05-01T00:00:00',
};

describe('FileRow — active variant', () => {
  it('displays the file name', () => {
    renderWithProviders(<FileRow kind="active" file={activeFile} onDelete={vi.fn()} />);

    expect(screen.getByText('report.pdf')).toBeInTheDocument();
  });

  it('displays a future expiry subtitle (not "Expiré")', () => {
    renderWithProviders(<FileRow kind="active" file={activeFile} onDelete={vi.fn()} />);

    expect(screen.getByText(/Expire dans \d+ jours/)).toBeInTheDocument();
    expect(screen.queryByText('Expiré')).not.toBeInTheDocument();
  });

  it('shows a Delete action', () => {
    renderWithProviders(<FileRow kind="active" file={activeFile} onDelete={vi.fn()} />);

    expect(screen.getAllByText('Supprimer').length).toBeGreaterThan(0);
  });

  it('shows an Access link pointing to the share URL', () => {
    renderWithProviders(<FileRow kind="active" file={activeFile} onDelete={vi.fn()} />);

    // getAllByRole with hidden:true to include desktop buttons hidden via CSS at mobile breakpoint
    const links = screen.getAllByRole('link', { name: /Accéder/, hidden: true });
    expect(links[0]).toHaveAttribute('href', '/share/tok-abc');
  });

  it('calls onDelete with the file id when the Delete button is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<FileRow kind="active" file={activeFile} onDelete={onDelete} />);

    await user.click(screen.getAllByText('Supprimer')[0]);

    expect(onDelete).toHaveBeenCalledWith('uuid-1');
  });
});

describe('FileRow — history variant', () => {
  it('displays the file name', () => {
    renderWithProviders(<FileRow kind="history" item={historyItem} />);

    expect(screen.getByText('archive.zip')).toBeInTheDocument();
  });

  it('displays "Expiré" as subtitle', () => {
    renderWithProviders(<FileRow kind="history" item={historyItem} />);

    expect(screen.getByText('Expiré')).toBeInTheDocument();
  });

  it('shows the "Ce fichier a expiré" notice', () => {
    renderWithProviders(<FileRow kind="history" item={historyItem} />);

    expect(
      screen.getByText(/Ce fichier a expiré, il n'est plus stocké chez nous/),
    ).toBeInTheDocument();
  });

  it('does not show a Delete button', () => {
    renderWithProviders(<FileRow kind="history" item={historyItem} />);

    expect(screen.queryByText('Supprimer')).not.toBeInTheDocument();
  });

  it('does not show an Access link', () => {
    renderWithProviders(<FileRow kind="history" item={historyItem} />);

    expect(screen.queryByRole('link', { name: /Accéder/, hidden: true })).not.toBeInTheDocument();
  });
});
