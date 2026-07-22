import { Module } from '@nestjs/common';
import { CarriedForwardService } from './carried-forward.service';
import { CarriedForwardController } from './carried-forward.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarriedForward } from './entities/carried-forward.entity';
import { Employee } from 'src/employee/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarriedForward, Employee])],
  controllers: [CarriedForwardController],
  providers: [CarriedForwardService],
  exports: [CarriedForwardService],
})
export class CarriedForwardModule { }
