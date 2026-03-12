import { ApiProperty } from '@nestjs/swagger';
import { FileResponseDto } from './file-response.dto';
import { FileHistoryItemDto } from './file-history-item.dto';

export class PaginatedFileListDto {
  @ApiProperty({ type: [FileResponseDto] })
  data: FileResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class PaginatedFileHistoryDto {
  @ApiProperty({ type: [FileHistoryItemDto] })
  data: FileHistoryItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
