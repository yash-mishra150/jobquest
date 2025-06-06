import { ForbiddenException, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class IpMiddleware implements NestMiddleware {
  private logger = new Logger('IP-Restriction');

  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const allowedIps = ['127.0.0.1', '::1', '*']; // Add your allowed IPs here
    const clientIp = (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string | undefined;
    const isAllowed = allowedIps.some(ip => (clientIp ?? '').startsWith(ip));
    const Allowall = allowedIps.includes('*');
    
    this.logger.log(`Client IP: ${clientIp} attempting to access ${req.method} - ${req.url}`);
    
    if (Allowall) {
      this.logger.debug('Allowed unknown IP due to wildcard (*) in allowed IPs');
      next();
      return;
    }
    
    if (!isAllowed) {
      this.logger.warn(`Access denied for IP: ${clientIp}`);
      throw new ForbiddenException('IP not whitelisted');
      return;
    }
    
    this.logger.debug(`Access granted for IP: ${clientIp}`);
    next();
  }
}
