import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./entities/notification.entity";
import { Leave } from "src/leave/entities/leave.entity";
import { LeaveListener } from "./listeners/leave.listener";

@Module({

  imports: [
    TypeOrmModule.forFeature([
      Notification,
      Leave
    ]),
  ],

  providers: [
    NotificationService,
    LeaveListener,
  ],

  exports: [
    NotificationService,
  ],

})
export class NotificationModule { }