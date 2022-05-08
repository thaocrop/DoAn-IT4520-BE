import { Injectable } from '@nestjs/common';
import { USER } from 'src/constants/base.constant';

@Injectable()
export class UsersService {
  async findOne() {
    return USER;
  }

  async findById(id: string) {
    console.log(id);
    return USER;
  }
}
