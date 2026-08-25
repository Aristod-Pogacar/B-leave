import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leave } from '../../leave/entities/leave.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { CryptoService } from '../../crypto/crypto.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { History } from '../../history/entities/history.entity';
import { HistoryService } from '../../history/history.service';
import { EmployeeService } from '../../employee/employee.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { EmployeeHistory } from '../../employee-history/entities/employee-history.entity';
import { EmployeeHistoryService } from '../../employee-history/employee-history.service';
import { Holiday } from '../../holiday/entities/holiday.entity';
import { HolidayService } from '../../holiday/holiday.service';
import { CarriedForward } from '../../carried-forward/entities/carried-forward.entity';

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
    TypeOrmModule.forFeature([Leave, Employee, History, User, EmployeeHistory, Holiday, CarriedForward])],
  controllers: [LeaveController],
  providers: [LeaveService, CryptoService, HistoryService, EmployeeService, UserService, JwtService, EmployeeHistoryService, HolidayService],
  exports: [LeaveService, TypeOrmModule, CryptoService, HistoryService, EmployeeService, UserService, JwtService, EmployeeHistoryService, HolidayService],
})
export class ApiLeaveModule { }
