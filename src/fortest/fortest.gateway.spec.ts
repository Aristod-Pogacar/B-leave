import { Test, TestingModule } from '@nestjs/testing';
import { FortestGateway } from './fortest.gateway';

describe('FortestGateway', () => {
  let gateway: FortestGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FortestGateway],
    }).compile();

    gateway = module.get<FortestGateway>(FortestGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
