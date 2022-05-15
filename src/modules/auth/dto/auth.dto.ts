import { IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  user_name: string;

  @IsString()
  // @IsMatchPattern(PASSWORD_PATTERN)
  password: string;
}
