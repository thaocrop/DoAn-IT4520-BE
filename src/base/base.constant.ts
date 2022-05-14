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

export const messageError = {
  FILE_NOT_FOUND: 'File not found!',
  FILE_REQUIRE_SINGLE: 'The feature only upload 1 file',
  FILE_TYPE_INVALID: 'Filetype invalid',
  FILE_OVERSIZE: 'FILE oversize',
  FILES_NOT_FOUND: 'FILE not found',
};
