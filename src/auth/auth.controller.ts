import { Body, Controller, Get, HttpCode, Logger, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt/jwt.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtTokenBlackListInterceptor } from './jwt/blacklistingTokens/jwt-token-black-list.interceptor';
import { JwtTokenCheckInterceptor } from './jwt/TokenCheck/jwt-token-check.interceptor';
import { JwtBlacklistService } from './jwt/blacklistingTokens/jwt-blacklist.service';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authservice: AuthService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly tokenBlacklistService: JwtBlacklistService
    ) { }

    @Post('create')
    async registerUser(@Body() userdto: RegisterUserDto, @Res() res: FastifyReply): Promise<any> {
        const result = await this.authservice.registerUser(userdto);

        Logger.log(result);

        const payload = {
            sub: result.id,
            phone: userdto.phone,
            name: userdto.name,
            userType: userdto.userType,
        };

        const accessToken = await this.jwtTokenService.signToken(payload, '1d');
        const refreshToken = await this.jwtTokenService.signToken(payload, '1w');

        // Cast res to any to access setCookie provided by fastify-cookie
        (res as any).setCookie('access_token', accessToken, {
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

        return res.send({ message: 'User registered successfully', user: payload });
    }

    @UseInterceptors(JwtTokenCheckInterceptor)
    @UseInterceptors(JwtTokenBlackListInterceptor)
    @Get('profile')
    getProfile(@Req() req) {
        // req.user will have the validated JWT payload (from validate() in JwtStrategy)
        return {
            message: 'Protected profile info',
            user: req.user,
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
}
