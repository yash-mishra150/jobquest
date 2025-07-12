import { IsEmail, IsNotEmpty, Matches } from 'class-validator';


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
}
