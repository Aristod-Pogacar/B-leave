import { Module } from '@nestjs/common';
import { Permission2hService } from './permission2h.service';
import { Permission2hController } from './permission2h.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission2h } from './entities/permission2h.entity';
import { Employee } from 'src/employee/entities/employee.entity';
// import { Payroll } from 'src/payroll/entities/payroll.entity';
// import { PayrollService } from 'src/payroll/payroll.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { History } from 'src/history/entities/history.entity';
import { HistoryService } from 'src/history/history.service';
import { EmployeeService } from 'src/employee/employee.service';
import { EmployeeHistoryService } from 'src/employee-history/employee-history.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { HolidayService } from 'src/holiday/holiday.service';
import { MailService } from 'src/mail/mail.service';
import { EmployeeHistory } from 'src/employee-history/entities/employee-history.entity';
import { Holiday } from 'src/holiday/entities/holiday.entity';
import { Leave } from 'src/leave/entities/leave.entity';
import { LeaveService } from 'src/leave/leave.service';
import { SmiaOstieService } from 'src/smia_ostie/smia_ostie.service';
import { SmiaOstie } from 'src/smia_ostie/entities/smia_ostie.entity';

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
    TypeOrmModule.forFeature([
      Permission2h,
      Employee,
      EmployeeHistory,
      Holiday,
      Leave,
      History,
      User,
      SmiaOstie,
    ]),
  ],
  controllers: [Permission2hController],
  providers: [
    Permission2hService,
    HistoryService,
    UserService,
    JwtService,
    EmployeeService,
    EmployeeHistoryService,
    CryptoService,
    HolidayService,
    LeaveService,
    SmiaOstieService
    // MailService,
  ],
})
export class Permission2hModule { }
