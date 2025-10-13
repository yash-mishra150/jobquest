import {
  IsString,
  IsBoolean,
  IsArray,
  IsDateString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';

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

export enum RequiredExperience {
  INTERNSHIP = 'internship',
  ENTRY_LEVEL = 'entry level',
  ASSOCIATE = 'associate',
  MIDSENIOR_LEVEL = 'midsenior level',
  DIRECTOR = 'director',
  EXECUTIVE = 'executive',
  APPLICABLE = 'applicable',
}

export enum RequiredEducation {
  HIGH_SCHOOL_EQUIVALENT = 'high school equivalent',
  VOCATIONAL = 'vocational',
  CERTIFICATION = 'certification',
  BACHELORS_DEGREE = 'bachelors degree',
  MASTERS_DEGREE = 'masters degree',
  DOCTORATE = 'doctorate',
  UNSPECIFIED = 'unspecified',
}

export class JobVerificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  company_profile?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateIf((o) => typeof o.requirements === 'string')
  @IsString()
  @ValidateIf((o) => Array.isArray(o.requirements))
  @IsArray()
  @IsString({ each: true })
  requirements?: string | string[];

  @IsOptional()
  @IsString()
  required_experience?: RequiredExperience | string;

  @IsOptional()
  @IsString()
  required_education?: RequiredEducation | string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsString()
  workMode?: string;
}
