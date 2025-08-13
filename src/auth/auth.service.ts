import {
  Inject,
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from 'src/dto/login-user.dto';
// Use bcryptjs instead of bcrypt for better TypeScript compatibility
import * as bcrypt from 'bcryptjs';
import { UserType } from '../dto/base-user.dto';
import xss from 'xss';

@Injectable()
export class AuthService {
  constructor(@Inject('MONGO_CLIENT') private readonly client: MongoClient) {}

  async loginUser(userDto: LoginUserDto): Promise<any> {
    const db = this.client.db();
    const usersCollection = db.collection('users');

    // Debug: log the query
    Logger.log(`Login attempt: email=${userDto.email}, userType=${userDto.userType}`);

    // Find by email only
    const existingUser = await usersCollection.findOne({
      email: userDto.email,
    });

    // Debug: log the found user
    Logger.log(`Found user: ${JSON.stringify(existingUser)}`);

    if (!existingUser) {
      throw new UnauthorizedException('User not registered with this email');
    }

    // Check userType match
    if (existingUser.userType !== userDto.userType) {
      throw new UnauthorizedException('User type does not match for this email');
    }

    const isPasswordValid = await bcrypt.compare(
      userDto.password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Log successful login
    Logger.log(
      `User logged in: ${existingUser.email} (${existingUser.userType})`,
    );

    return existingUser;
  }

  async registerUser(userDto: RegisterUserDto): Promise<{ id: string }> {
    // Sanitize all string fields in userDto
    const sanitizedUserDto = { ...userDto };
    const sanitizedRecord = sanitizedUserDto as Record<string, unknown>;
    Object.keys(sanitizedRecord).forEach(key => {
      const value = sanitizedRecord[key];
      if (typeof value === 'string') {
        sanitizedRecord[key] = xss(value);
      }
    });

    const db = this.client.db();
    const usersCollection = db.collection('users');

    // Check if user with same email and userType exists
    const existingUser = await usersCollection.findOne({
      email: sanitizedUserDto.email,
      userType: sanitizedUserDto.userType,
    });

    if (existingUser) {
      throw new ConflictException(
        `User already exists with this email as ${sanitizedUserDto.userType}`,
      );
    }

    // Check if phone number is already in use for this user type
    const existingPhone = await usersCollection.findOne({
      phone: sanitizedUserDto.phone,
      userType: sanitizedUserDto.userType,
    });

    if (existingPhone) {
      throw new ConflictException(
        `Phone number already in use for another ${sanitizedUserDto.userType}`,
      );
    }

    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(sanitizedUserDto.password, saltRounds);

    // Build user object with explicit typing
    interface BaseUser {
      email: string;
      password: string;
      name: string;
      phone: string;
      userType: UserType;
      createdAt: Date;
      updatedAt: Date;
      [key: string]: unknown;
    }
    let userObject: BaseUser = {
      email: sanitizedRecord['email'] as string,
      password: hashedPassword,
      name: sanitizedRecord['name'] as string,
      phone: sanitizedRecord['phone'] as string,
      userType: sanitizedRecord['userType'] as UserType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (sanitizedRecord['userType'] === UserType.Candidate) {
      userObject = {
        ...userObject,
        candidateType: sanitizedRecord['candidateType'],
        preferredJobType: sanitizedRecord['preferredJobType'],
        preferredWorkMode: sanitizedRecord['preferredWorkMode'],
        locationPreferences: sanitizedRecord['locationPreferences'],
        skills: sanitizedRecord['skills'],
        expectedSalaryRange: sanitizedRecord['expectedSalaryRange'],
        resume: sanitizedRecord['resume'],
      };
    } else if (sanitizedRecord['userType'] === UserType.Employer) {
      userObject = {
        ...userObject,
        companyName: sanitizedRecord['companyName'],
        companyDescription: sanitizedRecord['companyDescription'],
        companySize: sanitizedRecord['companySize'],
        companyWebsite: sanitizedRecord['companyWebsite'],
        industry: sanitizedRecord['industry'],
        companyLocation: sanitizedRecord['companyLocation'],
      };
    }

    // Insert user into database
    const result = await usersCollection.insertOne(userObject as import('mongodb').OptionalId<import('mongodb').Document>);

    // Log successful registration
    Logger.log(`New user registered: ${sanitizedUserDto.email} (${sanitizedUserDto.userType})`);

    return { id: result.insertedId.toString() };
  }
}
