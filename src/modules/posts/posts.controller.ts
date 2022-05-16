import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/authenticate.guard';

import { PostCommentDto, PostDto, PostPageDto, PostRateDto, UpdatePostDto } from './posts.dto';
import { Posts } from './posts.schema';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('')
  async getList(@Query() params: PostPageDto) {
    return await this.postsService.getList(params);
  }

  @Post('')
  @UseGuards(AuthGuard)
  async create(@Request() req, @Body() data: PostDto) {
    const user = req.user;

    return await this.postsService.create(user, data);
  }

  @Get('/all')
  @UseGuards(AuthGuard)
  async getAll() {
    return await this.postsService.getAll();
  }

  @Get('/:id')
  async getDetail(@Param('id') id: string) {
    return await this.postsService.findById(id);
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() data: Partial<PostDto> & Partial<UpdatePostDto>) {
    return await this.postsService.updatePost(id, data);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string) {
    return await this.postsService.delete(id);
  }

  @Post('/:id/like')
  @UseGuards(AuthGuard)
  async likePost(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return await this.postsService.likePost(user, id);
  }

  @Post('/:id/rate')
  @UseGuards(AuthGuard)
  async ratePost(@Request() req, @Param('id') id: string, @Body() params: PostRateDto) {
    const user = req.user;
    return await this.postsService.ratePost(user, id, params.rate);
  }

  @Post('/:id/comment')
  @UseGuards(AuthGuard)
  async commentPost(@Request() req, @Param('id') id: string, @Body() params: PostCommentDto) {
    const user = req.user;
    return await this.postsService.commentPost(user, id, params.comment);
  }
}
