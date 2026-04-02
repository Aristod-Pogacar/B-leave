import { IsString } from "class-validator";

export class CreateManagerAssignationDto {

    @IsString()
    employee: string;

    @IsString()
    manager: string;

}
