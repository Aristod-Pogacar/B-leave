import { Test, TestingModule } from '@nestjs/testing';
import { CarriedForwardService } from './carried-forward.service';

describe('CarriedForwardService', () => {
  let service: CarriedForwardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarriedForwardService],
    }).compile();

    service = module.get<CarriedForwardService>(CarriedForwardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
