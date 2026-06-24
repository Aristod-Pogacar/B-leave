import { Module } from '@nestjs/common';
import { EmployeeHistoryService } from './employee-history.service';
import { EmployeeHistoryController } from './employee-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeHistory } from './entities/employee-history.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { EmployeeService } from 'src/employee/employee.service';
import { Leave } from 'src/leave/entities/leave.entity';
import { ManagerAssignation } from 'src/manager_assignation/entities/manager_assignation.entity';
import { User } from 'src/user/entities/user.entity';
import { History } from 'src/history/entities/history.entity';
import { Permission2h } from 'src/permission2h/entities/permission2h.entity';
import { SmiaOstie } from 'src/smia_ostie/entities/smia_ostie.entity';
import { HistoryService } from 'src/history/history.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { Holiday } from 'src/holiday/entities/holiday.entity';
import { HolidayService } from 'src/holiday/holiday.service';

@Module({
  imports: [TypeOrmModule.forFeature([Leave, Employee, ManagerAssignation, User, History, Permission2h, SmiaOstie, EmployeeHistory, Holiday])],
  controllers: [EmployeeHistoryController],
  providers: [EmployeeHistoryService, EmployeeService, HistoryService, CryptoService, JwtService, UserService, HolidayService],
  exports: [
    EmployeeHistoryService,
    TypeOrmModule,
    EmployeeService,
    HistoryService,
    CryptoService,
    JwtService,
    UserService,
    HolidayService
  ],
})
export class EmployeeHistoryModule { }
