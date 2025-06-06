import { JwtTokenCheckInterceptor } from './jwt-token-check.interceptor';
import { JwtTokenService } from '../jwt.service';

describe('JwtTokenCheckInterceptor', () => {
  it('should be defined', () => {
    const mockJwtTokenService = {} as JwtTokenService;
    const interceptor = new JwtTokenCheckInterceptor(mockJwtTokenService);
    expect(interceptor).toBeDefined();
  });
});
