import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestHeadersEnum, SPEC_KEY } from 'src/base';
import { ErrorHelper, TokenHelper } from 'src/helpers';
import { IAuthPermission, IGenerateJWT } from 'src/interfaces';
import { AuthService } from 'src/modules/auth/auth.service';
import { ConfigService } from 'src/shared/config/config.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    // const apiPermissions = this.reflector.getAllAndOverride<IAuthPermission[]>(SPEC_KEY, [
    //   context.getHandler(),
    //   context.getClass(),
    // ]);
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers[RequestHeadersEnum.Authorization] || String(req.cookies.JWT);
    const { password, ...user } = await this.verifyAccessToken(authorization);

    // apply user property to request
    req.user = user;
    // if (!apiPermissions || !apiPermissions.length) {
    //   return true;
    // }
    // const { userType, permissions } = user;
    // const rolePermission = apiPermissions.find((p) => p.userType === userType);

    // return this.checkPermission(permissions, rolePermission);
    return !!user;
  }

  checkPermission(userPermissions: string[], rolePermission: IAuthPermission): boolean {
    if (!rolePermission) return false;
    if (rolePermission.permission) {
      return userPermissions.includes(rolePermission.permission);
    }
    return true;
  }

  async verifyAccessToken(authorization: string) {
    const [bearer, accessToken] = authorization.split(' ');
    if (bearer == 'Bearer' && accessToken != '') {
      const payload = TokenHelper.verify<IGenerateJWT>(accessToken, this.configService.accessTokenSecret);

      const user = await this.authService.verifyUser(payload.id);
      if (!user) {
        ErrorHelper.UnauthorizedException('Unauthorized Exception');
      }
      return user;
    } else {
      ErrorHelper.UnauthorizedException('Unauthorized');
    }
  }
}
