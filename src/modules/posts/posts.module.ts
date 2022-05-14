import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_CONNECTION_NAME } from 'src/database';

import { LocationsModule } from '../locations';

import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { Posts, PostsSchema } from './posts.schema';
import { PostsService } from './posts.service';

const dbSchemas = [
  {
    name: Posts.name,
    schema: PostsSchema,
  },
];

@Module({
  imports: [MongooseModule.forFeature(dbSchemas, MONGO_CONNECTION_NAME), forwardRef(() => LocationsModule)],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
  exports: [PostsService],
})
export class PostsModule {}
