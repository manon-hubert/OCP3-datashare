import { ApiProperty } from '@nestjs/swagger';

export class FileHistoryItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  deletedAt: Date;
}
