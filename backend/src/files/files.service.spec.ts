import { GoneException, NotFoundException, UnsupportedMediaTypeException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { fileTypeFromBuffer } from 'file-type';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { FileHistoryEntity } from './entities/file-history.entity';
import { StorageService } from '../storage/storage.service';
import { ErrorCode } from '../common/constants/error-codes';

const mockFileTypeFromBuffer = jest.mocked(fileTypeFromBuffer);

const makeMulterFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
  ({
    fieldname: 'file',
    originalname: 'test.png',
    mimetype: 'image/png',
    buffer: Buffer.from('fake-image-bytes'),
    size: 100,
    stream: null as never,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  }) as Express.Multer.File;

describe('FilesService', () => {
  let service: FilesService;
  let filesRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let fileHistoryRepository: { create: jest.Mock; save: jest.Mock; find: jest.Mock };
  let storageService: { save: jest.Mock; read: jest.Mock; delete: jest.Mock };

  beforeEach(async () => {
    filesRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    fileHistoryRepository = {
      create: jest.fn((data) => data),
      save: jest.fn(),
      find: jest.fn(),
    };
    storageService = {
      save: jest.fn(),
      read: jest.fn(),
      delete: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: getRepositoryToken(FileEntity), useValue: filesRepository },
        { provide: getRepositoryToken(FileHistoryEntity), useValue: fileHistoryRepository },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile();

    service = module.get(FilesService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('upload', () => {
    it('throws UnsupportedMediaTypeException with FILE_TYPE_FORBIDDEN when MIME is not allowed', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({ mime: 'application/x-msdownload', ext: 'exe' });

      const err = await service.upload(1, makeMulterFile()).catch((e: unknown) => e);

      expect(err).toBeInstanceOf(UnsupportedMediaTypeException);
      expect((err as UnsupportedMediaTypeException).getResponse()).toMatchObject({
        code: ErrorCode.FILE_TYPE_FORBIDDEN,
      });
    });

    it('treats an undetectable file as application/octet-stream and rejects it', async () => {
      mockFileTypeFromBuffer.mockResolvedValue(undefined);

      await expect(service.upload(1, makeMulterFile())).rejects.toBeInstanceOf(
        UnsupportedMediaTypeException,
      );
    });

    it('saves the file entity and writes to the correct storage path on success', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({ mime: 'image/png', ext: 'png' });
      const entity = { id: 'uuid-1', downloadToken: 'tok' };
      filesRepository.create.mockReturnValue(entity);
      filesRepository.save.mockResolvedValue(entity);
      storageService.save.mockResolvedValue(undefined);

      const result = await service.upload(1, makeMulterFile());

      expect(filesRepository.save).toHaveBeenCalledTimes(1);
      expect(storageService.save).toHaveBeenCalledWith('users/1/uuid-1', expect.any(Buffer));
      expect(result).toBe(entity);
    });

    it('generates a 64-character hex downloadToken', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({ mime: 'image/png', ext: 'png' });
      let capturedToken = '';
      filesRepository.create.mockImplementation((data: Partial<FileEntity>) => {
        capturedToken = data.downloadToken ?? '';
        return data;
      });
      filesRepository.save.mockImplementation(async (e: Partial<FileEntity>) =>
        Object.assign(e, { id: 'uuid-1' }),
      );
      storageService.save.mockResolvedValue(undefined);

      await service.upload(1, makeMulterFile());

      expect(capturedToken).toMatch(/^[0-9a-f]{64}$/);
    });

    it('deletes the DB record and re-throws if storage write fails', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({ mime: 'image/png', ext: 'png' });
      const entity = { id: 'uuid-1' };
      filesRepository.create.mockReturnValue(entity);
      filesRepository.save.mockResolvedValue(entity);
      storageService.save.mockRejectedValue(new Error('disk full'));

      await expect(service.upload(1, makeMulterFile())).rejects.toThrow('disk full');
      expect(filesRepository.delete).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('getInfoByToken', () => {
    it('returns the expected metadata fields when the token matches', async () => {
      const createdAt = new Date('2024-01-01');
      filesRepository.findOne.mockResolvedValue({
        id: 'uuid-1',
        userId: 1,
        originalName: 'test.png',
        mimeType: 'image/png',
        size: 100,
        downloadToken: 'token-abc',
        createdAt,
      });

      const result = await service.getInfoByToken('token-abc');

      expect(result).toEqual({
        originalName: 'test.png',
        mimeType: 'image/png',
        size: 100,
        createdAt,
      });
    });

    it('throws NotFoundException with FILE_NOT_FOUND when the token does not exist', async () => {
      filesRepository.findOne.mockResolvedValue(null);

      const err = await service.getInfoByToken('unknown').catch((e: unknown) => e);

      expect(err).toBeInstanceOf(NotFoundException);
      expect((err as NotFoundException).getResponse()).toMatchObject({
        code: ErrorCode.FILE_NOT_FOUND,
      });
    });
  });

  describe('getBufferByToken', () => {
    it('returns buffer, originalName, and mimeType for a valid token', async () => {
      const buffer = Buffer.from('file-bytes');
      filesRepository.findOne.mockResolvedValue({
        id: 'uuid-1',
        userId: 42,
        originalName: 'doc.pdf',
        mimeType: 'application/pdf',
      });
      storageService.read.mockResolvedValue(buffer);

      const result = await service.getBufferByToken('token-abc');

      expect(result).toEqual({ buffer, originalName: 'doc.pdf', mimeType: 'application/pdf' });
    });

    it('reads from users/{userId}/{fileId} path for an authenticated file', async () => {
      filesRepository.findOne.mockResolvedValue({
        id: 'uuid-1',
        userId: 42,
        originalName: 'f',
        mimeType: 'image/png',
      });
      storageService.read.mockResolvedValue(Buffer.from(''));

      await service.getBufferByToken('token-abc');

      expect(storageService.read).toHaveBeenCalledWith('users/42/uuid-1');
    });

    it('throws NotFoundException with FILE_NOT_FOUND when the token does not exist', async () => {
      filesRepository.findOne.mockResolvedValue(null);

      const err = await service.getBufferByToken('unknown').catch((e: unknown) => e);

      expect(err).toBeInstanceOf(NotFoundException);
      expect((err as NotFoundException).getResponse()).toMatchObject({
        code: ErrorCode.FILE_NOT_FOUND,
      });
    });

    it('throws GoneException with FILE_GONE when the file is missing from storage (ENOENT)', async () => {
      filesRepository.findOne.mockResolvedValue({
        id: 'uuid-1',
        userId: 1,
        originalName: 'f',
        mimeType: 'image/png',
      });
      storageService.read.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));

      const err = await service.getBufferByToken('token-abc').catch((e: unknown) => e);

      expect(err).toBeInstanceOf(GoneException);
      expect((err as GoneException).getResponse()).toMatchObject({ code: ErrorCode.FILE_GONE });
    });

    it('re-throws non-ENOENT storage errors', async () => {
      filesRepository.findOne.mockResolvedValue({
        id: 'uuid-1',
        userId: 1,
        originalName: 'f',
        mimeType: 'image/png',
      });
      storageService.read.mockRejectedValue(new Error('permission denied'));

      await expect(service.getBufferByToken('token-abc')).rejects.toThrow('permission denied');
    });
  });

  describe('deleteFile', () => {
    const file = {
      id: 'uuid-1',
      userId: 42,
      originalName: 'report.pdf',
      mimeType: 'application/pdf',
    } as FileEntity;

    it('deletes from storage, inserts history, then deletes from files', async () => {
      storageService.delete.mockResolvedValue(undefined);
      fileHistoryRepository.save.mockResolvedValue(undefined);
      filesRepository.delete.mockResolvedValue(undefined);

      await service.deleteFile(file);

      const storageOrder = storageService.delete.mock.invocationCallOrder[0];
      const historyOrder = fileHistoryRepository.save.mock.invocationCallOrder[0];
      const deleteOrder = filesRepository.delete.mock.invocationCallOrder[0];

      expect(storageOrder).toBeLessThan(historyOrder);
      expect(historyOrder).toBeLessThan(deleteOrder);
    });

    it('uses users/{userId}/{fileId} storage path for authenticated files', async () => {
      storageService.delete.mockResolvedValue(undefined);
      fileHistoryRepository.save.mockResolvedValue(undefined);
      filesRepository.delete.mockResolvedValue(undefined);

      await service.deleteFile(file);

      expect(storageService.delete).toHaveBeenCalledWith('users/42/uuid-1');
    });

    it('records user_id, original_name, and mime_type in file_history', async () => {
      storageService.delete.mockResolvedValue(undefined);
      fileHistoryRepository.save.mockResolvedValue(undefined);
      filesRepository.delete.mockResolvedValue(undefined);

      await service.deleteFile(file);

      expect(fileHistoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'uuid-1',
          userId: 42,
          originalName: 'report.pdf',
          mimeType: 'application/pdf',
        }),
      );
    });

    it('still records history and deletes from DB when storage delete fails', async () => {
      storageService.delete.mockRejectedValue(new Error('storage error'));
      fileHistoryRepository.save.mockResolvedValue(undefined);
      filesRepository.delete.mockResolvedValue(undefined);

      await service.deleteFile(file);

      expect(fileHistoryRepository.save).toHaveBeenCalledTimes(1);
      expect(filesRepository.delete).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('listUserHistory', () => {
    it('returns history entries for the user ordered by deletedAt DESC', async () => {
      const entries = [
        {
          id: 'uuid-2',
          userId: 1,
          originalName: 'b.pdf',
          mimeType: 'application/pdf',
          deletedAt: new Date('2024-02-01'),
        },
        {
          id: 'uuid-1',
          userId: 1,
          originalName: 'a.png',
          mimeType: 'image/png',
          deletedAt: new Date('2024-01-01'),
        },
      ];
      fileHistoryRepository.find.mockResolvedValue(entries);

      const result = await service.listUserHistory(1);

      expect(fileHistoryRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { deletedAt: 'DESC' },
      });
      expect(result).toBe(entries);
    });

    it('returns an empty array when the user has no history', async () => {
      fileHistoryRepository.find.mockResolvedValue([]);

      const result = await service.listUserHistory(99);

      expect(result).toEqual([]);
    });
  });
});
