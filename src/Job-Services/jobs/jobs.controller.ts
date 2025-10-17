import { Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtTokenBlackListInterceptor } from 'src/auth/jwt/blacklistingTokens/jwt-token-black-list.interceptor';
import { JwtTokenCheckInterceptor } from 'src/auth/jwt/TokenCheck/jwt-token-check.interceptor';
import { RoleGuardFactory } from 'src/auth/role.guard';
import { JobsService } from './jobs.service';
import { FastifyReply, FastifyRequest } from 'fastify';


@UseInterceptors(JwtTokenCheckInterceptor)
@UseInterceptors(JwtTokenBlackListInterceptor)
@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) {}

    @UseGuards(RoleGuardFactory('ROLE_EMPLOYER'))
    @Post('create')
    async createJob(@Req() req: FastifyRequest) {
        const result = await this.jobsService.createJob(req);
        return result;
    }

    @UseGuards(RoleGuardFactory('ROLE_EMPLOYER'))
    @Put('update/:id')
    async updateJob(@Param('id') id: string, @Req() req: FastifyRequest) {
        const result = await this.jobsService.updateJob(id, req);
        return result;
    }

    @UseGuards(RoleGuardFactory('ROLE_EMPLOYER'))
    @Delete('delete/:id')
    async deleteJob(@Param('id') id: string) {
        const result = await this.jobsService.deleteJob(id);
        return result;
    }

    @UseGuards(RoleGuardFactory('ROLE_EMPLOYER'))
    @Get('get')
    async getJob(@Req() req: FastifyRequest) {
        const result = await this.jobsService.getJob(req);
        return result;
    }

    @UseGuards(RoleGuardFactory('ROLE_CANDIDATE'))
    @Post('apply/:id')
    async applyJob(@Param('id') id: string, @Req() req: FastifyRequest) {
        return { success: false, message: 'Feature not implemented yet' };
    }
}