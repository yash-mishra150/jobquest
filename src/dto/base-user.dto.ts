import { IsEmail, IsEnum, IsNotEmpty, Matches } from 'class-validator';

// Enum for User Type
export enum UserType {
  Candidate = 'Candidate',
  Employer = 'Employer',
}

export class BaseUserDto {
  // Email validation
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // Password validation (complexity check)
  @IsNotEmpty()
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
    },
  )
  password: string;

  // User type (Candidate or Employer)
  @IsNotEmpty()
  @IsEnum(UserType)
  userType: UserType;
}
