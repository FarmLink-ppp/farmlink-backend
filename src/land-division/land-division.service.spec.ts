import { Test, TestingModule } from '@nestjs/testing';
import { LandDivisionService } from './land-division.service';

describe('LandDivisionService', () => {
  let service: LandDivisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LandDivisionService],
    }).compile();

    service = module.get<LandDivisionService>(LandDivisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
