import { Test, TestingModule } from '@nestjs/testing';
import { PlantHealthService } from './plant-health.service';

describe('PlantHealthService', () => {
  let service: PlantHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlantHealthService],
    }).compile();

    service = module.get<PlantHealthService>(PlantHealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
