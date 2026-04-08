import { IsString } from "class-validator";

export class CreateMedicalServiceDto {
    @IsString()
    name: string;
}
