import { Test, TestingModule } from '@nestjs/testing';
import { ManagerAssignationController } from './manager_assignation.controller';
import { ManagerAssignationService } from './manager_assignation.service';

describe('ManagerAssignationController', () => {
  let controller: ManagerAssignationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagerAssignationController],
      providers: [ManagerAssignationService],
    }).compile();

    controller = module.get<ManagerAssignationController>(ManagerAssignationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
