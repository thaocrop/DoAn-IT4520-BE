import { IsEmail, IsString } from 'class-validator';
import { IsMatchPattern } from 'src/common/validators/IsMatchPattern.validation';
import { PASSWORD_PATTERN } from 'src/constants/base.constant';

export class LoginDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsMatchPattern(PASSWORD_PATTERN)
  password: string;
}
