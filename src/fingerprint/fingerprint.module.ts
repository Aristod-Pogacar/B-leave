import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FingerprintGateway } from './fingerprint.gateway';
import { FingerprintService } from './fingerprint.service';
import { Employee } from '../employee/entities/employee.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Employee])],
    providers: [FingerprintGateway, FingerprintService],
})
export class FingerprintModule { }