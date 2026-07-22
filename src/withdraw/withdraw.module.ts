import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdraw } from './entities/withdraw.entity';
import { LeaveService } from 'src/leave/leave.service';
import { Leave } from 'src/leave/entities/leave.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { EmployeeService } from 'src/employee/employee.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Permission2hService } from 'src/permission2h/permission2h.service';
import { Permission2h } from 'src/permission2h/entities/permission2h.entity';
import { SmiaOstie } from 'src/smia_ostie/entities/smia_ostie.entity';
import { SmiaOstieService } from 'src/smia_ostie/smia_ostie.service';
import { HistoryService } from 'src/history/history.service';
import { History } from 'src/history/entities/history.entity';
import { EmployeeHistory } from 'src/employee-history/entities/employee-history.entity';
import { CryptoService } from 'src/crypto/crypto.service';
import { HolidayService } from 'src/holiday/holiday.service';
import { Holiday } from 'src/holiday/entities/holiday.entity';
import { JwtService } from '@nestjs/jwt';
import { CarriedForward } from 'src/carried-forward/entities/carried-forward.entity';
import { CarriedForwardService } from 'src/carried-forward/carried-forward.service';

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
