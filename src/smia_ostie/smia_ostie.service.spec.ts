import { Test, TestingModule } from '@nestjs/testing';
import { SmiaOstieService } from './smia_ostie.service';

describe('SmiaOstieService', () => {
  let service: SmiaOstieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmiaOstieService],
    }).compile();

    service = module.get<SmiaOstieService>(SmiaOstieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
