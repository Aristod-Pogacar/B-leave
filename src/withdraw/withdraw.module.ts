import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdraw } from './entities/withdraw.entity';
import { LeaveService } from '../leave/leave.service';
import { Leave } from '../leave/entities/leave.entity';
import { Employee } from '../employee/entities/employee.entity';
import { EmployeeService } from '../employee/employee.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Permission2hService } from '../permission2h/permission2h.service';
import { Permission2h } from '../permission2h/entities/permission2h.entity';
import { SmiaOstie } from '../smia_ostie/entities/smia_ostie.entity';
import { SmiaOstieService } from '../smia_ostie/smia_ostie.service';
import { HistoryService } from '../history/history.service';
import { History } from '../history/entities/history.entity';
import { EmployeeHistory } from '../employee-history/entities/employee-history.entity';
import { CryptoService } from '../crypto/crypto.service';
import { HolidayService } from '../holiday/holiday.service';
import { Holiday } from '../holiday/entities/holiday.entity';
import { JwtService } from '@nestjs/jwt';
import { CarriedForward } from '../carried-forward/entities/carried-forward.entity';
import { CarriedForwardService } from '../carried-forward/carried-forward.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Withdraw,
      Leave,
      Employee,
      User,
      Permission2h,
      SmiaOstie,
      History,
      EmployeeHistory,
      Holiday,
      CarriedForward
    ]),
  ],
  controllers: [WithdrawController],
  providers: [
    WithdrawService,
    LeaveService,
    EmployeeService,
    UserService,
    Permission2hService,
    SmiaOstieService,
    HistoryService,
    EmployeeService,
    CryptoService,
    HolidayService,
    JwtService,
    CarriedForwardService
  ],
  exports: [
    WithdrawService,
    LeaveService,
    EmployeeService,
    UserService,
    Permission2hService,
    SmiaOstieService,
    HistoryService,
    EmployeeService,
    CryptoService,
    HolidayService,
    JwtService,
    CarriedForwardService
  ],
})
export class WithdrawModule { }
