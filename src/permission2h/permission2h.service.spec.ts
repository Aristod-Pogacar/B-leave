import { Test, TestingModule } from '@nestjs/testing';
import { Permission2hService } from './permission2h.service';

describe('Permission2hService', () => {
  let service: Permission2hService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Permission2hService],
    }).compile();

    service = module.get<Permission2hService>(Permission2hService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
