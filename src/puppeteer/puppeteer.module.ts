import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { Leave } from '../leave/entities/leave.entity';
import { PuppeteerController } from './puppeteer.controller';
import { PuppeteerService } from './puppeteer.service';
import { PuppeteerManagerService } from '../puppeteer-manager/puppeteer-manager.service';
import { EmployeeService } from '../employee/employee.service';
import { LeaveService } from '../leave/leave.service';
import { CryptoService } from '../crypto/crypto.service';
import { User } from '../user/entities/user.entity';
import { History } from '../history/entities/history.entity';
import { HistoryService } from '../history/history.service';
import { Permission2hService } from '../permission2h/permission2h.service';
import { SmiaOstieService } from '../smia_ostie/smia_ostie.service';
import { Permission2h } from '../permission2h/entities/permission2h.entity';
import { SmiaOstie } from '../smia_ostie/entities/smia_ostie.entity';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmployeeHistoryService } from '../employee-history/employee-history.service';
import { EmployeeHistory } from '../employee-history/entities/employee-history.entity';
import { Holiday } from '../holiday/entities/holiday.entity';
import { HolidayService } from '../holiday/holiday.service';
import { CarriedForwardService } from '../carried-forward/carried-forward.service';
import { CarriedForward } from '../carried-forward/entities/carried-forward.entity';


@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forFeature([Employee, Leave, User, History, Permission2h, SmiaOstie, User, Leave, EmployeeHistory, Holiday, CarriedForward]),
    ],
    controllers: [PuppeteerController],
    providers: [
        PuppeteerService,
        PuppeteerManagerService,
        EmployeeService,
        LeaveService,
        CryptoService,
        HistoryService,
        Permission2hService,
        SmiaOstieService,
        UserService,
        JwtService,
        UserService,
        EmployeeHistoryService,
        HolidayService,
        CarriedForwardService
    ],
    exports: [
        PuppeteerService,
        CryptoService,
        EmployeeService,
        LeaveService,
        TypeOrmModule,
        HistoryService,
        Permission2hService,
        SmiaOstieService,
        UserService,
        JwtService,
        UserService,
        EmployeeHistoryService,
        HolidayService,
        CarriedForwardService
    ],
})
export class PuppeteerModule { }
