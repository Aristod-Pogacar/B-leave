import { Employee } from '../../employee/entities/employee.entity';
import { User } from '../../user/entities/user.entity';
import { Withdraw } from '../../withdraw/entities/withdraw.entity';
export declare enum LeaveStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    WITHDRAWN = "withdrawn"
}
export declare enum WithdrawStatus {
    WITHDRAW_PENDING = "withdraw_pending",
    WITHDRAW_APPROVED = "withdraw_approved",
    WITHDRAW_CANCELLED = "withdraw_cancelled"
}
export declare class Leave {
    id: string;
    employee: Employee;
    leave_type: string;
    start_date: Date;
    end_date: Date;
    duration: number;
    status: LeaveStatus;
    imported: boolean;
    withdraw_status: WithdrawStatus;
    onehr_status: boolean;
    reason?: string;
    approved_date?: Date;
    approver?: User;
    created_at?: Date;
    withdraw_Request: Withdraw[];
}
