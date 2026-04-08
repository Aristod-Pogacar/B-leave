import { Test, TestingModule } from '@nestjs/testing';
import { MedicalServiceService } from './medical_service.service';

describe('MedicalServiceService', () => {
  let service: MedicalServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalServiceService],
    }).compile();

    service = module.get<MedicalServiceService>(MedicalServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
