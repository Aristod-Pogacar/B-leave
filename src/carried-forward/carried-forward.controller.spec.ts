import { Test, TestingModule } from '@nestjs/testing';
import { CarriedForwardController } from './carried-forward.controller';
import { CarriedForwardService } from './carried-forward.service';

describe('CarriedForwardController', () => {
  let controller: CarriedForwardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarriedForwardController],
      providers: [CarriedForwardService],
    }).compile();

    controller = module.get<CarriedForwardController>(CarriedForwardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
