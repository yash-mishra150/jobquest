import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { JwtTokenService } from '../jwt.service';

@Injectable()
export class JwtTokenCheckInterceptor implements NestInterceptor {
  constructor(private readonly jwtTokenService: JwtTokenService) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {

    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const res = context.switchToHttp().getResponse<FastifyReply>();

    let accessToken = req.cookies?.access_token;
    let refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new HttpException('Session is Over', HttpStatus.UNAUTHORIZED);
    }

    if (!accessToken && refreshToken) {
      const decodedToken = await this.jwtTokenService.verifyToken(refreshToken);

      const filteredPayload = (({ iat, exp, ...rest }) => rest)(decodedToken);


      const accesstoken = await this.jwtTokenService.signToken(filteredPayload, '1d');

      (res as any).setCookie('access_token', accesstoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, 
        sameSite: 'lax',
      })
    }
    return next.handle();
  }
}
