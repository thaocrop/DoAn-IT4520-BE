import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/authenticate.guard';

import { PostDto, PostPageDto } from './posts.dto';
import { PostsService } from './posts.service';

@Controller('posts')
@UseGuards(AuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('')
  async getList(@Query() params: PostPageDto) {
    return await this.postsService.getList(params);
  }

  @Post('')
  async create(@Request() req, @Body() data: PostDto) {
    const user = req.user;

    return await this.postsService.create(user, data);
  }

  @Get('/all')
  async getAll() {
    return await this.postsService.getAll();
  }

  @Get('/:id')
  async getDetail(@Param('id') id: string) {
    return await this.postsService.findById(id);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.postsService.delete(id);
  }
}
