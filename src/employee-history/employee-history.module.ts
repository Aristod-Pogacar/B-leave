import { Module } from '@nestjs/common';
import { EmployeeHistoryService } from './employee-history.service';
import { EmployeeHistoryController } from './employee-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeHistory } from './entities/employee-history.entity';
import { Employee } from '../employee/entities/employee.entity';
import { EmployeeService } from '../employee/employee.service';
import { Leave } from '../leave/entities/leave.entity';
import { ManagerAssignation } from '../manager_assignation/entities/manager_assignation.entity';
import { User } from '../user/entities/user.entity';
import { History } from '../history/entities/history.entity';
import { Permission2h } from '../permission2h/entities/permission2h.entity';
import { SmiaOstie } from '../smia_ostie/entities/smia_ostie.entity';
import { HistoryService } from '../history/history.service';
import { CryptoService } from '../crypto/crypto.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { Holiday } from '../holiday/entities/holiday.entity';
import { HolidayService } from '../holiday/holiday.service';
import { CarriedForward } from '../carried-forward/entities/carried-forward.entity';
import { CarriedForwardService } from '../carried-forward/carried-forward.service';

@Module({
  imports: [TypeOrmModule.forFeature([Leave, Employee, ManagerAssignation, User, History, Permission2h, SmiaOstie, EmployeeHistory, Holiday, CarriedForward])],
  controllers: [EmployeeHistoryController],
  providers: [EmployeeHistoryService, EmployeeService, HistoryService, CryptoService, JwtService, UserService, HolidayService, CarriedForwardService],
  exports: [
    EmployeeHistoryService,
    TypeOrmModule,
    EmployeeService,
    HistoryService,
    CryptoService,
    JwtService,
    UserService,
    HolidayService,
    CarriedForwardService
  ],
})
export class EmployeeHistoryModule { }
