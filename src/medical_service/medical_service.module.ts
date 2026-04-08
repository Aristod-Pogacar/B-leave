import { Module } from '@nestjs/common';
import { MedicalServiceService } from './medical_service.service';
import { MedicalServiceController } from './medical_service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalService } from './entities/medical_service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalService]),  // 🔥 OBLIGATOIRE
  ],
  controllers: [MedicalServiceController],
  providers: [MedicalServiceService],
  exports: [MedicalServiceService],
})
export class MedicalServiceModule { }
