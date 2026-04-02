import { Module } from '@nestjs/common';
import { ManagerAssignationService } from './manager_assignation.service';
import { ManagerAssignationController } from './manager_assignation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerAssignation } from './entities/manager_assignation.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ManagerAssignation, Employee, User])],
  controllers: [ManagerAssignationController],
  providers: [ManagerAssignationService],
})
export class ManagerAssignationModule { }
