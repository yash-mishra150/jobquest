import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggerGuard implements CanActivate {
  private logger = new Logger('HTTP');

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, originalUrl } = request;
    const startTime = Date.now();

    const ip = request.headers['x-forwarded-for'] || request.ip;
    const userAgent = request.headers['user-agent'] || '';
    const referer = request.headers['referer'] || '';

    // Log request information
    this.logger.log(
      `REQUEST: ${method} ${originalUrl} - UA: ${userAgent}${
        referer ? ` - Referer: ${referer}` : ''
      }`,
    );

    // Store original send method
    const originalSend = response.send;

    // Override send method to log response
    response.send = function (...args: any[]) {
      const responseTime = Date.now() - startTime;
      const statusCode = response.statusCode || 200;

      Logger.log(
        `RESPONSE: ${method} ${originalUrl} ${statusCode} ${responseTime}ms`,
      );

      return originalSend.apply(this, args);
    };

    return true;
  }
}
