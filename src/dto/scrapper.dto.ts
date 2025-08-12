import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScrapperQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsArray()
  jobs?: string[];

  @IsOptional()
  @IsArray()
  locations?: string[];

  @IsOptional()
  @IsBoolean()
  work_from_home?: boolean;

  @IsOptional()
  @IsBoolean()
  work_from_office?: boolean;

  @IsOptional()
  @IsBoolean()
  hybrid?: boolean;

  @IsOptional()
  @IsString()
  jobAge?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  max_duration?: number;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsBoolean()
  job_offer?: boolean;

  @IsOptional()
  @IsBoolean()
  fetchDetails?: boolean;

  @IsOptional()
  @IsBoolean()
  saveToFile?: boolean;

  @IsOptional()
  @IsBoolean()
  _isTestRequest?: boolean;

  @IsOptional()
  @IsBoolean()
  useThreads?: boolean;

  @IsOptional()
  @IsBoolean()
  _fastMode?: boolean;

  @IsOptional()
  @IsBoolean()
  _minimizeDetails?: boolean;

  @IsOptional()
  @IsBoolean()
  _skipDescriptions?: boolean;
}

export class InternshipDto {
  title: string;
  link: string;
  companyName: string;
  location: string;
  duration: string;
  stipend: string;
  earlyApplicant: boolean;
  skills: string[];
  jobDescription: string;
  aboutCompany: string;
  numberOfOpenings: string;
}

export class JobDto {
  title: string;
  link: string;
  companyName: string;
  location: string;
  experience: string;
  salary: string;
  workMode: string;
  earlyApplicant: boolean;
  skills: string[];
  jobDescription: string;
  aboutCompany: string;
  companyAddress: string;
  education: string;
  timestamp: string;
}

export class InternshalaResponseDto {
  success: boolean;
  message: string;
  data: InternshipDto[];
  page?: number;
  size?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export class NaukriResponseDto {
  success: boolean;
  message: string;
  data: JobDto[];
  page?: number;
  size?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export class SearchAllPlatformsResponseDto {
  success: boolean;
  message: string;
  internshala: {
    success: boolean;
    count: number;
    data: InternshipDto[];
  };
  naukri: {
    success: boolean;
    count: number;
    data: JobDto[];
  };
  totalCount: number;
}

export class CombinedJobDto {
  title: string;
  link: string;
  companyName: string;
  location: string;
  source: 'internshala' | 'naukri';
  [key: string]: any; // For other properties that might differ between platforms
}

export class CombinedResponseDto {
  success: boolean;
  message: string;
  data: CombinedJobDto[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
