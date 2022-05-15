import { Controller, Post, Body, Res, Get } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ping')
  async ping() {
    return 'PONG';
  }

  @Post('login')
  async login(@Body() payload: AuthDto) {
    const { accessToken, refreshToken } = await this.authService.login(payload);

    return { accessToken, refreshToken };
  }

  @Post('register')
  async register(@Body() payload: AuthDto) {
    const { accessToken, refreshToken } = await this.authService.register(payload);

    return { accessToken, refreshToken };
  }
}
