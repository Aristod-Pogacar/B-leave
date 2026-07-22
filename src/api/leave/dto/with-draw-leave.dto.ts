import { IsString } from "class-validator";

export class WithdrawLeaveDto {

    @IsString()
    leave_id: string;

}