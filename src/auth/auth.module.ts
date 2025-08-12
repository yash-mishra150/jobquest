import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongodbModule } from 'src/mongodb/mongodb.module';
import { JwtTokenService } from './jwt/jwt.service';
import { JwtTokenBlackListInterceptor } from './jwt/blacklistingTokens/jwt-token-black-list.interceptor';
import { JwtTokenCheckInterceptor } from './jwt/TokenCheck/jwt-token-check.interceptor';
import { JwtBlacklistService } from './jwt/blacklistingTokens/jwt-blacklist.service';

@Module({
  imports: [
    ConfigModule, // To access .env
    MongodbModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTokenService,
    JwtTokenBlackListInterceptor,
    JwtTokenCheckInterceptor,
    JwtBlacklistService,
  ],
  exports: [
    AuthService,
    JwtTokenService,
    JwtTokenBlackListInterceptor,
    JwtTokenCheckInterceptor,
  ],
})
export class AuthModule {}
