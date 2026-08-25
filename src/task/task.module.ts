import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { PuppeteerManagerService } from '../puppeteer-manager/puppeteer-manager.service';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { EmployeeService } from '../employee/employee.service';
import { LeaveService } from '../leave/leave.service';
import { CryptoService } from '../crypto/crypto.service';
import { TaskScheduler } from './task.scheduler';
import { Employee } from '../employee/entities/employee.entity';
import { Leave } from '../leave/entities/leave.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { HistoryService } from '../history/history.service';
import { History } from '../history/entities/history.entity';
import { Permission2hService } from '../permission2h/permission2h.service';
import { Permission2h } from '../permission2h/entities/permission2h.entity';
import { SmiaOstie } from '../smia_ostie/entities/smia_ostie.entity';
import { SmiaOstieService } from '../smia_ostie/smia_ostie.service';
import { EmployeeHistoryService } from '../employee-history/employee-history.service';
import { EmployeeHistory } from '../employee-history/entities/employee-history.entity';
import { Holiday } from '../holiday/entities/holiday.entity';
import { HolidayService } from '../holiday/holiday.service';
import { CarriedForward } from '../carried-forward/entities/carried-forward.entity';
import { CarriedForwardService } from '../carried-forward/carried-forward.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Task, Employee, Leave, User, History, Permission2h, SmiaOstie, EmployeeHistory, Holiday, CarriedForward])
  ],
  controllers: [TaskController],
  providers: [
    TaskService,
    TaskScheduler,
    PuppeteerManagerService,
    PuppeteerService,
    EmployeeService,
    LeaveService,
    CryptoService,
    UserService,
    JwtService,
    HistoryService,
    Permission2hService,
    SmiaOstieService,
    EmployeeHistoryService,
    HolidayService,
    CarriedForwardService
  ],
  exports: [
    TaskService,
    TaskScheduler,
    PuppeteerService,
    CryptoService,
    EmployeeService,
    LeaveService,
    TypeOrmModule,
    UserService,
    HistoryService,
    JwtService,
    Permission2hService,
    SmiaOstieService,
    EmployeeHistoryService,
    HolidayService,
    CarriedForwardService
  ],
})
export class TaskModule { }
