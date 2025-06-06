import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { LoggerGuard } from './guards/logger/logger.guard';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { Logger, ValidationPipe } from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const fastifyAdapter = new FastifyAdapter();

  // Register cookie parser plugin with Fastify
  await fastifyAdapter.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'my-secret', // should match your cookie signing secret
    parseOptions: {}, // options for cookie parsing
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  // Security headers via Helmet
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        scriptSrc: [`'self'`, `'unsafe-inline'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
      },
    },
  });

  // Rate limiting
  await app.register(fastifyRateLimit, {
    max: 20,
    timeWindow: '1 minute',
    onBanReach(req, key) {
      logger.warn(`Rate limit reached for IP: ${key}`);
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalGuards(new LoggerGuard());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Listening on port: ${port}`);
}

bootstrap();
