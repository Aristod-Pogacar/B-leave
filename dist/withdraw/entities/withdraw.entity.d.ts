import { Leave } from "../../leave/entities/leave.entity";
import { User } from "../../user/entities/user.entity";
export declare enum WithdrawStatus {
    WITHDRAW_PENDING = "withdraw_pending",
    WITHDRAW_APPROVED = "withdraw_approved",
    WITHDRAW_REJECTED = "withdraw_rejected"
}
export declare class Withdraw {
    id: string;
    leave: Leave;
    status: WithdrawStatus;
    onehr_status: boolean;
    approved_date?: Date;
    approver?: User;
    created_at?: Date;
}
