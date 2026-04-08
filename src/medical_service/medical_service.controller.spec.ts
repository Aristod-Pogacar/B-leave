import { Test, TestingModule } from '@nestjs/testing';
import { MedicalServiceController } from './medical_service.controller';
import { MedicalServiceService } from './medical_service.service';

describe('MedicalServiceController', () => {
  let controller: MedicalServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalServiceController],
      providers: [MedicalServiceService],
    }).compile();

    controller = module.get<MedicalServiceController>(MedicalServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
