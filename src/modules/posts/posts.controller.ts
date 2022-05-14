import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/authenticate.guard';

import { PostDto } from './posts.dto';
import { PostsService } from './posts.service';

@Controller('posts')
@UseGuards(AuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('')
  async getAll() {
    return await this.postsService.getAll();
  }

  @Post('')
  async create(@Request() req, @Body() data) {
    const user = req.user;
    return await this.postsService.create(user, data);
  }
}
