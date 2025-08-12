import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenService } from './jwt/jwt.service';

// Usage: @UseGuards(RoleGuardFactory('ROLE_CANDIDATE'))
export function RoleGuardFactory(requiredRole: string) {
  @Injectable()
  class RoleGuard implements CanActivate {
    // Must be public for dynamic guard classes in NestJS
    constructor(public readonly jwtTokenService: JwtTokenService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const token = request.cookies?.access_token;
      if (!token) {
        throw new UnauthorizedException(
          'Authentication token is missing. Please log in.',
        );
      }
      let payload: any;
      try {
        payload = await this.jwtTokenService.verifyToken(token);
      } catch {
        throw new UnauthorizedException(
          'Authentication token is invalid or expired. Please log in again.',
        );
      }
      if (!payload || !payload.Role) {
        throw new ForbiddenException(
          'User role information is missing in the authentication token.',
        );
      }
      if (payload.Role !== requiredRole) {
        throw new ForbiddenException(
          'You do not have the required permissions to access this resource.',
        );
      }
      (request as any).user = payload;
      return true;
    }
  }
  return RoleGuard;
}
