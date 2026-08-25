import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./entities/notification.entity";
import { Leave } from "../leave/entities/leave.entity";
import { LeaveListener } from "./listeners/leave.listener";
import { NotificationController } from "./notification.controller";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { EmployeeService } from "../employee/employee.service";
import { Employee } from "../employee/entities/employee.entity";
import { EmployeeHistory } from "../employee-history/entities/employee-history.entity";
import { EmployeeHistoryService } from "../employee-history/employee-history.service";
import { CryptoService } from "../crypto/crypto.service";
import { HolidayService } from "../holiday/holiday.service";
import { HistoryService } from "../history/history.service";
import { Holiday } from "../holiday/entities/holiday.entity";
import { History } from "../history/entities/history.entity";
import { Permission2h } from "../permission2h/entities/permission2h.entity";
import { Permission2hService } from "../permission2h/permission2h.service";
import { WithdrawService } from "../withdraw/withdraw.service";
import { Withdraw } from "../withdraw/entities/withdraw.entity";
import { LeaveService } from "../leave/leave.service";
import { SmiaOstie } from "../smia_ostie/entities/smia_ostie.entity";
import { SmiaOstieService } from "../smia_ostie/smia_ostie.service";
import { CarriedForwardService } from "../carried-forward/carried-forward.service";
import { CarriedForward } from "../carried-forward/entities/carried-forward.entity";

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