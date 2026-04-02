import { Test, TestingModule } from '@nestjs/testing';
import { PuppeteerManagerService } from './puppeteer-manager.service';

describe('PuppeteerManagerService', () => {
  let service: PuppeteerManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PuppeteerManagerService],
    }).compile();

    service = module.get<PuppeteerManagerService>(PuppeteerManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
