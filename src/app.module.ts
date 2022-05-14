import { Module } from '@nestjs/common';

import { AuthModule, UsersModule, LocationsModule, PostsModule } from './modules';
import { ConfigModule } from './shared/config/config.module';
import { DatabaseModule } from './database';

@Module({
  imports: [AuthModule, ConfigModule, UsersModule, DatabaseModule, LocationsModule, PostsModule],
})
export class AppModule {}
