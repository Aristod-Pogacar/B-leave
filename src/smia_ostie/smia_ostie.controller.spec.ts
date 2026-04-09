import { Test, TestingModule } from '@nestjs/testing';
import { SmiaOstieController } from './smia_ostie.controller';
import { SmiaOstieService } from './smia_ostie.service';

describe('SmiaOstieController', () => {
  let controller: SmiaOstieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmiaOstieController],
      providers: [SmiaOstieService],
    }).compile();

    controller = module.get<SmiaOstieController>(SmiaOstieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
