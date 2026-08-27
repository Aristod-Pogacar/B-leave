import { Employee } from "../../employee/entities/employee.entity";
import { User } from "../../user/entities/user.entity";
import { LeaveStatus } from "../../leave/entities/leave.entity";
export declare class Permission2h {
    id: string;
    reason: string;
    date: Date;
    expectedStartTime: string;
    expectedEndTime: string;
    startTime: string;
    endTime: string;
    employee: Employee;
    approved_date?: Date;
    approver?: User;
    status: LeaveStatus;
    applied_at: Date;
}
