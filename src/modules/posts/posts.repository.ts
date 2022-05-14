import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from 'src/base';

import { Posts, PostsDocument } from './posts.schema';

@Injectable()
export class PostsRepository extends BaseRepository<Posts, PostsDocument> {
  constructor(@InjectModel(Posts.name) model: any) {
    super(model, model);
  }
}
