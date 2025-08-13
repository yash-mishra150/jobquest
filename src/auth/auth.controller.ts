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

  /**
   * Validates the user's session and returns basic profile info
   * Perfect for checking if a user is logged in when reloading the site
   * Returns user data without sensitive fields like _id, createdAt, updatedAt
   */
  @Get('validate-session')
  async validateSession(@Req() req: FastifyRequest) {
    try {
      // Get tokens from cookies
      const accessToken = req.cookies?.access_token;
      const refreshToken = req.cookies?.refresh_token;

      // If no tokens, user is not logged in
      if (!accessToken && !refreshToken) {
        return {
          isValid: false,
          message: 'No authentication tokens found',
        };
      }

      // Check access token first
      let decodedToken;
      try {
        if (accessToken) {
          decodedToken = await this.jwtTokenService.verifyToken(accessToken);
        } else if (refreshToken) {
          // If no access token but has refresh token
          decodedToken = await this.jwtTokenService.verifyToken(refreshToken);

          // Generate new access token from refresh token
          const { iat, exp, ...payload } = decodedToken;
          const newAccessToken = await this.jwtTokenService.signToken(
            payload,
            '1d',
          );

          // Return the new access token with the response
          return {
            isValid: true,
            user: {
              email: decodedToken.email,
              name: decodedToken.name,
              phone: decodedToken.phone,
              role: decodedToken.Role,
            },
            newAccessToken,
          };
        }
      } catch (error) {
        return {
          isValid: false,
          message: 'Invalid or expired tokens',
        };
      }

      // If we have a valid token, return basic user info
      if (decodedToken) {
        return {
          isValid: true,
          user: {
            email: decodedToken.email,
            name: decodedToken.name,
            phone: decodedToken.phone,
            role: decodedToken.Role,
          },
        };
      }

      return {
        isValid: false,
        message: 'Invalid session',
      };
    } catch (error) {
      Logger.error(`Session validation error: ${error.message}`);
      return {
        isValid: false,
        message: 'Error validating session',
      };
    }
  }

  /**
   * Fix for validateSession to handle undefined tokens
   */
  @Get('validate-session-fixed')
  async validateSessionFixed(@Req() req: FastifyRequest) {
    try {
      // Get tokens from cookies
      const accessToken = req.cookies?.access_token;
      const refreshToken = req.cookies?.refresh_token;

      // If no tokens, user is not logged in
      if (!accessToken && !refreshToken) {
        return {
          isValid: false,
          message: 'No authentication tokens found',
        };
      }

      // Check access token first
      let decodedToken: any;
      try {
        if (accessToken) {
          decodedToken = await this.jwtTokenService.verifyToken(accessToken);
        } else if (refreshToken) {
          // If no access token but has refresh token
          decodedToken = await this.jwtTokenService.verifyToken(refreshToken);

          // Generate new access token from refresh token
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { iat, exp, ...payload } = decodedToken;
          const newAccessToken = await this.jwtTokenService.signToken(
            payload,
            '1d',
          );

          // Return the new access token with the response
          return {
            isValid: true,
            user: {
              email: decodedToken.email,
              name: decodedToken.name,
              phone: decodedToken.phone,
              role: decodedToken.Role,
            },
            newAccessToken,
          };
        }
      } catch (err) {
        // Token validation failed
        return {
          isValid: false,
          message: 'Invalid or expired tokens',
        };
      }

      // If we have a valid token, return basic user info
      if (decodedToken) {
        return {
          isValid: true,
          user: {
            email: decodedToken.email,
            name: decodedToken.name,
            phone: decodedToken.phone,
            role: decodedToken.Role,
          },
        };
      }

      return {
        isValid: false,
        message: 'Invalid session',
      };
    } catch (err) {
      Logger.error(
        `Session validation error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      return {
        isValid: false,
        message: 'Error validating session',
      };
    }
  }
}
