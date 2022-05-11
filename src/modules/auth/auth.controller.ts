import { Controller, Post, Body, Res, Get } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto, AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ping')
  async ping() {
    return 'PONG';
  }

  @Post('login')
  async login(@Body() payload: AuthDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(payload);

    res.json({ accessToken, refreshToken });
    return { accessToken, refreshToken };
  }

  @Post('register')
  async register(@Body() payload: AuthDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.register(payload);

    res.json({ accessToken, refreshToken });
    return {};
  }
}
