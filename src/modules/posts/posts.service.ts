import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ErrorHelper } from 'src/helpers';
import { ConfigService } from 'src/shared/config/config.service';

import { UsersService } from '../users';

import { LocationsService } from './../locations/locations.service';
import { PostDto } from './posts.dto';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly repo: PostsRepository,
    private configService: ConfigService,
    @Inject(forwardRef(() => LocationsService)) private locationsService: LocationsService,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
  ) {}

  async getAll() {
    return await this.repo.findAll();
  }

  async create(user, data: PostDto) {
    if (!user) {
      ErrorHelper.UnauthorizedException('Người dùng chưa đăng nhập');
    }
    const author = await this.usersService.findById(user._id);
    if (!author) {
      ErrorHelper.UnauthorizedException('Người dùng không tồn tại');
    }
    //WHAT: Check exited slug
    const exitedPost = await this.repo.findOne({ slug: data.slug });
    if (exitedPost) {
      console.log(exitedPost);
      ErrorHelper.BadRequestException('Slug đã tồn tại');
    }

    //WHAT: get location
    const location = await this.locationsService.findById(data.location_id);
    if (!location) {
      ErrorHelper.BadRequestException('Địa chỉ không tồn tại');
    }
    return await this.repo.create({ user_id: author._id, user_name: author.user_name, ...data, location });
  }
}
