import { Test, TestingModule } from '@nestjs/testing';
import { FingerprintGateway } from './fingerprint.gateway';

describe('FingerprintGateway', () => {
  let gateway: FingerprintGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FingerprintGateway],
    }).compile();

    gateway = module.get<FingerprintGateway>(FingerprintGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
