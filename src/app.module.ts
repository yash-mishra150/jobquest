import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IpMiddleware } from './middleware/ipRestriction/ip.middleware';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongodbModule } from './mongodb/mongodb.module';
import { MachineLearningController } from './Job-Services/machine-learning/machine-learning.controller';
import { ScrapperController } from './Job-Services/scrapper/scrapper.controller';
import { MachineLearningService } from './Job-Services/machine-learning/machine-learning.service';
import { NaukriService } from './Job-Services/scrapper/naukri/naukri.service';
import { ShineService } from './Job-Services/scrapper/shine/shine.service';
import { TimesjobService } from './Job-Services/scrapper/timesjobs/timesjob.service';
import { HealthModule } from './health/health.module';
import { ScrapperThreadService } from './Job-Services/scrapper/thread.service';
import { CompanyLegitimacyController } from './Job-Services/company-legitimacy/company-legitimacy.controller';
import { CompanyLegitimacyService } from './Job-Services/company-legitimacy/company-legitimacy.service';
import { JobsService } from './Job-Services/jobs/jobs.service';
import { JobsController } from './Job-Services/jobs/jobs.controller';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, MongodbModule, HealthModule],
  controllers: [
    AppController,
    MachineLearningController,
    ScrapperController,
    CompanyLegitimacyController,
    JobsController,
  ],
  providers: [
    AppService,
    MachineLearningService,
    NaukriService,
    ShineService,
    ScrapperThreadService,
    CompanyLegitimacyService,
    TimesjobService,
    JobsService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Uncomment the following line to use the IP restriction middleware
    consumer.apply(IpMiddleware).forRoutes('*');
  }
}
