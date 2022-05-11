import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  name: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
