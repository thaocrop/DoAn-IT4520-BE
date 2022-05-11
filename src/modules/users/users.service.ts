import { Injectable } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { Status } from 'src/base';
import { EncryptHelper } from 'src/helpers/encrypt.helper';
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

  async findById(id: string) {
    console.log('id', id);
    return await this.repo.findById(new Types.ObjectId(id));
  }

  async register(data: AuthDto) {
    //WHAT: create new user
    const newUser = {
      user_name: data.user_name,
      password: await EncryptHelper.hash(data.password),
      user_type: UserType.CLIENT,
      status: Status.ACTIVE,
    };

    return await this.repo.create(newUser);
  }
}
