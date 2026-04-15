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

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forFeature([Employee, Leave, User, History]),
    ],
    controllers: [PuppeteerController],
    providers: [
        PuppeteerService,
        PuppeteerManagerService,
        EmployeeService,
        LeaveService,
        CryptoService,
        HistoryService],
    exports: [
        PuppeteerService,
        CryptoService,
        EmployeeService,
        LeaveService,
        TypeOrmModule,
        HistoryService,
    ],
})
export class PuppeteerModule { }
