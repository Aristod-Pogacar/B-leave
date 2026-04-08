import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalServiceDto } from './create-medical_service.dto';
import { IsString } from 'class-validator';

export class UpdateMedicalServiceDto extends PartialType(CreateMedicalServiceDto) {
    @IsString()
    name: string;
}
