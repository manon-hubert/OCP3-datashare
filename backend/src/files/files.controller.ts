import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, type JwtPayload } from '../common/decorators/current-user.decorator';
import { FileSizePipe } from '../common/pipes/file-size.pipe';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: FileEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 413, description: 'File exceeds the size limit' })
  @ApiResponse({ status: 415, description: 'File type not allowed' })
  async upload(@CurrentUser() user: JwtPayload, @UploadedFile(FileSizePipe) file: any) {
    return this.filesService.upload(user.sub, file);
  }

  @Get('download/:token')
  @ApiOperation({ summary: 'Get file metadata by download token' })
  @ApiResponse({ status: 200, description: 'File metadata' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getInfo(@Param('token') token: string) {
    return this.filesService.getInfoByToken(token);
  }

  @Get('download/:token/content')
  @ApiOperation({ summary: 'Download file by token' })
  @ApiResponse({ status: 200, description: 'File stream' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async download(@Param('token') token: string, @Res() res: Response) {
    const { buffer, originalName, mimeType } = await this.filesService.getBufferByToken(token);
    const encoded = encodeURIComponent(originalName);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encoded}`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }
}
