import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum FileFilter {
  ALL = 'all',
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

export class ListFilesQueryDto {
  @ApiProperty({ enum: FileFilter, default: FileFilter.ALL, required: false })
  @IsOptional()
  @IsEnum(FileFilter)
  filter?: FileFilter = FileFilter.ALL;
}
