import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileEntity } from './entities/file.entity';
import { FileHistoryEntity } from './entities/file-history.entity';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileSizePipe } from '../common/pipes/file-size.pipe';
import { FileOwnerGuard } from './guards/file-owner.guard';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity, FileHistoryEntity]), StorageModule, AuthModule],
  controllers: [FilesController],
  providers: [FilesService, JwtAuthGuard, FileSizePipe, FileOwnerGuard],
})
export class FilesModule {}
