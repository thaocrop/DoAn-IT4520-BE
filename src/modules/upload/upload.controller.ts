import { extname } from 'path';

import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import _ from 'lodash';
import { diskStorage } from 'multer';
import { editFileName } from 'src/helpers';
import { AuthGuard } from 'src/common/guards/authenticate.guard';
import { BACKEND_HOST } from 'src/environments';

@Controller('/upload')
@UseGuards(AuthGuard)
export default class UploadController {
  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: editFileName,
      }),
    }),
  )
  public async single(@UploadedFile() file: Express.Multer.File) {
    return { ...file, path: `${BACKEND_HOST}uploads/${file.filename}` };
  }
}
