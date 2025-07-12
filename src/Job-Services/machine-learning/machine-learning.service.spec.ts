import { Test, TestingModule } from '@nestjs/testing';
import { MachineLearningService } from './machine-learning.service';

describe('MachineLearningService', () => {
  let service: MachineLearningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MachineLearningService],
    }).compile();

    service = module.get<MachineLearningService>(MachineLearningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
