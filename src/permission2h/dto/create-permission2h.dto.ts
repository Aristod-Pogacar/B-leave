import { IsOptional, IsString } from "class-validator";

export class CreatePermission2hDto {
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
