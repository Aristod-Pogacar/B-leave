import { IsString } from "class-validator";

export class CompareAdminDto {
    @IsString()
    password: string;

    @IsString()
    matricule: string;
}
