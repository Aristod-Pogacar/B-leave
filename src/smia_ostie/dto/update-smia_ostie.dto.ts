import { PartialType } from '@nestjs/mapped-types';
import { CreateSmiaOstieDto } from './create-smia_ostie.dto';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateSmiaOstieDto extends PartialType(CreateSmiaOstieDto) {

    @IsString()
    employee: string;

    @IsOptional()
    @IsDateString()
    date?: Date;

    @IsOptional()
    @IsString()
    reason?: string;
}
