import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly moduleRef: ModuleRef) {}

  async check() {
    const baseStatus: {
      status: string;
      timestamp: string;
      services: { [key: string]: string };
    } = {
      status: 'up',
      timestamp: new Date().toISOString(),
      services: {
        api: 'up',
      },
    };

    try {
      // Try to get microservice clients
      const naukriClient = this.moduleRef.get('NAUKRI_SERVICE', {
        strict: false,
      });
      const shineClient = this.moduleRef.get('SHINE_SERVICE', {
        strict: false,
      });

      // If we have the microservice clients, check their status
      if (naukriClient) {
        try {
          const naukriPing = await firstValueFrom(
            naukriClient.send('ping', {}),
          ).catch(error => {
            this.logger.warn(`Failed to ping Naukri service: ${error.message}`);
            return null;
          });
          baseStatus.services['naukri'] = naukriPing ? 'up' : 'down';
        } catch (error) {
          baseStatus.services['naukri'] = 'error';
          this.logger.error(`Error checking Naukri service: ${error.message}`);
        }
      }

      if (shineClient) {
        try {
          const shinePing = await firstValueFrom(
            shineClient.send('ping', {}),
          ).catch(error => {
            this.logger.warn(`Failed to ping Shine service: ${error.message}`);
            return null;
          });
          baseStatus.services['shine'] = shinePing ? 'up' : 'down';
        } catch (error) {
          baseStatus.services['shine'] = 'error';
          this.logger.error(`Error checking Shine service: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.warn(`Could not check microservices: ${error.message}`);
    }

    return baseStatus;
  }
}
