import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
    @IsString()
    @IsNotEmpty()
    departement!: string;

    @IsString()
    @IsNotEmpty()
    section!: string;

    @IsString()
    @IsNotEmpty()
    line!: string;

    @IsString()
    @IsNotEmpty()
    matricule!: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(['M', 'F'])
    gender!: string;

    @IsDate()
    @IsNotEmpty()
    DOE!: Date;

    @IsString()
    @IsNotEmpty()
    division!: string;

    @IsString()
    @IsNotEmpty()
    div!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    firstname?: string;

    @IsString()
    @IsNotEmpty()
    job_level!: string;

    @IsString()
    @IsNotEmpty()
    designation!: string;

    @IsString()
    @IsNotEmpty()
    type!: string;

    @IsString()
    @IsNotEmpty()
    site!: string;

    @IsString()
    @IsOptional()
    managerId?: string;
}
