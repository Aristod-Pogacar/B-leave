import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./entities/notification.entity";
import { Leave } from "src/leave/entities/leave.entity";
import { LeaveListener } from "./listeners/leave.listener";
import { NotificationController } from "./notification.controller";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { EmployeeService } from "src/employee/employee.service";
import { Employee } from "src/employee/entities/employee.entity";
import { EmployeeHistory } from "src/employee-history/entities/employee-history.entity";
import { EmployeeHistoryService } from "src/employee-history/employee-history.service";
import { CryptoService } from "src/crypto/crypto.service";
import { HolidayService } from "src/holiday/holiday.service";
import { HistoryService } from "src/history/history.service";
import { Holiday } from "src/holiday/entities/holiday.entity";
import { History } from "src/history/entities/history.entity";
import { Permission2h } from "src/permission2h/entities/permission2h.entity";
import { Permission2hService } from "src/permission2h/permission2h.service";
import { WithdrawService } from "src/withdraw/withdraw.service";
import { Withdraw } from "src/withdraw/entities/withdraw.entity";
import { LeaveService } from "src/leave/leave.service";
import { SmiaOstie } from "src/smia_ostie/entities/smia_ostie.entity";
import { SmiaOstieService } from "src/smia_ostie/smia_ostie.service";
import { CarriedForwardService } from "src/carried-forward/carried-forward.service";
import { CarriedForward } from "src/carried-forward/entities/carried-forward.entity";

@Module({

  imports: [
    TypeOrmModule.forFeature([
      Notification,
      Leave,
      User,
      Employee,
      Holiday,
      History,
      Permission2h,
      EmployeeHistory,
      Withdraw,
      SmiaOstie,
      CarriedForward
    ]),
  ],

  controllers: [
    NotificationController,
  ],

  providers: [
    NotificationService,
    UserService,
    LeaveService,
    Permission2hService,
    LeaveListener,
    JwtService,
    EmployeeService,
    CryptoService,
    HolidayService,
    HistoryService,
    EmployeeHistoryService,
    WithdrawService,
    CarriedForwardService,
    SmiaOstieService
  ],

  exports: [
    NotificationService,
    UserService,
    LeaveService,
    JwtService,
    EmployeeService,
    CryptoService,
    HolidayService,
    HistoryService,
    EmployeeHistoryService,
    WithdrawService,
    CarriedForwardService,
    SmiaOstieService
  ],

})
export class NotificationModule { }