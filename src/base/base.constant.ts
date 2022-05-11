import { UserType } from 'src/enums/user.enum';

// password partern
export const PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})';
export const SPEC_KEY = 'SPEC';

export const USER = {
  id: '1',
  password: 'password@123',
  username: 'user123',
  userType: UserType.CLIENT,
  permissions: [],
};
