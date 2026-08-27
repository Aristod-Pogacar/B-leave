import { Employee } from '../../employee/entities/employee.entity';
export declare class EmployeeHistory {
    id: string;
    departement: string;
    section: string;
    line: string;
    matricule: string;
    DOE: Date;
    division: string;
    name: string;
    firstname?: string;
    job_level: string;
    job_post: string;
    designation: string;
    site: string;
    type: string;
    DOR?: Date;
    createdAt: Date;
    updatedAt?: Date;
    employee: Employee;
}
