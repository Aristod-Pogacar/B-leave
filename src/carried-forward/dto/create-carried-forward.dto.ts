import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCarriedForwardDto {
    @IsNotEmpty()
    @IsNumber()
    days: number;

    @IsNotEmpty()
    @IsString()
    employeeId: string;

    @IsNotEmpty()
    @IsDate()
    date: Date;
}
