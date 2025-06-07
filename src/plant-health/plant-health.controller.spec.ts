import { Test, TestingModule } from '@nestjs/testing';
import { PlantHealthController } from './plant-health.controller';
import { PlantHealthService } from './plant-health.service';

describe('PlantHealthController', () => {
  let controller: PlantHealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlantHealthController],
      providers: [PlantHealthService],
    }).compile();

    controller = module.get<PlantHealthController>(PlantHealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
