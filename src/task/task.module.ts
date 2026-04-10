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

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Task, Employee, Leave, User])
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
    JwtService
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
    JwtService
  ],
})
export class TaskModule { }
