import { Test, TestingModule } from '@nestjs/testing';
import { JwtBlacklistService } from './jwt-blacklist.service';

describe('JwtBlacklistService', () => {
  let service: JwtBlacklistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtBlacklistService],
    }).compile();

    service = module.get<JwtBlacklistService>(JwtBlacklistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
