import { Test, TestingModule } from '@nestjs/testing';
import { ManagerAssignationService } from './manager_assignation.service';

describe('ManagerAssignationService', () => {
  let service: ManagerAssignationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManagerAssignationService],
    }).compile();

    service = module.get<ManagerAssignationService>(ManagerAssignationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
