import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

const DEFAULT_EXPIRY_DAYS = 7;
const MAX_EXPIRY_DAYS = 7;

export { DEFAULT_EXPIRY_DAYS, MAX_EXPIRY_DAYS };

export class UploadFileDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_EXPIRY_DAYS)
  expiresIn?: number = DEFAULT_EXPIRY_DAYS;
}
