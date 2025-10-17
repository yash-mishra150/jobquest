import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { MongoClient } from 'mongodb';
import { JwtTokenService } from 'src/auth/jwt/jwt.service';
import { JobBaseDto } from 'src/dto/job-base.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class JobsService {
  constructor(
    @Inject('MONGO_CLIENT') private readonly client: MongoClient,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async createJob(@Req() req: FastifyRequest) {
    const data: JobBaseDto = req.body as JobBaseDto;
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found',
      };
    }

    const tokenData = await this.jwtTokenService.verifyToken(accessToken);
    const db = this.client.db();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({
      email: tokenData.email,
      phone: tokenData.phone,
      name: tokenData.name,
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const jobCollection = db.collection('jobs');
    await jobCollection.insertOne({
      companyId: user._id,
      ...data,
    });

    return {
      success: true,
      message: 'Job created successfully',
    };
  }

  async updateJob(jobId: string, @Req() req: FastifyRequest) {
    if (!ObjectId.isValid(jobId)) {
      throw new BadRequestException('Invalid job ID format');
    }

    const data: Partial<JobBaseDto> = req.body as Partial<JobBaseDto>;

    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('No update data provided');
    }

    const db = this.client.db();
    const jobCollection = db.collection('jobs');

    const existingJob = await jobCollection.findOne({
      _id: new ObjectId(jobId),
    });
    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    try {
      const result = await jobCollection.updateOne(
        { _id: new ObjectId(jobId) },
        { $set: data },
      );

      if (result.modifiedCount === 0) {
        throw new InternalServerErrorException('Failed to update the job');
      }

      return {
        success: true,
        message: 'Job updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('An error occurred during update');
    }
  }

  async deleteJob(jobId: string) {
    if (!ObjectId.isValid(jobId)) {
      throw new BadRequestException('Invalid job ID format');
    }

    const db = this.client.db();
    const jobCollection = db.collection('jobs');

    const existingJob = await jobCollection.findOne({
      _id: new ObjectId(jobId),
    });
    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    try {
      await jobCollection.deleteOne({ _id: new ObjectId(jobId) });
    } catch (error) {
      throw new InternalServerErrorException('An error occurred during deletion');
    }

    return {
      success: true,
      message: 'Job deleted successfully',
    };
  }

  async getJob(@Req() req: FastifyRequest) {
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found',
      };
    }

    const tokenData = await this.jwtTokenService.verifyToken(accessToken);
    const db = this.client.db();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({
      email: tokenData.email,
      phone: tokenData.phone,
      name: tokenData.name,
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const jobCollection = db.collection('jobs');
    const jobs = await jobCollection.find({ companyId: user._id }).toArray();

    const sanitized = jobs.map((job) => {
      const j: any = { ...job };
      delete j._id;
      delete j.companyId;
      return j;
    });

    return {
      success: true,
      message: 'Jobs retrieved successfully',
      data: sanitized,
    };
  }
}
