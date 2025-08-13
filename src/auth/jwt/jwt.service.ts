// src/auth/jwt.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Define an interface for the token payload
export interface TokenPayload {
  email: string;
  name: string;
  phone: string;
  Role: string;
  [key: string]: any;
}

@Injectable()
export class JwtTokenService {
  private readonly privateKey: string;
  private readonly publicKey: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // const pk = process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n');
    // Logger.log(pk)
    // Correct keys with proper fallback error handling
    this.privateKey = process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
    this.publicKey = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n') || '';
    // this.privateKey = fs.readFileSync(path.join(process.cwd(), 'src/keys/private.pem'), 'utf8');
    // this.publicKey = fs.readFileSync(path.join(process.cwd(), 'src/keys/public.pem'), 'utf8');
  }

  async signToken(payload: any, expiresIn?: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      algorithm: 'RS256',
      privateKey: this.privateKey,
      expiresIn,
    });
  }

  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      algorithms: ['RS256'],
      publicKey: this.publicKey,
    });
  }
}
