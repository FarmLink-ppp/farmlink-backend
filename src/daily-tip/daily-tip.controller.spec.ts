import { Test, TestingModule } from '@nestjs/testing';
import { DailyTipController } from './daily-tip.controller';
import { DailyTipService } from './daily-tip.service';

describe('DailyTipController', () => {
  let controller: DailyTipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyTipController],
      providers: [DailyTipService],
    }).compile();

    controller = module.get<DailyTipController>(DailyTipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
