import { IsString, IsBoolean, IsArray, IsDateString, IsOptional } from 'class-validator';

export class OpportunityDto {
  @IsString()
  title: string;

  @IsString()
  link: string;

  @IsString()
  companyName: string;

  @IsString()
  location: string;

  @IsString()
  duration: string;

  @IsString()
  stipend: string;

  @IsBoolean()
  earlyApplicant: boolean;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsString()
  jobDescription: string;

  @IsString()
  aboutCompany: string;

  @IsString()
  numberOfOpenings: string;

  @IsDateString()
  timestamp: string;
}
