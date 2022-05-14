import { Injectable } from '@nestjs/common';
import { IS_UUID } from 'class-validator';
import { ErrorHelper } from 'src/helpers';
import { ConfigService } from 'src/shared/config/config.service';

import { PostDto } from './posts.dto';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(private readonly repo: PostsRepository, private configService: ConfigService) {}

  async getAll() {
    return await this.repo.findAll();
  }

  async create(user, data: PostDto) {
    if (user) {
      return await this.repo.create({ user_id: user._id, ...data });
    }
    ErrorHelper.UnauthorizedException('Người dùng chưa đăng nhập');
  }
}
