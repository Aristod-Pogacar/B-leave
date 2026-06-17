import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeHistoryService } from './employee-history.service';

describe('EmployeeHistoryService', () => {
  let service: EmployeeHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeHistoryService],
    }).compile();

    service = module.get<EmployeeHistoryService>(EmployeeHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
