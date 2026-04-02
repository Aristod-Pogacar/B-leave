import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leave } from 'src/leave/entities/leave.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { CryptoService } from 'src/crypto/crypto.service';

@Module({
  imports: [TypeOrmModule.forFeature([Leave, Employee])],
  controllers: [LeaveController],
  providers: [LeaveService, CryptoService],
  exports: [LeaveService, TypeOrmModule, CryptoService],
})
export class ApiLeaveModule { }
