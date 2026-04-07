import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateLeaveDto {

    @IsString()
    employee: string;

    @IsNotEmpty()
    // @IsDate()
    @Type(() => Date)
    start_date: Date;

    @IsNotEmpty()
    // @IsDate()
    @Type(() => Date)
    end_date: Date;

    @IsNotEmpty()
    @IsString()
    leave_type: string;

    @IsOptional()
    @IsString()
    reason?: string;

}