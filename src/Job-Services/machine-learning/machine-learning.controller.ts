import {
  BadRequestException,
  Controller,
  Post,
  Body,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { MachineLearningService } from './machine-learning.service';
import { JobVerificationDto, OpportunityDto } from 'src/dto/Opportunity.dto';
import { JwtTokenCheckInterceptor } from 'src/auth/jwt/TokenCheck/jwt-token-check.interceptor';
import { JwtTokenBlackListInterceptor } from 'src/auth/jwt/blacklistingTokens/jwt-token-black-list.interceptor';
import { FastifyRequest } from 'fastify';

interface FastifyFile {
  encoding: string;
  fieldname: string;
  filename: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

// Define interfaces for return types
interface ResumeExtractResult {
  // Add properties based on the actual return type
  success: boolean;
  data: Record<string, unknown>;
}

interface JobVerifyResult {
  // Add properties based on the actual return type
  success: boolean;
  data: Record<string, unknown>;
}

@Controller('machine-learning')
export class MachineLearningController {
  constructor(private readonly mlServices: MachineLearningService) {}

  @UseInterceptors(JwtTokenCheckInterceptor)
  @UseInterceptors(JwtTokenBlackListInterceptor)
  @Post('extractResume')
  async uploadResume(
    @Req() request: FastifyRequest,
  ): Promise<ResumeExtractResult> {
    const rawRequest = request.raw;
    // @ts-expect-error - Fastify multipart adds this property
    const file = (await rawRequest.file()) as FastifyFile;
    
    if (!file || !file.buffer) {
      throw new BadRequestException('PDF resume is required');
    }

    return this.mlServices.extractResume(file) as Promise<ResumeExtractResult>;
  }

  @UseInterceptors(JwtTokenCheckInterceptor)
  @UseInterceptors(JwtTokenBlackListInterceptor)
  @Post('jobVerify')
  async VerifyJobs(@Body() jobDTO: JobVerificationDto): Promise<JobVerifyResult> {
    return this.mlServices.jobVerify(jobDTO) as Promise<JobVerifyResult>;
  }
}
