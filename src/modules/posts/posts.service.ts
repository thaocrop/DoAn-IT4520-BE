import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ErrorHelper } from 'src/helpers';
import { ConfigService } from 'src/shared/config/config.service';

import { LocationsService } from './../locations/locations.service';
import { PostDto } from './posts.dto';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly repo: PostsRepository,
    private configService: ConfigService,
    @Inject(forwardRef(() => LocationsService)) private locationsService: LocationsService,
  ) {}

  async getAll() {
    return await this.repo.findAll();
  }

  async create(user, data: PostDto) {
    if (!user) {
      ErrorHelper.UnauthorizedException('Người dùng chưa đăng nhập');
    }
    //WHAT: Check exited slug
    const exitedPost = this.repo.find({ slug: data.slug });
    if (exitedPost) {
      ErrorHelper.BadRequestException('Slug đã tồn tại');
    }

    //WHAT: get location
    const location = await this.locationsService.findById(data.location_id);
    if (!location) {
      ErrorHelper.BadRequestException('Địa chỉ không tồn tại');
    }
    return await this.repo.create({ user_id: user._id, ...data, location });
  }
}
