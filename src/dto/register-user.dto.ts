import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  ValidateIf,
  IsUrl,
  MinLength,
} from 'class-validator';
import { BaseUserDto, UserType } from './base-user.dto';

// Enum for Candidate Type
enum CandidateType {
  Student = 'Student',
  Working = 'Working',
  Fresher = 'Fresher',
  Other = 'Other',
}

// Enum for Preferred Job Type
enum JobType {
  Internship = 'Internship',
  FullTime = 'Full-Time',
  Both = 'Both',
}

// Enum for Preferred Work Mode
enum WorkMode {
  Remote = 'Remote',
  Hybrid = 'Hybrid',
  OnSite = 'On-site',
}

// Enum for Company Size
enum CompanySize {
  Small = 'Small (<50 employees)',
  Medium = 'Medium (50-250 employees)',
  Large = 'Large (250+ employees)',
}

export class RegisterUserDto extends BaseUserDto {
  // Name field with regex to avoid numbers (common for both)
  @IsNotEmpty()
  @Matches(/^[^0-9]*$/, { message: 'Name must not contain numbers' })
  name: string;

  // Phone validation (common for both)
  @IsNotEmpty()
  @IsString()
  @Length(10, 10, { message: 'Phone number must be exactly 10 digits' })
  @Matches(/^\d+$/, { message: 'Phone number must contain only digits' })
  phone: string;

  // CANDIDATE SPECIFIC FIELDS
  @ValidateIf(o => o.userType === UserType.Candidate)
  @IsNotEmpty({ message: 'Candidate type is required for Candidate users' })
  @IsEnum(CandidateType)
  candidateType?: CandidateType;

  @ValidateIf(o => o.userType === UserType.Candidate)
  @IsNotEmpty({ message: 'Preferred job type is required for Candidate users' })
  @IsEnum(JobType)
  preferredJobType?: JobType;

  @ValidateIf(o => o.userType === UserType.Candidate)
  @IsNotEmpty({
    message: 'Preferred work mode is required for Candidate users',
  })
  @IsEnum(WorkMode)
  preferredWorkMode?: WorkMode;

  @ValidateIf(o => o.userType === UserType.Candidate)
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one location is required' })
  locationPreferences?: string[];

  @ValidateIf(o => o.userType === UserType.Candidate)
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one skill is required' })
  skills?: string[];

  @ValidateIf(o => o.userType === UserType.Candidate)
  @IsOptional()
  @Matches(/^\d+-\d+\s?LPA$/, {
    message: 'Salary should be in the format "X-Y LPA"',
  })
  expectedSalaryRange?: string;

  @ValidateIf(o => o.userType === UserType.Candidate)
  @IsOptional()
  @IsString()
  resume?: string;

  // EMPLOYER SPECIFIC FIELDS
  @ValidateIf(o => o.userType === UserType.Employer)
  @IsNotEmpty({ message: 'Company name is required for Employer users' })
  @MinLength(2, { message: 'Company name must be at least 2 characters' })
  companyName?: string;

  @ValidateIf(o => o.userType === UserType.Employer)
  @IsNotEmpty({ message: 'Company description is required for Employer users' })
  @MinLength(20, {
    message: 'Company description must be at least 20 characters',
  })
  companyDescription?: string;

  @ValidateIf(o => o.userType === UserType.Employer)
  @IsNotEmpty({ message: 'Company size is required for Employer users' })
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @ValidateIf(o => o.userType === UserType.Employer)
  @IsOptional()
  @IsUrl()
  companyWebsite?: string;

  @ValidateIf(o => o.userType === UserType.Employer)
  @IsNotEmpty({ message: 'Industry is required for Employer users' })
  industry?: string;

  @ValidateIf(o => o.userType === UserType.Employer)
  @IsNotEmpty({ message: 'Company location is required for Employer users' })
  companyLocation?: string;
}
