import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { EmployeeService } from 'src/employee/employee.service';
import { EmployeeHistory } from 'src/employee-history/entities/employee-history.entity';
import { EmployeeHistoryService } from 'src/employee-history/employee-history.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { HolidayService } from 'src/holiday/holiday.service';
import { Holiday } from 'src/holiday/entities/holiday.entity';
import { HistoryService } from 'src/history/history.service';
import { History } from 'src/history/entities/history.entity';
import { Leave } from 'src/leave/entities/leave.entity';
import { CarriedForward } from 'src/carried-forward/entities/carried-forward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Employee, EmployeeHistory, Holiday, History, Leave, CarriedForward])],
  providers: [AuthService, UserService, MailService, JwtService, EmployeeService, EmployeeHistoryService, CryptoService, HolidayService, HistoryService],
  exports: [AuthService, UserService, MailService, JwtService, TypeOrmModule, EmployeeService, EmployeeHistoryService, CryptoService, HolidayService, HistoryService],
})
export class AuthModule { }
