import { Test, TestingModule } from '@nestjs/testing';
import { LandDivisionController } from './land-division.controller';

describe('LandDivisionController', () => {
  let controller: LandDivisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandDivisionController],
    }).compile();

    controller = module.get<LandDivisionController>(LandDivisionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
