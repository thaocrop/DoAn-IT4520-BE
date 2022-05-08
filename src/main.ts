import { NestFactory } from '@nestjs/core';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import morgan from 'morgan';

import { AppModule } from './app.module';
import { ConfigService } from './shared/config/config.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SERVER_PORT } from './environments';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  // global nest setup
  useContainer(app.select(AppModule), { fallbackOnErrors: true }); // refer: https://github.com/typestack/class-validator#using-service-container
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Starts listening to shutdown hooks
  app.enableShutdownHooks();

  // config
  app.setGlobalPrefix(configService.baseUrlPrefix);

  await app.listen(SERVER_PORT);
}
bootstrap();
