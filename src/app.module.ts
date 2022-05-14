import { join } from 'path';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AuthModule, UsersModule, LocationsModule, PostsModule, UploadModule } from './modules';
import { ConfigModule } from './shared/config/config.module';
import { DatabaseModule } from './database';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    ConfigModule,
    UsersModule,
    DatabaseModule,
    LocationsModule,
    PostsModule,
    UploadModule,
  ],
})
export class AppModule {}
