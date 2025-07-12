import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MachineLearningService } from './machine-learning.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { OpportunityDto } from 'src/dto/Opportunity.dto';
import { JwtTokenCheckInterceptor } from 'src/auth/jwt/TokenCheck/jwt-token-check.interceptor';
import { JwtTokenBlackListInterceptor } from 'src/auth/jwt/blacklistingTokens/jwt-token-black-list.interceptor';

@Controller('machine-learning')
export class MachineLearningController {
  constructor(private readonly mlServices: MachineLearningService) {}

  @UseInterceptors(JwtTokenCheckInterceptor)
  @UseInterceptors(JwtTokenBlackListInterceptor)
  @Post('extractResume')
  @UseInterceptors(FileInterceptor('resume'))
  async uploadResume(@UploadedFile() file: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException('PDF resume is required');
    }

    return await this.mlServices.extractResume(file);
  }

  @UseInterceptors(JwtTokenCheckInterceptor)
  @UseInterceptors(JwtTokenBlackListInterceptor)
  @Post('jobVerify')
  async VerifyJobs(jobDTO: OpportunityDto): Promise<any> {
    return this.mlServices.jobVerify(jobDTO);
  }
}
