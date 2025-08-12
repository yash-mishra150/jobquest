import { Test, TestingModule } from '@nestjs/testing';
import { MachineLearningController } from './machine-learning.controller';

describe('MachineLearningController', () => {
  let controller: MachineLearningController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MachineLearningController],
    }).compile();

    controller = module.get<MachineLearningController>(
      MachineLearningController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
