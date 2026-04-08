import { Test, TestingModule } from '@nestjs/testing';
import { Permission2hController } from './permission2h.controller';
import { Permission2hService } from './permission2h.service';

describe('Permission2hController', () => {
  let controller: Permission2hController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Permission2hController],
      providers: [Permission2hService],
    }).compile();

    controller = module.get<Permission2hController>(Permission2hController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
