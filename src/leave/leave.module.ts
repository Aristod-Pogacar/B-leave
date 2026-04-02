import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { Leave } from './entities/leave.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import { EmployeeService } from 'src/employee/employee.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { ManagerAssignation } from 'src/manager_assignation/entities/manager_assignation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Leave, Employee, ManagerAssignation])],
  controllers: [LeaveController],
  providers: [LeaveService, EmployeeService, CryptoService],
  exports: [LeaveService, TypeOrmModule, CryptoService],
})
export class LeaveModule { }
