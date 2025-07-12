import { Test, TestingModule } from '@nestjs/testing';
import { NaukriService } from './naukri.service';

describe('NaukriService', () => {
  let service: NaukriService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NaukriService],
    }).compile();

    service = module.get<NaukriService>(NaukriService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
