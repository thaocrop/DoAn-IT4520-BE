import { IsString } from 'class-validator';

export class PostDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  location_id: string;

  @IsString()
  short_description: string;

  @IsString()
  image_url: string;

  @IsString()
  content: string;
}
