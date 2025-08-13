import {
  Inject,
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MongoClient, ObjectId } from 'mongodb';
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
    Logger.log(
      `Login attempt: email=${userDto.email}, userType=${userDto.userType}`,
    );

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
      throw new UnauthorizedException(
        'User type does not match for this email',
      );
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
    const hashedPassword = await bcrypt.hash(
      sanitizedUserDto.password,
      saltRounds,
    );

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
    const result = await usersCollection.insertOne(
      userObject as import('mongodb').OptionalId<import('mongodb').Document>,
    );

    // Log successful registration
    Logger.log(
      `New user registered: ${sanitizedUserDto.email} (${sanitizedUserDto.userType})`,
    );

    return { id: result.insertedId.toString() };
  }

  /**
   * Get user profile from token payload
   * @param payload Token payload containing user information
   * @returns Formatted user profile
   */
  async getProfile(payload: any) {
    try {
      const db = this.client.db();
      const usersCollection = db.collection('users');

      // Check required fields in payload
      if (!payload.email || !payload.name) {
        throw new UnauthorizedException(
          'Invalid token: missing required user information',
        );
      }

      // Find user profile by email, name and phone
      const userProfile = await usersCollection.findOne({
        email: payload.email,
        name: payload.name,
        phone: payload.phone,
      });

      if (!userProfile) {
        throw new UnauthorizedException('User profile not found');
      }

      // Format the profile based on user type - remove sensitive and unnecessary fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, _id, createdAt, updatedAt, ...safeUserData } = userProfile;
      
      // Use the helper method to filter fields based on user type
      // This ensures only appropriate fields for the user type are included
      const formattedProfile = this.filterProfileByUserType(userProfile, userProfile.userType);
      
      // Add role from token to the profile
      formattedProfile.role = payload.Role;

      return formattedProfile;
    } catch (error) {
      Logger.error(`Error getting profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a formatted user profile with completion percentage
   * This method ensures only appropriate fields for the user type are included
   * @param userId The user ID
   * @param userType Optional user type for validation
   */
  async getFormattedUserProfile(userId: string, userType?: UserType) {
    try {
      Logger.log(
        `Getting formatted profile for user ID: ${userId}, type: ${userType}`,
      );

      // Get the raw profile data first
      const rawProfile = await this.getUserProfileById(userId, userType);

      if (!rawProfile) {
        throw new NotFoundException('User profile not found');
      }

      // Format the profile data - remove sensitive and metadata fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, _id, createdAt, updatedAt, ...safeUserData } = rawProfile;

      // Use our helper method to filter profile fields based on user type
      const formattedProfile = this.filterProfileByUserType(rawProfile, rawProfile.userType);
      
      // Add ID as a string to make it easier to work with in the frontend
      formattedProfile.id = rawProfile._id.toString();

      return formattedProfile;
    } catch (error) {
      Logger.error(`Error formatting user profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a user profile by ID with optional type validation
   * @param userId The user ID
   * @param userType Optional user type for validation
   */
  async getUserProfileById(userId: string, userType?: UserType) {
    try {
      const db = this.client.db();
      const usersCollection = db.collection('users');

      // Construct query
      const query: Record<string, any> = {
        _id: new ObjectId(userId),
      };

      // If userType is provided, add it to the query for additional validation
      if (userType) {
        query.userType = userType;
      }

      // Find user profile
      const userProfile = await usersCollection.findOne(query);

      if (!userProfile) {
        return null;
      }

      return userProfile;
    } catch (error) {
      Logger.error(`Error getting user profile by ID: ${error.message}`);
      return null;
    }
  }

  /**
   * Filters the user profile fields based on user type
   * @param profile The raw user profile from the database
   * @param userType The type of user (Candidate or Employer)
   * @returns A filtered profile with only fields relevant to the user type
   */
  private filterProfileByUserType(profile: Record<string, any>, userType: UserType): Record<string, any> {
    // Create a clean base profile with only common fields
    const baseProfile: Record<string, any> = {
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
      userType: profile.userType,
    };
    
    // Initialize the formatted profile
    const formattedProfile: Record<string, any> = { ...baseProfile };
    
    if (userType === UserType.Candidate) {
      // Define candidate-specific fields
      const candidateFields = [
        'candidateType',
        'preferredJobType',
        'preferredWorkMode',
        'locationPreferences',
        'skills',
        'expectedSalaryRange',
        'resume',
      ];
      
      // Add only candidate-specific fields that exist
      candidateFields.forEach(field => {
        if (profile[field] !== undefined && profile[field] !== null) {
          formattedProfile[field] = profile[field];
        }
      });
      
      // Calculate profile completion
      const requiredFields = candidateFields.filter(f => f !== 'resume'); // Resume might be optional
      const filledFields = requiredFields.filter(
        field => profile[field] !== undefined && profile[field] !== null
      );
      
      formattedProfile.profileCompletionPercentage = Math.round(
        (filledFields.length / requiredFields.length) * 100
      );
    } 
    else if (userType === UserType.Employer) {
      // Define employer-specific fields
      const employerFields = [
        'companyName',
        'companyDescription',
        'companySize',
        'companyWebsite',
        'industry',
        'companyLocation',
      ];
      
      // Add only employer-specific fields that exist
      employerFields.forEach(field => {
        if (profile[field] !== undefined && profile[field] !== null) {
          formattedProfile[field] = profile[field];
        }
      });
      
      // Calculate profile completion
      const filledFields = employerFields.filter(
        field => profile[field] !== undefined && profile[field] !== null
      );
      
      formattedProfile.profileCompletionPercentage = Math.round(
        (filledFields.length / employerFields.length) * 100
      );
    }
    
    return formattedProfile;
  }
}
