import {
  Injectable,
  Inject,
  Logger,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MongoClient, Collection } from 'mongodb';
import { JwtTokenService } from '../jwt.service';

@Injectable()
export class JwtBlacklistService implements OnModuleInit {
  private readonly logger = new Logger(JwtBlacklistService.name);
  private collection: Collection;

  constructor(
    @Inject('MONGO_CLIENT') private readonly client: MongoClient,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async onModuleInit() {
    const db = this.client.db();
    this.collection = db.collection('blacklist');
    await this.collection.createIndex(
      { expireAt: 1 },
      { expireAfterSeconds: 0 },
    );
    await this.collection.createIndex({ token: 1 }, { unique: true });
  }

  async blacklistToken(token: string) {
    if (!token) {
      throw new HttpException('Token is undefined', HttpStatus.BAD_REQUEST);
    }

    try {
      const decoded = await this.jwtTokenService.verifyToken(token);
      const expireAt = new Date(decoded.exp * 1000);

      await this.collection.insertOne({
        token,
        userId: decoded.userId || decoded.sub || 'unknown',
        tokenType: decoded.type || 'unknown',
        createdAt: new Date(),
        expireAt,
      });

      // this.logger.warn(`Blacklisted token: ${token}`);
    } catch (err: any) {
      if (err.code === 11000) {
        this.logger.warn('Token is already blacklisted');
        return;
      }
      this.logger.error('Error blacklisting token', err);
      throw new HttpException(
        'Failed to blacklist token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    if (!token) return false;
    const found = await this.collection.findOne({ token });
    return !!found;
  }
}
