import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { JwtTokenBlackListInterceptor } from 'src/auth/jwt/blacklistingTokens/jwt-token-black-list.interceptor';
import { JwtTokenCheckInterceptor } from 'src/auth/jwt/TokenCheck/jwt-token-check.interceptor';

@UseInterceptors(JwtTokenCheckInterceptor)
@UseInterceptors(JwtTokenBlackListInterceptor)
@Controller('jobs')
export class JobsController {

    @Post('create')
    async createJob() {
        
        return { message: 'Job created successfully' };
    }

    @Post('apply')
    async applyJob() {
        return { message: 'Applied to job successfully' };
    }

    @Post('status')
    async getJobStatus() {
        return { message: 'Job status retrieved successfully' };
    }
}