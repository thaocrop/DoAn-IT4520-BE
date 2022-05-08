import { UserType } from 'src/enums/user.enum';

export interface IAuthPermission {
  userType: UserType;
  permission?: string;
}

export interface IGenerateJWT {
  id: string;
}
