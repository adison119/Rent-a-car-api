import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const permissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!permissions?.length) {
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();
    const { user } = request;
    if (!user) {
      throw new ForbiddenException('Forbidden');
    }
    const role = user.role;
    if (role === 'SUPERADMIN') {
      return true;
    }
    if (role && permissions.includes(role)) {
      return true;
    }
    throw new ForbiddenException('Forbidden');
  }
}
