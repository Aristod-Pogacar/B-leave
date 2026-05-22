import { IsString, IsDate, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
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
    site!: string;

    @IsString()
    @IsNotEmpty()
    type!: string;

    @IsString()
    @IsOptional()
    managerId?: string;
}