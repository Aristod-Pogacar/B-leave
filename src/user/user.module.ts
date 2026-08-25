import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { Employee } from '../employee/entities/employee.entity';
import { Leave } from '../leave/entities/leave.entity';
import { History } from '../history/entities/history.entity';
import { HistoryService } from '../history/history.service';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeHistory } from '../employee-history/entities/employee-history.entity';
import { EmployeeHistoryService } from '../employee-history/employee-history.service';
import { CryptoService } from '../crypto/crypto.service';
import { HolidayService } from '../holiday/holiday.service';
import { Holiday } from '../holiday/entities/holiday.entity';
import { CarriedForward } from '../carried-forward/entities/carried-forward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Employee, Leave, History, EmployeeHistory, Holiday, CarriedForward])],
  controllers: [UserController],
  providers: [UserService, AuthService, MailService, JwtService, HistoryService, EmployeeService, EmployeeHistoryService, CryptoService, HolidayService],
  exports: [UserService, AuthService, MailService, JwtService, TypeOrmModule, HistoryService, EmployeeService, EmployeeHistoryService, CryptoService, HolidayService],
})
export class UserModule { }
