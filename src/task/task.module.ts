import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { PuppeteerManagerService } from 'src/puppeteer-manager/puppeteer-manager.service';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { EmployeeService } from 'src/employee/employee.service';
import { LeaveService } from 'src/leave/leave.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { TaskScheduler } from './task.scheduler';
import { Employee } from 'src/employee/entities/employee.entity';
import { Leave } from 'src/leave/entities/leave.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { HistoryService } from 'src/history/history.service';
import { History } from 'src/history/entities/history.entity';
import { Permission2hService } from 'src/permission2h/permission2h.service';
import { Permission2h } from 'src/permission2h/entities/permission2h.entity';
import { SmiaOstie } from 'src/smia_ostie/entities/smia_ostie.entity';
import { SmiaOstieService } from 'src/smia_ostie/smia_ostie.service';
import { EmployeeHistoryService } from 'src/employee-history/employee-history.service';
import { EmployeeHistory } from 'src/employee-history/entities/employee-history.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Task, Employee, Leave, User, History, Permission2h, SmiaOstie, EmployeeHistory])
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
    EmployeeHistoryService
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
    EmployeeHistoryService
  ],
})
export class TaskModule { }
