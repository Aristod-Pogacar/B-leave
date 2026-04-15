import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Leave } from 'src/leave/entities/leave.entity';
import { LeaveService } from "src/leave/leave.service";
import { CryptoService } from 'src/crypto/crypto.service';
import { ManagerAssignation } from 'src/manager_assignation/entities/manager_assignation.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { HistoryService } from 'src/history/history.service';
import { History } from 'src/history/entities/history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Leave, Employee, ManagerAssignation, User, History])],
  controllers: [EmployeeController],
  providers: [EmployeeService, LeaveService, CryptoService, UserService, JwtService, HistoryService],
  exports: [EmployeeService, TypeOrmModule, CryptoService, UserService, JwtService, HistoryService],
})
export class EmployeeModule { }
