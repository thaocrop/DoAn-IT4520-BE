import { IsEnum, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Status } from 'src/base';

import { PostFilterType } from './posts.enum';

export class PostDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  location_id: string;

  @IsString()
  address: string;

  @IsString()
  short_description: string;

  @IsString()
  image_url: string;

  @IsString()
  content: string;
}
export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @IsEnum(Status, { each: true })
  status: Status;
}

export class PostPageDto {
  @IsOptional()
  @IsNumberString()
  page: number;

  @IsOptional()
  @IsNumberString()
  limit: number;

  @IsOptional()
  @IsString()
  @IsEnum(Status, { each: true })
  status?: Status;

  @IsOptional()
  @IsString()
  location_id?: string;

  @IsOptional()
  @IsString()
  @IsEnum(PostFilterType, { each: true })
  post_filter?: PostFilterType;
}

export class PostRateDto {
  @IsNumber()
  rate: number;
}

export class PostCommentDto {
  @IsString()
  comment: string;
}
