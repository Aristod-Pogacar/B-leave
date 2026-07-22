import { Module } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { HolidayController } from './holiday.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from './entities/holiday.entity';
import { HistoryService } from 'src/history/history.service';
import { History } from 'src/history/entities/history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Holiday, History])],
  controllers: [HolidayController],
  providers: [HolidayService, HistoryService],
  exports: [HolidayService, HistoryService]
})
export class HolidayModule { }
