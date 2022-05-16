import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Status } from 'src/base';
import { ErrorHelper } from 'src/helpers';
import { ConfigService } from 'src/shared/config/config.service';
import DOMPurify from 'dompurify';

import { UsersService } from '../users';

import { LocationsService } from './../locations/locations.service';
import { PostDto, PostPageDto, UpdatePostDto } from './posts.dto';
import { PostsRepository } from './posts.repository';
import { Posts } from './posts.schema';

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

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return await this.repo.findOne({ slug: id });
    }
    return await this.repo.findById(id);
  }

  async delete(id: string) {
    return await this.repo.forceDelete(id);
  }

  async getList(params: PostPageDto) {
    const { page, limit, status } = params;
    const options: any = {
      limit: limit ? Number(limit) : 10,
      page: page ? Number(page) : 1,
      createdAt: -1,
    };
    // if {status}
    const aggQuery = [
      {
        $match: {
          status: status || { $ne: Status.DELETED },
        },
      },
    ];
    const aggregateModel = this.repo.getModel().aggregate(aggQuery);
    const res = await this.repo.getAggModel().aggregatePaginate(aggregateModel, options);
    return res;
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
      ErrorHelper.BadRequestException('Slug đã tồn tại');
    }

    //WHAT: get location
    const location = await this.locationsService.findById(data.location_id);
    if (!location) {
      ErrorHelper.BadRequestException('Địa chỉ không tồn tại');
    }
    return await this.repo.create({ user_id: author._id, user_name: author.user_name, ...data, location });
  }

  async approvePost(id: string) {
    return await this.updatePost(id, { status: Status.ACTIVE });
  }

  async updatePost(id: string, params: Partial<PostDto> & Partial<UpdatePostDto> & Partial<Posts>) {
    //WHAT: find post
    const post = await this.findById(id);
    if (!post) {
      ErrorHelper.BadRequestException('Bài viết không tồn tại');
    }

    let location = post.location;

    //WHAT: check new location
    if (params.location_id) {
      const newLocation = await this.locationsService.findById(params.location_id);
      if (!newLocation) {
        ErrorHelper.BadRequestException('Địa chỉ không tồn tại');
      }
      location = { ...newLocation };
    }

    return await this.repo.updateById(id, { ...params, location });
  }

  async likePost(user, id: string) {
    if (!user) {
      ErrorHelper.UnauthorizedException('Người dùng chưa đăng nhập');
    }
    const author = await this.usersService.findById(user._id);
    if (!author) {
      ErrorHelper.UnauthorizedException('Người dùng không tồn tại');
    }
    const post = await this.findById(id);
    if (!post) {
      ErrorHelper.BadRequestException('Bài viết không tồn tại');
    }

    const newPostLike = author.posts_like ? [...author.posts_like, id] : [id];
    await this.usersService.updateUser(author._id, { posts_like: [...newPostLike] });
    return await this.updatePost(id, { like: post.like + 1 });
  }

  async ratePost(user, id: string, rate: number) {
    if (!user) {
      ErrorHelper.UnauthorizedException('Người dùng chưa đăng nhập');
    }
    const author = await this.usersService.findById(user._id);
    if (!author) {
      ErrorHelper.UnauthorizedException('Người dùng không tồn tại');
    }
    const post = await this.findById(id);
    if (!post) {
      ErrorHelper.BadRequestException('Bài viết không tồn tại');
    }

    const newPostRate = author.posts_rate ? [...author.posts_rate, { id, rate }] : [{ id, rate }];
    const userup = await this.usersService.updateUser(author._id, { posts_rate: [...newPostRate] });
    console.log(userup);

    const newRates = post.rates ? [...post.rates, rate] : [rate];
    const newRate = newRates.reduce((sum, value) => sum + value, 0) / newRates.length;

    return await this.updatePost(id, { rates: [...newRates], rate: newRate });
  }

  async commentPost(user, id: string, comment: string) {
    if (!user) {
      ErrorHelper.UnauthorizedException('Người dùng chưa đăng nhập');
    }
    const author = await this.usersService.findById(user._id);
    if (!author) {
      ErrorHelper.UnauthorizedException('Người dùng không tồn tại');
    }
    const post = await this.findById(id);
    if (!post) {
      ErrorHelper.BadRequestException('Bài viết không tồn tại');
    }

    return await this.updatePost(id, {
      comments: [...post.comments, { user_name: author.user_name || '', comment }],
    });
  }
}
