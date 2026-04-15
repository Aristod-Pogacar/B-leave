import { IsString } from "class-validator";

export class CreateHistoryDto {
    @IsString()
    reason: string;

    @IsString()
    message: string;
}
