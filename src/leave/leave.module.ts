import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { Leave } from './entities/leave.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { EmployeeService } from '../employee/employee.service';
import { CryptoService } from '../crypto/crypto.service';
import { ManagerAssignation } from '../manager_assignation/entities/manager_assignation.entity';
import { User } from '../user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HistoryService } from '../history/history.service';
import { History } from '../history/entities/history.entity';
import { Task } from '../task/entities/task.entity';
import { TaskService } from '../task/task.service';
import { PuppeteerManagerService } from '../puppeteer-manager/puppeteer-manager.service';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { SmiaOstieService } from '../smia_ostie/smia_ostie.service';
import { SmiaOstie } from '../smia_ostie/entities/smia_ostie.entity';
import { Permission2hService } from '../permission2h/permission2h.service';
import { Permission2h } from '../permission2h/entities/permission2h.entity';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmployeeHistoryService } from '../employee-history/employee-history.service';
import { EmployeeHistory } from '../employee-history/entities/employee-history.entity';
import { Holiday } from '../holiday/entities/holiday.entity';
import { HolidayService } from '../holiday/holiday.service';
import { Withdraw } from '../withdraw/entities/withdraw.entity';
import { WithdrawService } from '../withdraw/withdraw.service';
import { CarriedForwardService } from '../carried-forward/carried-forward.service';
import { CarriedForward } from '../carried-forward/entities/carried-forward.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: "smtp.office365.com", // e.g., Gmail, Mailtrap
          port: 587,
          secure: false,
          auth: {
            user: configService.get<string>('EMAIL_ADRESS'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>('EMAIL_ADRESS')}>`,
        },
      }),
    }),

    TypeOrmModule.forFeature([Leave, Employee, ManagerAssignation, User, History, Task, SmiaOstie, Permission2h, EmployeeHistory, Holiday, Withdraw, CarriedForward]),
  ],
  controllers: [LeaveController],
  providers: [LeaveService, EmployeeService, CryptoService, HistoryService, TaskService, PuppeteerManagerService, PuppeteerService, SmiaOstieService, Permission2hService, UserService, JwtService, EmployeeHistoryService, HolidayService, WithdrawService, CarriedForwardService],
  exports: [LeaveService, TypeOrmModule, CryptoService, HistoryService, TaskService, PuppeteerManagerService, PuppeteerService, SmiaOstieService, Permission2hService, UserService, JwtService, EmployeeHistoryService, HolidayService, WithdrawService, CarriedForwardService],
})
export class LeaveModule { }
