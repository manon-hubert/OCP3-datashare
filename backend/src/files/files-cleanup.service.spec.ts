import { Test } from '@nestjs/testing';
import { FilesCleanupService } from './files-cleanup.service';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';

const makeFile = (id: string): FileEntity =>
  ({
    id,
    userId: 1,
    originalName: `file-${id}.png`,
    mimeType: 'image/png',
    size: 100,
    expiresAt: new Date('2024-01-01'),
  }) as FileEntity;

describe('FilesCleanupService', () => {
  let cleanupService: FilesCleanupService;
  let filesService: { findExpiredFiles: jest.Mock; deleteFile: jest.Mock };

  beforeEach(async () => {
    filesService = {
      findExpiredFiles: jest.fn(),
      deleteFile: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [FilesCleanupService, { provide: FilesService, useValue: filesService }],
    }).compile();

    cleanupService = module.get(FilesCleanupService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('does nothing when there are no expired files', async () => {
    filesService.findExpiredFiles.mockResolvedValue([]);

    await cleanupService.deleteExpiredFiles();

    expect(filesService.deleteFile).not.toHaveBeenCalled();
  });

  it('calls deleteFile for each expired file', async () => {
    const files = [makeFile('uuid-1'), makeFile('uuid-2'), makeFile('uuid-3')];
    filesService.findExpiredFiles.mockResolvedValue(files);
    filesService.deleteFile.mockResolvedValue(undefined);

    await cleanupService.deleteExpiredFiles();

    expect(filesService.deleteFile).toHaveBeenCalledTimes(3);
    expect(filesService.deleteFile).toHaveBeenCalledWith(files[0]);
    expect(filesService.deleteFile).toHaveBeenCalledWith(files[1]);
    expect(filesService.deleteFile).toHaveBeenCalledWith(files[2]);
  });

  it('continues deleting remaining files when one deletion fails', async () => {
    const files = [makeFile('uuid-1'), makeFile('uuid-2'), makeFile('uuid-3')];
    filesService.findExpiredFiles.mockResolvedValue(files);
    filesService.deleteFile
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('delete failed'))
      .mockResolvedValueOnce(undefined);

    await expect(cleanupService.deleteExpiredFiles()).resolves.not.toThrow();

    expect(filesService.deleteFile).toHaveBeenCalledTimes(3);
  });

  it('does not throw even when all deletions fail', async () => {
    const files = [makeFile('uuid-1'), makeFile('uuid-2')];
    filesService.findExpiredFiles.mockResolvedValue(files);
    filesService.deleteFile.mockRejectedValue(new Error('storage down'));

    await expect(cleanupService.deleteExpiredFiles()).resolves.not.toThrow();
  });
});
