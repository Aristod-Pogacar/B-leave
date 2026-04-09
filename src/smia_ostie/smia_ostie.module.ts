import { Module } from '@nestjs/common';
import { SmiaOstieService } from './smia_ostie.service';
import { SmiaOstieController } from './smia_ostie.controller';
import { Employee } from 'src/employee/entities/employee.entity';
import { SmiaOstie } from './entities/smia_ostie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([SmiaOstie, Employee]),
  ],
  controllers: [SmiaOstieController],
  providers: [SmiaOstieService],
})
export class SmiaOstieModule { }
