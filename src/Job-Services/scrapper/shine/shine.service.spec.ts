import { Test, TestingModule } from '@nestjs/testing';
import { ShineService } from './shine.service';

describe('ShineService', () => {
  let service: ShineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShineService],
    }).compile();

    service = module.get<ShineService>(ShineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
