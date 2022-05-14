import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { IRouteDefinition } from 'src/interfaces';
import { ReflectMetaKeyEnum } from 'src/enums';
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
