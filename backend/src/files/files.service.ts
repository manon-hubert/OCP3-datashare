import {
  GoneException,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import * as crypto from 'node:crypto';
import { FileEntity } from './entities/file.entity';
import { FileHistoryEntity } from './entities/file-history.entity';
import { StorageService } from '../storage/storage.service';
import { ALLOWED_MIME_TYPES } from '../common/constants/mime-types';
import { ErrorCode, ErrorMessage } from '../common/constants/error-codes';
import { FileFilter } from './dto/list-files-query.dto';
import { DEFAULT_EXPIRY_DAYS } from './dto/upload-file.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
    @InjectRepository(FileHistoryEntity)
    private readonly fileHistoryRepository: Repository<FileHistoryEntity>,
    private readonly storageService: StorageService,
  ) {}

  async upload(
    userId: number | null,
    file: Express.Multer.File,
    expiresIn: number = DEFAULT_EXPIRY_DAYS,
  ): Promise<FileEntity> {
    const { fileTypeFromBuffer } = await import('file-type');
    const detected = await fileTypeFromBuffer(file.buffer);
    const mimeType = detected?.mime ?? 'application/octet-stream';

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new UnsupportedMediaTypeException({
        code: ErrorCode.FILE_TYPE_FORBIDDEN,
        message: ErrorMessage[ErrorCode.FILE_TYPE_FORBIDDEN],
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    const downloadToken = crypto.randomBytes(32).toString('hex');
    const fileEntity = this.filesRepository.create({
      userId,
      originalName: file.originalname,
      mimeType,
      size: file.size,
      downloadToken,
      expiresAt,
    });

    await this.filesRepository.save(fileEntity);

    const storagePath = userId ? `users/${userId}/${fileEntity.id}` : `anonymous/${fileEntity.id}`;
    try {
      await this.storageService.save(storagePath, file.buffer);
    } catch (err) {
      await this.filesRepository.delete(fileEntity.id);
      throw err;
    }

    return fileEntity;
  }

  async getInfoByToken(
    token: string,
  ): Promise<Pick<FileEntity, 'originalName' | 'mimeType' | 'size' | 'createdAt' | 'expiresAt'>> {
    const file = await this.filesRepository.findOne({ where: { downloadToken: token } });
    if (!file) {
      throw new NotFoundException({
        code: ErrorCode.FILE_NOT_FOUND,
        message: ErrorMessage[ErrorCode.FILE_NOT_FOUND],
      });
    }
    if (file.expiresAt <= new Date()) {
      throw new GoneException({
        code: ErrorCode.FILE_GONE,
        message: ErrorMessage[ErrorCode.FILE_GONE],
      });
    }
    return {
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      createdAt: file.createdAt,
      expiresAt: file.expiresAt,
    };
  }

  async listUserFiles(userId: number, filter: FileFilter, page: number, limit: number) {
    const now = new Date();

    const qb = this.filesRepository
      .createQueryBuilder('file')
      .where('file.userId = :userId', { userId })
      .orderBy('file.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filter === FileFilter.ACTIVE) {
      qb.andWhere('file.expiresAt > :now', { now });
    } else if (filter === FileFilter.EXPIRED) {
      qb.andWhere('file.expiresAt <= :now', { now });
    }

    const [files, total] = await qb.getManyAndCount();

    return {
      data: files.map((file) => ({
        id: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        downloadToken: file.downloadToken,
        createdAt: file.createdAt,
        expiresAt: file.expiresAt,
      })),
      total,
      page,
      limit,
    };
  }

  async findExpiredFiles(limit = 100): Promise<FileEntity[]> {
    return this.filesRepository.find({
      where: { expiresAt: LessThanOrEqual(new Date()) },
      take: limit,
    });
  }

  async listUserHistory(userId: number, page: number, limit: number) {
    const [data, total] = await this.fileHistoryRepository.findAndCount({
      where: { userId },
      order: { deletedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async deleteFile(file: FileEntity): Promise<void> {
    const storagePath = file.userId ? `users/${file.userId}/${file.id}` : `anonymous/${file.id}`;
    try {
      await this.storageService.delete(storagePath);
    } catch {
      // Storage cleanup failure is non-critical after DB deletion
    }

    if (file.userId !== null) {
      await this.fileHistoryRepository.save(
        this.fileHistoryRepository.create({
          id: file.id,
          userId: file.userId,
          originalName: file.originalName,
          mimeType: file.mimeType,
        }),
      );
    }

    await this.filesRepository.delete(file.id);
  }

  async getBufferByToken(
    token: string,
  ): Promise<{ buffer: Buffer; originalName: string; mimeType: string }> {
    const file = await this.filesRepository.findOne({ where: { downloadToken: token } });
    if (!file) {
      throw new NotFoundException({
        code: ErrorCode.FILE_NOT_FOUND,
        message: ErrorMessage[ErrorCode.FILE_NOT_FOUND],
      });
    }
    if (file.expiresAt <= new Date()) {
      throw new GoneException({
        code: ErrorCode.FILE_GONE,
        message: ErrorMessage[ErrorCode.FILE_GONE],
      });
    }
    const storagePath = file.userId ? `users/${file.userId}/${file.id}` : `anonymous/${file.id}`;
    let buffer: Buffer;
    try {
      buffer = await this.storageService.read(storagePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new GoneException({
          code: ErrorCode.FILE_GONE,
          message: ErrorMessage[ErrorCode.FILE_GONE],
        });
      }
      throw err;
    }
    return { buffer, originalName: file.originalName, mimeType: file.mimeType };
  }
}
