import { UserType } from 'src/enums/user.enum';

// password partern
export const PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})';
export const SPEC_KEY = 'SPEC';

export const USER = {
  id: '1',
  password: 'Test@123',
  email: 'test@email.com',
  name: 'name',
  phone: '0123456789',
  userType: UserType.CLIENT,
  permissions: [],
};
