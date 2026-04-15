import { Module } from '@nestjs/common';
import { MedicalServiceService } from './medical_service.service';
import { MedicalServiceController } from './medical_service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalService } from './entities/medical_service.entity';
import { HistoryService } from 'src/history/history.service';
import { History } from 'src/history/entities/history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalService, History]),  // 🔥 OBLIGATOIRE
  ],
  controllers: [MedicalServiceController],
  providers: [MedicalServiceService, HistoryService],
  exports: [MedicalServiceService, HistoryService],
})
export class MedicalServiceModule { }
