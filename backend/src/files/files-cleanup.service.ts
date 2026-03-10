import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FilesService } from './files.service';

@Injectable()
export class FilesCleanupService {
  private readonly logger = new Logger(FilesCleanupService.name);

  constructor(private readonly filesService: FilesService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredFiles(): Promise<void> {
    const expired = await this.filesService.findExpiredFiles();

    if (expired.length === 0) {
      return;
    }

    let deleted = 0;
    for (const file of expired) {
      try {
        await this.filesService.deleteFile(file);
        deleted++;
      } catch (err) {
        this.logger.error(`Failed to delete expired file ${file.id}`, err);
      }
    }

    this.logger.log(`Cleanup: deleted ${deleted}/${expired.length} expired files`);
  }
}
