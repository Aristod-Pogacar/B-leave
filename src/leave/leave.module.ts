import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { Leave } from './entities/leave.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import { EmployeeService } from 'src/employee/employee.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { ManagerAssignation } from 'src/manager_assignation/entities/manager_assignation.entity';
import { User } from 'src/user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HistoryService } from 'src/history/history.service';
import { History } from 'src/history/entities/history.entity';
import { Task } from 'src/task/entities/task.entity';
import { TaskService } from 'src/task/task.service';
import { PuppeteerManagerService } from 'src/puppeteer-manager/puppeteer-manager.service';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { SmiaOstieService } from 'src/smia_ostie/smia_ostie.service';
import { SmiaOstie } from 'src/smia_ostie/entities/smia_ostie.entity';
import { Permission2hService } from 'src/permission2h/permission2h.service';
import { Permission2h } from 'src/permission2h/entities/permission2h.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmployeeHistoryService } from 'src/employee-history/employee-history.service';
import { EmployeeHistory } from 'src/employee-history/entities/employee-history.entity';
import { Holiday } from 'src/holiday/entities/holiday.entity';
import { HolidayService } from 'src/holiday/holiday.service';

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

    TypeOrmModule.forFeature([Leave, Employee, ManagerAssignation, User, History, Task, SmiaOstie, Permission2h, EmployeeHistory, Holiday]),
  ],
  controllers: [LeaveController],
  providers: [LeaveService, EmployeeService, CryptoService, HistoryService, TaskService, PuppeteerManagerService, PuppeteerService, SmiaOstieService, Permission2hService, UserService, JwtService, EmployeeHistoryService, HolidayService],
  exports: [LeaveService, TypeOrmModule, CryptoService, HistoryService, TaskService, PuppeteerManagerService, PuppeteerService, SmiaOstieService, Permission2hService, UserService, JwtService, EmployeeHistoryService, HolidayService],
})
export class LeaveModule { }
