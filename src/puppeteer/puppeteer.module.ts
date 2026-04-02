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

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forFeature([Employee, Leave]),
    ],
    controllers: [PuppeteerController],
    providers: [
        PuppeteerService,
        PuppeteerManagerService,
        EmployeeService,
        LeaveService,
        CryptoService,
    ],
    exports: [
        PuppeteerService,
        CryptoService,
        EmployeeService,
        LeaveService,
        TypeOrmModule, // 🔥 IMPORTANT
    ],
})
export class PuppeteerModule { }
