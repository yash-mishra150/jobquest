import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtTokenCheckInterceptor } from './auth/jwt/TokenCheck/jwt-token-check.interceptor';
import { JwtTokenBlackListInterceptor } from './auth/jwt/blacklistingTokens/jwt-token-black-list.interceptor';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseInterceptors(JwtTokenCheckInterceptor, JwtTokenBlackListInterceptor)
  @Get()
  getHello(): string {
    return this.appService.getHello({});
  }

  @Post('test')
  sayHello(@Body() body: { name?: string }): string {
    return this.appService.getHello(body);
  }
  @Get('app-health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        naukri: 'healthy',
        shine: 'healthy',
      },
    };
  }
}
