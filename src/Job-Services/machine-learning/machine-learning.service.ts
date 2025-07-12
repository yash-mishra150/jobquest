import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';
import { OpportunityDto } from 'src/dto/Opportunity.dto';



@Injectable()
export class MachineLearningService {
  private readonly BaseUrl: string;
  constructor(private readonly configService: ConfigService) {
    this.BaseUrl = process.env.BASE_URL_ML || '';
  }

  async jobVerify(jobDTO: OpportunityDto): Promise<any> {
    try {
      const response = axios.post(`${this.BaseUrl}/verify-job`, jobDTO, {
        headers: {
          'Content-Type': 'Application/json',
          Connection: 'keep-alive',
        },
      });

      return response;
    } catch (error) {
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
