import { Module } from '@nestjs/common';

import { AuthModule, UsersModule } from './modules';
import { ConfigModule } from './shared/config/config.module';
import { DatabaseModule } from './database';

@Module({
  imports: [AuthModule, ConfigModule, UsersModule, DatabaseModule],
})
export class AppModule {}
