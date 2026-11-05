import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { UploadValidator } from './upload-validator';

@Module({
  controllers: [MediaController],
  providers: [UploadValidator],
  exports: [UploadValidator],
})
export class MediaModule {}
