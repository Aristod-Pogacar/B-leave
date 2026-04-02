import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Type } from 'class-transformer';

export class CreateLeaveDto {

    @IsString()
    employee: string;

    @Type(() => Date)
    @IsNotEmpty()
    @IsDate()
    start_date: Date;

    @Type(() => Date)
    @IsNotEmpty()
    @IsDate()
    end_date: Date;

    @IsNotEmpty()
    @IsString()
    leave_type: string;

    @IsOptional()
    @IsString()
    reason?: string;

}
