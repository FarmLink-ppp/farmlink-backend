import { Test, TestingModule } from '@nestjs/testing';
import { DailyTipService } from './daily-tip.service';

describe('DailyTipService', () => {
  let service: DailyTipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyTipService],
    }).compile();

    service = module.get<DailyTipService>(DailyTipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
