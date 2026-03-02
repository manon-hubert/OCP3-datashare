import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileEntity } from './entities/file.entity';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileSizePipe } from '../common/pipes/file-size.pipe';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), StorageModule, AuthModule],
  controllers: [FilesController],
  providers: [FilesService, JwtAuthGuard, FileSizePipe],
})
export class FilesModule {}
