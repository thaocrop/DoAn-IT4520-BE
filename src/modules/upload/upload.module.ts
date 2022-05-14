import 'reflect-metadata';
import { Module } from '@nestjs/common';

import uploadService from './upload.service';
import UploadController from './upload.controller';

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [uploadService],
  exports: [uploadService],
})
export class UploadModule {}
