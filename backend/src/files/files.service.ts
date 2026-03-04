import {
  GoneException,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'node:crypto';
import { FileEntity } from './entities/file.entity';
import { StorageService } from '../storage/storage.service';
import { ALLOWED_MIME_TYPES } from '../common/constants/mime-types';
import { ErrorCode, ErrorMessage } from '../common/constants/error-codes';
import { FileFilter } from './dto/list-files-query.dto';

const FILE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
    private readonly storageService: StorageService,
  ) {}

  async upload(userId: number, file: Express.Multer.File): Promise<FileEntity> {
    const { fileTypeFromBuffer } = await import('file-type');
    const detected = await fileTypeFromBuffer(file.buffer);
    const mimeType = detected?.mime ?? 'application/octet-stream';

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new UnsupportedMediaTypeException({
        code: ErrorCode.FILE_TYPE_FORBIDDEN,
        message: ErrorMessage[ErrorCode.FILE_TYPE_FORBIDDEN],
      });
    }

    const downloadToken = crypto.randomBytes(32).toString('hex');
    const fileEntity = this.filesRepository.create({
      userId,
      originalName: file.originalname,
      mimeType,
      size: file.size,
      downloadToken,
    });

    await this.filesRepository.save(fileEntity);

    try {
      await this.storageService.save(`users/${userId}/${fileEntity.id}`, file.buffer);
    } catch (err) {
      await this.filesRepository.delete(fileEntity.id);
      throw err;
    }

    return fileEntity;
  }

  async getInfoByToken(
    token: string,
  ): Promise<Pick<FileEntity, 'originalName' | 'mimeType' | 'size' | 'createdAt'>> {
    const file = await this.filesRepository.findOne({ where: { downloadToken: token } });
    if (!file) {
      throw new NotFoundException({
        code: ErrorCode.FILE_NOT_FOUND,
        message: ErrorMessage[ErrorCode.FILE_NOT_FOUND],
      });
    }
    return {
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      createdAt: file.createdAt,
    };
  }

  async listUserFiles(userId: number, filter: FileFilter) {
    const cutoff = new Date(Date.now() - FILE_TTL_MS);

    const qb = this.filesRepository
      .createQueryBuilder('file')
      .where('file.userId = :userId', { userId })
      .orderBy('file.createdAt', 'DESC');

    if (filter === FileFilter.ACTIVE) {
      qb.andWhere('file.createdAt > :cutoff', { cutoff });
    } else if (filter === FileFilter.EXPIRED) {
      qb.andWhere('file.createdAt <= :cutoff', { cutoff });
    }

    const files = await qb.getMany();

    return files.map((file) => ({
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      downloadToken: file.downloadToken,
      createdAt: file.createdAt,
      expiresAt: new Date(file.createdAt.getTime() + FILE_TTL_MS),
    }));
  }

  async deleteFile(file: FileEntity): Promise<void> {
    await this.filesRepository.delete(file.id);
    const storagePath = file.userId ? `users/${file.userId}/${file.id}` : `anonymous/${file.id}`;
    try {
      await this.storageService.delete(storagePath);
    } catch {
      // Storage cleanup failure is non-critical after DB deletion
    }
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
