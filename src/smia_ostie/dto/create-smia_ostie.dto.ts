import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateSmiaOstieDto {

    @IsString()
    employee: string;

    @IsOptional()
    @IsDateString()
    date?: Date;

    @IsOptional()
    @IsString()
    reason?: string;
}
