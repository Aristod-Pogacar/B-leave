import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leave } from 'src/leave/entities/leave.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { CryptoService } from 'src/crypto/crypto.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { History } from 'src/history/entities/history.entity';
import { HistoryService } from 'src/history/history.service';
import { EmployeeService } from 'src/employee/employee.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

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
    TypeOrmModule.forFeature([Leave, Employee, History, User])],
  controllers: [LeaveController],
  providers: [LeaveService, CryptoService, HistoryService, EmployeeService, UserService, JwtService],
  exports: [LeaveService, TypeOrmModule, CryptoService, HistoryService, EmployeeService, UserService, JwtService],
})
export class ApiLeaveModule { }
