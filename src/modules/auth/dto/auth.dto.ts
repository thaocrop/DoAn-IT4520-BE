import { IsEmail, IsString, Matches } from 'class-validator';
import { IsMatchPattern } from 'src/common/validators/IsMatchPattern.validation';

export class LoginDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  // @IsMatchPattern(PASSWORD_PATTERN)
  password: string;
}
export class AuthDto {
  @IsString()
  user_name: string;

  @IsString()
  // @IsMatchPattern(PASSWORD_PATTERN)
  password: string;
}
