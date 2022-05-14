import { Controller, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import _ from 'lodash';
// import { Controller, Post } from 'src/common';

@Controller('/upload')
export default class UploadController {
  @Post('/single')
  public async single(req: Request, res: Response) {
    try {
      //@ts-ignore
      const files = _.isArray(req.files) && req.files;
      if (files.length > 1) {
        throw Error('File too much');
      }
      const url = `/${files[0].filename}`;
      return res.json({
        data: url,
      });
    } catch (error) {
      console.log(error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Post('/multiple')
  public async multiple(req: Request, res: Response) {
    //@ts-ignore
    const files = _.isArray(req.files) && req.files;
    if (!files.length) {
      return res.status(400).json({
        message: 'File not Found',
      });
    }
    const urls = files?.map((data) => {
      return {
        name: data.originalname,
        url: `/${data.filename}`,
      };
    });
    return res.json({
      data: urls,
    });
  }
}
