import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly moduleRef: ModuleRef) {}

  check() {
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
    return baseStatus;
  }
}
