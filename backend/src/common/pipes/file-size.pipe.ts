import { HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorCode, ErrorMessage } from '../constants/error-codes';

@Injectable()
export class FileSizePipe implements PipeTransform {
  private readonly maxFileSize: number;

  constructor(private readonly configService: ConfigService) {
    this.maxFileSize = this.configService.getOrThrow<number>('MAX_FILE_SIZE');
  }

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new HttpException(
        { code: ErrorCode.VALIDATION_ERROR, message: 'No file provided' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (file.size > this.maxFileSize) {
      throw new HttpException(
        { code: ErrorCode.FILE_TOO_LARGE, message: ErrorMessage[ErrorCode.FILE_TOO_LARGE] },
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    return file;
  }
}
