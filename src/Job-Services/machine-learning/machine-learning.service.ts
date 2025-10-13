import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Logger } from '@nestjs/common';
import * as FormData from 'form-data';
import { JobVerificationDto, OpportunityDto } from 'src/dto/Opportunity.dto';

@Injectable()
export class MachineLearningService {
  private readonly BaseUrl: string;
  constructor(private readonly configService: ConfigService) {
    this.BaseUrl = process.env.BASE_URL_ML || '';
  }

  async jobVerify(jobDTO: JobVerificationDto): Promise<any> {
    try {
      Logger.log('Job Verification Service Invoked');
      Logger.log('Base URL:', `${this.BaseUrl}/verify-job`);
      Logger.log('Job DTO:', jobDTO);
      const response = await axios.post(`${this.BaseUrl}/verify-job`, jobDTO, {
        headers: {
          'Content-Type': 'Application/json',
          Connection: 'keep-alive',
        },
      });

      Logger.log('Job Verification Service Response:', response.data);

      return response.data;
    } catch (error) {
      Logger.error('Error in Job Verification Service', error.response.message);
      throw new HttpException(error.response.message, HttpStatus.BAD_REQUEST);
    }
  }

  async extractResume(file: any): Promise<any> {
    try {
      const form = new FormData();
      form.append('resume', file.buffer, {
        filename: file.filename || 'resume.pdf',
        contentType: file.mimetype || 'application/pdf',
      });

      const response = await axios.post(
        `${this.BaseUrl}/extract-resume`,
        form,
        {
          headers: form.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Resume extraction failed';
      const statusCode = error?.response?.status || HttpStatus.BAD_REQUEST;

      throw new HttpException(message, statusCode);
    }
  }
}
