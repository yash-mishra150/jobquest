import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly moduleRef: ModuleRef,
  ) {}

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

  @Get('microservices-health')
  async microservicesHealth() {
    const logger = new Logger('MicroservicesHealthCheck');
    const results = {
      status: 'checking',
      naukri: 'unknown',
      shine: 'unknown',
      timestamp: new Date().toISOString(),
    };

    try {
      // Check Naukri service
      const naukriClient = this.moduleRef.get('NAUKRI_SERVICE');
      const naukriPing = await firstValueFrom(
        naukriClient.send('ping', {}),
      ).catch(error => {
        logger.error(`Failed to ping Naukri service: ${error.message}`);
        return null;
      });
      results.naukri = naukriPing ? 'healthy' : 'unhealthy';
    } catch (error) {
      results.naukri = 'error';
      logger.error(`Error checking Naukri service: ${error.message}`);
    }

    try {
      // Check Shine service
      const shineClient = this.moduleRef.get('SHINE_SERVICE');
      const shinePing = await firstValueFrom(
        shineClient.send('ping', {}),
      ).catch(error => {
        logger.error(`Failed to ping Shine service: ${error.message}`);
        return null;
      });
      results.shine = shinePing ? 'healthy' : 'unhealthy';
    } catch (error) {
      results.shine = 'error';
      logger.error(`Error checking Shine service: ${error.message}`);
    }

    results.status =
      results.naukri === 'healthy' && results.shine === 'healthy'
        ? 'healthy'
        : 'degraded';

    return results;
  }
}
