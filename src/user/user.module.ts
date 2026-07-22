import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { Employee } from 'src/employee/entities/employee.entity';
import { Leave } from 'src/leave/entities/leave.entity';
import { History } from 'src/history/entities/history.entity';
import { HistoryService } from 'src/history/history.service';
import { EmployeeService } from 'src/employee/employee.service';
import { EmployeeHistory } from 'src/employee-history/entities/employee-history.entity';
import { EmployeeHistoryService } from 'src/employee-history/employee-history.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { HolidayService } from 'src/holiday/holiday.service';
import { Holiday } from 'src/holiday/entities/holiday.entity';
import { CarriedForward } from 'src/carried-forward/entities/carried-forward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Employee, Leave, History, EmployeeHistory, Holiday, CarriedForward])],
  controllers: [UserController],
  providers: [UserService, AuthService, MailService, JwtService, HistoryService, EmployeeService, EmployeeHistoryService, CryptoService, HolidayService],
  exports: [UserService, AuthService, MailService, JwtService, TypeOrmModule, HistoryService, EmployeeService, EmployeeHistoryService, CryptoService, HolidayService],
})
export class UserModule { }
