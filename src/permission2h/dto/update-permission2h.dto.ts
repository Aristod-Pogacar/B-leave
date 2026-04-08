import { PartialType } from '@nestjs/mapped-types';
import { CreatePermission2hDto } from './create-permission2h.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePermission2hDto extends PartialType(CreatePermission2hDto) {
    @IsString()
    @IsOptional()
    reason?: string;

    @IsString()
    date: Date;

    @IsString()
    @IsOptional()
    startTime?: string;

    @IsString()
    @IsOptional()
    endTime?: string;

    @IsString()
    expectedStartTime: string;

    @IsString()
    expectedEndTime: string;

    @IsString()
    employee: string;
}
