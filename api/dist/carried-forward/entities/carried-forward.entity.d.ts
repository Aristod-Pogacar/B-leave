import { Employee } from "../../employee/entities/employee.entity";
export declare class CarriedForward {
    id: string;
    days: number;
    daysTaken: number;
    employee: Employee;
    date: Date;
    createdAt: Date;
    updatedAt?: Date;
    deletedAt: Date;
}
