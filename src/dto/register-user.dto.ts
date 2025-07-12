import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches, IsArray, ArrayNotEmpty, IsEnum } from 'class-validator';
import { BaseUserDto } from './base-user.dto';

// Enum for User Type
enum UserType {
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

export class RegisterUserDto extends BaseUserDto {
    // Name field with regex to avoid numbers
    @IsNotEmpty()
    @Matches(/^[^0-9]*$/, { message: 'Name must not contain numbers' })
    name: string;

    // Phone validation (only for registration, optional for login)
    @IsNotEmpty()
    @IsString()
    @Length(10, 10, { message: 'Phone number must be exactly 10 digits' })
    @Matches(/^\d+$/, { message: 'Phone number must contain only digits' })
    phone: string;

    // User type (Student, Working, Fresher, etc.)
    @IsNotEmpty()
    @IsEnum(UserType)
    userType: UserType;

    // Preferred job type (Internship, Full-Time, or Both)
    @IsNotEmpty()
    @IsEnum(JobType)
    preferredJobType: JobType;

    // Preferred work mode (Remote, Hybrid, or On-Site)
    @IsNotEmpty()
    @IsEnum(WorkMode)
    preferredWorkMode: WorkMode;

    // Location preferences for job matching (optional)
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty({ message: 'At least one location is required' })
    locationPreferences: string[];

    // Skills list (array of skills)
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty({ message: 'At least one skill is required' })
    skills: string[];

    // Expected salary range (optional)
    @IsOptional()
    @Matches(/^\d+-\d+\s?LPA$/, { message: 'Salary should be in the format "X-Y LPA"' })
    expectedSalaryRange: string;

    // Resume upload (optional, for registration)
    @IsOptional()
    @IsString()
    resume: string;
}
