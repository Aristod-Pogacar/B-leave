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

    TypeOrmModule.forFeature([Leave, Employee, ManagerAssignation, User, History])],
  controllers: [LeaveController],
  providers: [LeaveService, EmployeeService, CryptoService, HistoryService],
  exports: [LeaveService, TypeOrmModule, CryptoService, HistoryService],
})
export class LeaveModule { }
