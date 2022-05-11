import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_CONNECTION_NAME } from 'src/database';

import { AuthModule } from '../auth';

import { UserRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users, UserSchema } from './users.schema';

const dbSchemas = [
  {
    name: Users.name,
    schema: UserSchema,
  },
];

@Module({
  imports: [MongooseModule.forFeature(dbSchemas, MONGO_CONNECTION_NAME), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
