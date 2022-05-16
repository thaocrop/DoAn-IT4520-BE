import { Injectable } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { Status } from 'src/base';
import { comparePbkdf2, ErrorHelper, pbkdf2 } from 'src/helpers';
import { ConfigService } from 'src/shared/config/config.service';

import { AuthDto } from '../auth';

import { UserType } from './users.enum';
import { UserRepository } from './users.repository';
import { Users } from './users.schema';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UserRepository, private configService: ConfigService) {}

  async findOne(params: FilterQuery<Users>) {
    return await this.repo.findOne(params);
  }

  async getAll() {
    return await this.repo.findAll({ user_type: UserType.CLIENT });
  }

  async findById(id: string) {
    return await this.repo.findById(id);
  }

  async register(data: AuthDto) {
    //WHAT: create new user
    const newUser = {
      user_name: data.user_name,
      password: await pbkdf2(data.password),
      user_type: UserType.CLIENT,
      status: Status.ACTIVE,
    };

    return await this.repo.create(newUser);
  }

  async verifyPassword(user: Users, password: string) {
    return await comparePbkdf2(password, user.password);
  }

  async updateUser(id: string, params: Partial<Users>) {
    const user = await this.findById(id);
    if (!user) {
      ErrorHelper.BadRequestException('Bài viết không tồn tại');
    }
    console.log(params);
    return this.repo.updateById(id, params);
  }
}
