import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Leave } from 'src/leave/entities/leave.entity';
import { LeaveService } from "src/leave/leave.service";
import { CryptoService } from 'src/crypto/crypto.service';
import { ManagerAssignation } from 'src/manager_assignation/entities/manager_assignation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Leave, Employee, ManagerAssignation])],
  controllers: [EmployeeController],
  providers: [EmployeeService, LeaveService, CryptoService],
  exports: [EmployeeService, TypeOrmModule, CryptoService],
})
export class EmployeeModule { }
