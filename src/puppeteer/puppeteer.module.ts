import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import { Leave } from 'src/leave/entities/leave.entity';
import { PuppeteerController } from './puppeteer.controller';
import { PuppeteerService } from './puppeteer.service';
import { PuppeteerManagerService } from 'src/puppeteer-manager/puppeteer-manager.service';
import { EmployeeService } from 'src/employee/employee.service';
import { LeaveService } from 'src/leave/leave.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { User } from 'src/user/entities/user.entity';
import { History } from 'src/history/entities/history.entity';
import { HistoryService } from 'src/history/history.service';
import { Permission2hService } from 'src/permission2h/permission2h.service';
import { SmiaOstieService } from 'src/smia_ostie/smia_ostie.service';
import { Permission2h } from 'src/permission2h/entities/permission2h.entity';
import { SmiaOstie } from 'src/smia_ostie/entities/smia_ostie.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmployeeHistoryService } from 'src/employee-history/employee-history.service';
import { EmployeeHistory } from 'src/employee-history/entities/employee-history.entity';


@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forFeature([Employee, Leave, User, History, Permission2h, SmiaOstie, User, Leave, EmployeeHistory]),
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
        EmployeeHistoryService
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
        EmployeeHistoryService
    ],
})
export class PuppeteerModule { }
