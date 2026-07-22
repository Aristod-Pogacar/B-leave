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
import { Permission2h } from 'src/permission2h/entities/permission2h.entity';
import { Permission2hService } from 'src/permission2h/permission2h.service';
import { SmiaOstieService } from 'src/smia_ostie/smia_ostie.service';
import { SmiaOstie } from 'src/smia_ostie/entities/smia_ostie.entity';
import { EmployeeHistory } from 'src/employee-history/entities/employee-history.entity';
import { Holiday } from 'src/holiday/entities/holiday.entity';
import { HolidayService } from 'src/holiday/holiday.service';
import { CarriedForward } from 'src/carried-forward/entities/carried-forward.entity';
import { CarriedForwardService } from 'src/carried-forward/carried-forward.service';

@Module({
  imports: [TypeOrmModule.forFeature([Leave, Employee, ManagerAssignation, User, History, Permission2h, SmiaOstie, EmployeeHistory, Holiday, CarriedForward])],
  controllers: [EmployeeController],
  providers: [EmployeeService, LeaveService, CryptoService, UserService, JwtService, HistoryService, Permission2hService, SmiaOstieService, HolidayService, CarriedForwardService],
  exports: [EmployeeService, TypeOrmModule, CryptoService, UserService, JwtService, HistoryService, Permission2hService, SmiaOstieService, HolidayService, CarriedForwardService],
})
export class EmployeeModule { }
