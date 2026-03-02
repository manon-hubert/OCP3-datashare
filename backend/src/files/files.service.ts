import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'node:crypto';
import { FileEntity } from './entities/file.entity';
import { StorageService } from '../storage/storage.service';
import { ALLOWED_MIME_TYPES } from '../common/constants/mime-types';
import { ErrorCode, ErrorMessage } from '../common/constants/error-codes';

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
}
