import { IsEnum, IsOptional } from 'class-validator';

export enum FileFilter {
  ALL = 'all',
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

export class ListFilesQueryDto {
  @IsOptional()
  @IsEnum(FileFilter)
  filter?: FileFilter = FileFilter.ALL;
}
