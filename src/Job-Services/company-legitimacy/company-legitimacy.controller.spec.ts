import { Test, TestingModule } from '@nestjs/testing';
import { CompanyLegitimacyController } from './company-legitimacy.controller';

describe('CompanyLegitimacyController', () => {
  let controller: CompanyLegitimacyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyLegitimacyController],
    }).compile();

    controller = module.get<CompanyLegitimacyController>(
      CompanyLegitimacyController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
