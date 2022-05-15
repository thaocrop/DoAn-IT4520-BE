import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TokenHelper } from 'src/helpers/token.helper';
import { ConfigService } from 'src/shared/config/config.service';
import { ErrorHelper } from 'src/helpers/error.utils';

import { UsersService } from '../users/users.service';

import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) private userService: UsersService,
    private configService: ConfigService,
  ) {}

  async login(params: AuthDto) {
    //WHAT: check user name
    const user = await this.userService.findOne({ user_name: params.user_name });
    if (!user) {
      ErrorHelper.UnauthorizedException('Tài Khoản chưa tồn tại.');
    }
    //check password
    const checkPW = await this.userService.verifyPassword(user, params.password);

    if (!checkPW) {
      ErrorHelper.UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác.');
    }

    return this._generateToken(user._id);
  }

  async register(params: AuthDto) {
    //WHAT: check existed user name
    const existedUser = await this.userService.findOne({ user_name: params.user_name });
    if (existedUser) {
      ErrorHelper.BadRequestException('Tài khoản đã tồn tại');
    }

    //WHAT: make new user
    const user = await this.userService.register(params);

    return this._generateToken(user._id);
  }

  async verifyUser(id: string) {
    return this.userService.findById(id);
  }

  private _generateToken(id: string) {
    const payload = {
      id,
    };
    const secret = this.configService.accessTokenSecret;
    const expiresIn = this.configService.accessTokenExpires;
    const { token: accessToken, expires } = TokenHelper.generate(payload, secret, expiresIn);
    const refreshToken = this._generateRefreshToken(id);

    return {
      accessToken,
      expires,
      refreshToken,
    };
  }

  private _generateRefreshToken(id: string) {
    return `refresh-token-${id}`;
  }
}
