import { extname } from 'path';
import { request } from 'http';

import { Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import _ from 'lodash';
import { diskStorage } from 'multer';
import { editFileName, checkFileType, ErrorHelper } from 'src/helpers';
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
      fileFilter: checkFileType,
    }),
  )
  public async single(@Req() request, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      return { ...file, path: `${BACKEND_HOST}uploads/${file.filename}` };
    } else {
      if (request?.errorImage) {
        ErrorHelper.BadRequestException(request.errorImage);
      } else {
        ErrorHelper.BadRequestException('Có lỗi xảy ra!');
      }
    }
  }
}
