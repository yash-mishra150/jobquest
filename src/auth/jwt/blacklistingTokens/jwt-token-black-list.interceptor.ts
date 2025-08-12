import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { MongoClient, Collection } from 'mongodb';
import { Observable } from 'rxjs';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class JwtTokenBlackListInterceptor
  implements NestInterceptor, OnModuleInit
{
  private readonly logger = new Logger(JwtTokenBlackListInterceptor.name);
  private collection: Collection;

  constructor(@Inject('MONGO_CLIENT') private readonly client: MongoClient) {}

  async onModuleInit() {
    try {
      const db = this.client.db(); // default DB or specify here if needed
      this.collection = db.collection('blacklist');

      // Create TTL index on expireAt for automatic deletion
      await this.collection.createIndex(
        { expireAt: 1 },
        { expireAfterSeconds: 0 },
      );
      // Unique index on token for fast lookup & uniqueness
      await this.collection.createIndex({ token: 1 }, { unique: true });
      // Index on userId for querying if needed
      await this.collection.createIndex({ userId: 1 });

      this.logger.log('Blacklist indexes created successfully.');
    } catch (error) {
      this.logger.error('Error creating blacklist indexes', error);
    }
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    if (!this.collection) {
      this.logger.error('Blacklist collection not initialized');
      throw new HttpException(
        'Server not ready',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const res = context.switchToHttp().getResponse<FastifyReply>();

    // Attempt to get tokens from cookies
    let accessToken = req.cookies?.access_token;
    let refreshToken = req.cookies?.refresh_token;

    // Fallback: parse cookies manually if not found
    if ((!accessToken || !refreshToken) && req.headers.cookie) {
      const cookieObj: { [key: string]: string } = req.headers.cookie
        .split(';')
        .map(c => c.trim().split('='))
        .reduce(
          (acc, [key, val]) => ({ ...acc, [key]: decodeURIComponent(val) }),
          {},
        );
      accessToken = accessToken || cookieObj['access_token'];
      refreshToken = refreshToken || cookieObj['refresh_token'];
    }

    // Support Bearer tokens from Authorization header as fallback
    if (!accessToken && req.headers.authorization?.startsWith('Bearer ')) {
      accessToken = req.headers.authorization.slice(7).trim();
    }

    this.logger.log('Checking if tokens are blacklisted', {
      method: req.method,
      url: req.url,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });

    if (!accessToken && !refreshToken) {
      throw new HttpException(
        'No authentication tokens provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const blacklistedAccessToken = accessToken
        ? await this.collection.findOne({ token: accessToken })
        : null;
      const blacklistedRefreshToken = refreshToken
        ? await this.collection.findOne({ token: refreshToken })
        : null;

      if (blacklistedAccessToken || blacklistedRefreshToken) {
        this.logger.warn('Blacklisted token found', {
          method: req.method,
          url: req.url,
          blacklistedAccessToken: !!blacklistedAccessToken,
          blacklistedRefreshToken: !!blacklistedRefreshToken,
        });

        throw new HttpException(
          'Token has been blacklisted',
          HttpStatus.FORBIDDEN,
        );
      }

      this.logger.log('Tokens are not blacklisted', {
        method: req.method,
        url: req.url,
      });

      return next.handle();
    } catch (error) {
      this.logger.error('Error occurred during token validation', {
        errorMessage: error.message,
        stack: error.stack,
        method: req.method,
        url: req.url,
      });

      throw new HttpException(
        error.message || 'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
