import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsNotEmpty()
    email: string;
}