import { PickType } from '@nestjs/swagger';
import { FileEntity } from '../entities/file.entity';

export class FileInfoDto extends PickType(FileEntity, [
  'originalName',
  'mimeType',
  'size',
  'createdAt',
  'expiresAt',
]) {}
