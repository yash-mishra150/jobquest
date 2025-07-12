import { Test, TestingModule } from '@nestjs/testing';
import { TimesjobService } from './timesjob.service';

describe('TimesjobService', () => {
  let service: TimesjobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimesjobService],
    }).compile();

    service = module.get<TimesjobService>(TimesjobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
