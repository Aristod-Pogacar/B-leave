import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Employee } from '../employee/entities/employee.entity';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeHistory } from '../employee-history/entities/employee-history.entity';
import { EmployeeHistoryService } from '../employee-history/employee-history.service';
import { CryptoService } from '../crypto/crypto.service';
import { HolidayService } from '../holiday/holiday.service';
import { Holiday } from '../holiday/entities/holiday.entity';
import { HistoryService } from '../history/history.service';
import { History } from '../history/entities/history.entity';
import { Leave } from '../leave/entities/leave.entity';
import { CarriedForward } from '../carried-forward/entities/carried-forward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Employee, EmployeeHistory, Holiday, History, Leave, CarriedForward])],
  providers: [AuthService, UserService, MailService, JwtService, EmployeeService, EmployeeHistoryService, CryptoService, HolidayService, HistoryService],
  exports: [AuthService, UserService, MailService, JwtService, TypeOrmModule, EmployeeService, EmployeeHistoryService, CryptoService, HolidayService, HistoryService],
})
export class AuthModule { }
