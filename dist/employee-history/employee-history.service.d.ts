import { CreateEmployeeHistoryDto } from './dto/create-employee-history.dto';
import { UpdateEmployeeHistoryDto } from './dto/update-employee-history.dto';
import { EmployeeHistory } from './entities/employee-history.entity';
import { Repository } from 'typeorm';
import { Employee } from '../employee/entities/employee.entity';
export declare class EmployeeHistoryService {
    private readonly employeeHistoryRepository;
    private readonly employeeRepository;
    constructor(employeeHistoryRepository: Repository<EmployeeHistory>, employeeRepository: Repository<Employee>);
    rehire(id: string, body: any): Promise<Employee | "Employee not found">;
    paginateArchives(search: string, page: number, limit: number, user: any): Promise<{
        data: EmployeeHistory[];
        total: number;
        totalPages: number;
    }>;
    employeeHistory(employeeId: string): Promise<EmployeeHistory[]>;
    create(createEmployeeHistoryDto: CreateEmployeeHistoryDto): string;
    findAll(): string;
    findOne(id: string): Promise<EmployeeHistory | null>;
    update(id: string, updateEmployeeHistoryDto: UpdateEmployeeHistoryDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<EmployeeHistory | "Employee not found">;
}
