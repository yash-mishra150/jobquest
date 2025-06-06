import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IpMiddleware } from './middleware/ipRestriction/ip.middleware';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongodbModule } from './mongodb/mongodb.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, MongodbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Uncomment the following line to use the IP restriction middleware
    consumer.apply(IpMiddleware).forRoutes('*');
  }
}