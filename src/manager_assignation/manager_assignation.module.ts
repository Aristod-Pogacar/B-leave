import { Module } from '@nestjs/common';
import { ManagerAssignationService } from './manager_assignation.service';
import { ManagerAssignationController } from './manager_assignation.controller';

@Module({
  controllers: [ManagerAssignationController],
  providers: [ManagerAssignationService],
})
export class ManagerAssignationModule {}
