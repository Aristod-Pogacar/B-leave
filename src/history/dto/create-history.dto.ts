import { IsOptional, IsString } from "class-validator";

export class CreateHistoryDto {
    @IsString()
    reason: string;

    @IsString()
    message: string;

    @IsString()
    @IsOptional()
    created_by: string;
}
