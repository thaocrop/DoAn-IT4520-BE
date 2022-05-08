import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from './shared/config/config.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [AuthModule, ConfigModule, UsersModule],
})
export class AppModule {}
