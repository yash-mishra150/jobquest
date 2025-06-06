import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(body: { name?: string }): string {
    return `Hello ${body.name || 'World'}!`;
  }
}
