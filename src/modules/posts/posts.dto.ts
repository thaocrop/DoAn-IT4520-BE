import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Status } from 'src/base';

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
}
