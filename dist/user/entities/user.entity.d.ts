import { Employee } from '../../employee/entities/employee.entity';
import { Leave } from '../../leave/entities/leave.entity';
import { Withdraw } from '../../withdraw/entities/withdraw.entity';
export declare enum UserRole {
    ADMIN = "ADMIN",
    HR_LEAD = "HR_LEAD",
    MANAGER = "MANAGER",
    PAYROLL = "PAYROLL",
    SUPERADMIN = "SUPERADMIN"
}
export declare enum Site {
    ABE1 = "ABE 1",
    ABE2 = "ABE 2",
    ANTSIRABE = "ANTSIRABE",
    TANA = "TANA",
    MADA = "MADA"
}
export declare class User {
    id: string;
    phone: string;
    email: string;
    password: string;
    role: UserRole;
    site: Site;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isVerified: boolean;
    isDeleted: boolean;
    isBlocked: boolean;
    isSuspended: boolean;
    isArchived: boolean;
    leaves: Leave[];
    withdrawn: Withdraw[];
    employee?: Employee | null;
}
