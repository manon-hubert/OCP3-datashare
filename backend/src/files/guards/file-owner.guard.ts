import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../entities/file.entity';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ErrorCode, ErrorMessage } from '../../common/constants/error-codes';

@Injectable()
export class FileOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user: JwtPayload;
      params: { id: string };
      fileEntity?: FileEntity;
    }>();

    const user = request.user;
    const fileId = request.params['id'];

    const file = await this.filesRepository.findOne({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException({
        code: ErrorCode.FILE_NOT_FOUND,
        message: ErrorMessage[ErrorCode.FILE_NOT_FOUND],
      });
    }

    if (file.userId !== user.sub) {
      throw new ForbiddenException({
        code: ErrorCode.AUTH_UNAUTHORIZED,
        message: ErrorMessage[ErrorCode.AUTH_UNAUTHORIZED],
      });
    }

    request.fileEntity = file;
    return true;
  }
}
