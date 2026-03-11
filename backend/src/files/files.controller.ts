import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { FileHistoryEntity } from './entities/file-history.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser, type JwtPayload } from '../common/decorators/current-user.decorator';
import { FileSizePipe } from '../common/pipes/file-size.pipe';
import { ListFilesQueryDto } from './dto/list-files-query.dto';
import { FileInfoDto } from './dto/file-info.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileOwnerGuard } from './guards/file-owner.guard';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        expiresIn: { type: 'integer', minimum: 1, maximum: 7, default: 7 },
      },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: FileEntity })
  @ApiResponse({ status: 413, description: 'File exceeds the size limit' })
  @ApiResponse({ status: 415, description: 'File type not allowed' })
  async upload(
    @CurrentUser() user: JwtPayload | undefined,
    @UploadedFile(FileSizePipe) file: any,
    @Body() body: UploadFileDto,
  ) {
    return this.filesService.upload(user?.sub ?? null, file, body.expiresIn);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List files for authenticated user' })
  @ApiResponse({ status: 200, description: 'List of files', type: [FileEntity] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(@CurrentUser() user: JwtPayload, @Query() query: ListFilesQueryDto) {
    return this.filesService.listUserFiles(user.sub, query.filter!);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List deleted/expired files for authenticated user' })
  @ApiResponse({ status: 200, description: 'File history', type: [FileHistoryEntity] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async history(@CurrentUser() user: JwtPayload) {
    return this.filesService.listUserHistory(user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, FileOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'File deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async delete(@Req() req: { fileEntity: FileEntity }) {
    await this.filesService.deleteFile(req.fileEntity);
  }

  @Get('download/:token')
  @ApiOperation({ summary: 'Get file metadata by download token' })
  @ApiResponse({ status: 200, description: 'File metadata', type: FileInfoDto })
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
