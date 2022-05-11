import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import { UserType } from 'src/modules/users/users.enum';

export function generate(input: createToken, expiresIn: string, secret: string): string {
  const token: JWT = {
    sub: input.userId,
    merchantId: input.merchantId,
    email: input.email,
    userType: input.userType,
    permissions: input.permissions,
  };

  const options = {
    expiresIn,
    issuer: 'rewardingPlatform',
    audience: 'rewardingPlatform:auth',
  };

  return jwt.sign(token, secret, options);
}

/** Validate an access token.
 * @throws Error if token is expired or not valid
 */
export function validate(accessToken: string, secret: string): JWT {
  try {
    const options: jwt.VerifyOptions = {
      algorithms: ['HS256'],
      issuer: 'rewardingPlatform',
      audience: 'rewardingPlatform:auth',
    };
    const payload = jwt.verify(accessToken, secret, options);
    return payload as JWT;
  } catch (e) {
    throw new UnauthorizedException();
  }
}

export function decode(accessToken: string): JWT {
  const token = jwt.decode(accessToken);
  return token as JWT;
}

export type JWT = {
  sub: string;
  email: string;
  merchantId: string;
  userType: UserType;
  permissions: string[];
};
export type createToken = {
  userId: string;
  email: string;
  merchantId: string;
  userType: UserType;
  permissions: string[];
};
