import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Status } from 'src/base';
import { calcDistance, ErrorHelper } from 'src/helpers';
import { ConfigService } from 'src/shared/config/config.service';

import { UsersService } from '../users';

import { LocationsService } from './../locations/locations.service';
import { PostDto, PostPageDto, UpdatePostDto } from './posts.dto';
import { PostsRepository } from './posts.repository';
import { Posts, PostsDocument } from './posts.schema';
import { PostFilterType } from './posts.enum';

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
    };
    let sortOption: any = {
      createdAt: -1,
    };
    // if {status}

    if (params.post_filter) {
      if (params.post_filter === PostFilterType.LIKE) {
        sortOption = { like: -1 };
      } else if (params.post_filter === PostFilterType.RATE) {
        sortOption = { rate: -1 };
      }
    }
    let aggQuery: any = [
      {
        $match: {
          status: status || { $ne: Status.DELETED },
        },
      },
      {
        $sort: sortOption,
      },
    ];

    if (params.post_filter && params.post_filter === PostFilterType.COMMENT) {
      aggQuery = [
        {
          $match: {
            status: status || { $ne: Status.DELETED },
          },
        },
        {
          $addFields: { comments_count: { $size: { $ifNull: ['$comments', []] } } },
        },
        {
          $sort: { comments_count: -1 },
        },
        {
          $project: { comments_count: 0 },
        },
      ];
    }

    if (params.location_id) {
      return await this.getByLocation(params);
    }

    //@ts-ignore
    const aggregateModel = this.repo.getModel().aggregate(aggQuery);
    const res = await this.repo.getAggModel().aggregatePaginate(aggregateModel, options);
    return res;
  }

  async getByLocation(params: PostPageDto) {
    const { page, limit, location_id } = params;
    if (location_id) {
      const location = await this.locationsService.findById(location_id);
      if (!location) {
        ErrorHelper.BadRequestException('Địa chỉ không tồn tại');
      }
      const lmt = limit ? Number(limit) : 10;
      const { lat, lng } = location;
      const totalPost = await this.getAll();
      const totalPages = Math.ceil(totalPost.length / lmt);
      const posts: Array<any> = totalPost
        .map((post) => {
          return { ...post, distance: calcDistance(lat, lng, post.location.lat, post.location.lng) };
        })
        .sort((a, b) => a.distance - b.distance);
      return {
        docs: posts.slice(lmt * (page - 1), page * lmt),
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        nextPage: null,
        page: Number(page),
        pagingCounter: 1,
        prevPage: null,
        totalDocs: totalPost.length,
        totalPages,
      };
    }
    return this.getList(params);
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
    await this.usersService.updateUser(author._id, { posts_rate: [...newPostRate] });

    const newRates = post.rates ? [...post.rates, rate] : [rate];
    const newRate = newRates.reduce((sum, value) => sum + value, 0) / newRates.length;

    return await this.updatePost(id, { rates: [...newRates], rate: Number(newRate.toFixed(2)) });
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
