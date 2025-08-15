import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseInterceptors,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from '../dto/register-user.dto';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt/jwt.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtTokenBlackListInterceptor } from './jwt/blacklistingTokens/jwt-token-black-list.interceptor';
import { JwtTokenCheckInterceptor } from './jwt/TokenCheck/jwt-token-check.interceptor';
import { JwtBlacklistService } from './jwt/blacklistingTokens/jwt-blacklist.service';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { RoleGuardFactory } from './role.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authservice: AuthService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly tokenBlacklistService: JwtBlacklistService,
  ) {}

  @Post('login')
  async loginUser(
    @Body() userdto: LoginUserDto,
    @Res() res: FastifyReply,
  ): Promise<any> {
    const result = await this.authservice.loginUser(userdto);

    Logger.log(`Login successful for: ${result.email} (${result.userType})`);

    const payload = {
      email: result.email,
      phone: result.phone,
      name: result.name,
      Role:
        result.userType === 'Candidate'
          ? 'ROLE_CANDIDATE'
          : result.userType === 'Employer'
            ? 'ROLE_EMPLOYER'
            : '',
    };

    const accessToken = await this.jwtTokenService.signToken(payload, '1d');
    const refreshToken = await this.jwtTokenService.signToken(payload, '1w');

    // Cast res to any to access setCookie provided by fastify-cookie
    (res as any)
      .setCookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // seconds
        sameSite: 'lax',
      })
      .setCookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // seconds
        sameSite: 'lax',
      });

    return res.send({
      message: 'User logged in successfully',
      role:
        result.userType === 'Candidate'
          ? 'ROLE_CANDIDATE'
          : result.userType === 'Employer'
            ? 'ROLE_EMPLOYER'
            : '',
    });
  }

  @Post('register')
  async registerUser(@Body() userdto: RegisterUserDto): Promise<any> {
    const result = await this.authservice.registerUser(userdto);

    return {
      message: 'User registered successfully',
    };
  }

  @Post('logout')
  async logout(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token;

    // Try blacklisting access token
    if (accessToken) {
      try {
        await this.tokenBlacklistService.blacklistToken(accessToken);
      } catch (err) {
        return reply.code(400).send({ message: 'Token is BlackListed' });
      }
    }

    // Try blacklisting refresh token
    if (refreshToken) {
      try {
        await this.tokenBlacklistService.blacklistToken(refreshToken);
      } catch (err) {
        return reply.code(400).send({ message: 'Token is BlackListed' });
      }
    }

    // Clear both cookies
    reply.clearCookie('access_token');
    reply.clearCookie('refresh_token');

    return reply.code(200).send({ message: 'Logged out successfully' });
  }


  @Get('profile')
  async getProfile(@Req() req: FastifyRequest) {
    try {
      // Get the token from cookies
      const accessToken = req.cookies?.access_token;

      // Verify token and extract user data
      if (!accessToken) {
        return {
          success: false,
          message: 'No access token found',
        };
      }

      try {
        const decodedToken =
          await this.jwtTokenService.verifyToken(accessToken);

        // Check if token has email and name (required fields)
        if (!decodedToken.email || !decodedToken.name) {
          return {
            success: false,
            message: 'Invalid token: missing required user information',
          };
        }

        // Use the auth service to get the formatted profile
        const result = await this.authservice.getProfile(decodedToken);

        if (!result) {
          return {
            success: false,
            message: 'User profile not found',
          };
        }

        return {
          success: true,
          profile: result,
        };
      } catch (tokenError) {
        return {
          success: false,
          message: 'Invalid token',
        };
      }
    } catch (error) {
      Logger.error(`Error in profile endpoint: ${error.message}`);
      return {
        success: false,
        message: error.message || 'Failed to get profile',
      };
    }
  }

  @UseInterceptors(JwtTokenCheckInterceptor)
  @UseInterceptors(JwtTokenBlackListInterceptor)
  @Get('validate-session')
  async validateSession(@Req() req: FastifyRequest) {
    try {
      // Get tokens from cookies (interceptors handle the validation)
      const accessToken = req.cookies?.access_token;
      const refreshToken = req.cookies?.refresh_token;

      // If no tokens, user is not logged in
      if (!accessToken && !refreshToken) {
        return {
          isValid: false,
          message: 'No authentication tokens found',
        };
      }

      // Since interceptors handle token validation, we can decode the access token
      let decodedToken;
      if (accessToken) {
        try {
          decodedToken = await this.jwtTokenService.verifyToken(accessToken);
        } catch (error) {
          // Token might be expired, but interceptor handles refresh
          return {
            isValid: false,
            message: 'Session validation failed',
          };
        }
      }

      // Get user info from database using email and name
      if (decodedToken && decodedToken.email && decodedToken.name) {
        const userInfo = await this.authservice.getUserForSessionValidation(
          decodedToken.email,
          decodedToken.name,
        );

        if (userInfo) {
          return {
            isValid: true,
            role: userInfo.role,
            userType: userInfo.userType,
          };
        }
      }

      return {
        isValid: false,
        message: 'User not found',
      };
    } catch (error) {
      Logger.error(`Session validation error: ${error.message}`);
      return {
        isValid: false,
        message: 'Error validating session',
      };
    }
  }
}
