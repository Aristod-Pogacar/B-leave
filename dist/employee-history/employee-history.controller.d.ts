import { EmployeeHistoryService } from './employee-history.service';
import { CreateEmployeeHistoryDto } from './dto/create-employee-history.dto';
import { UpdateEmployeeHistoryDto } from './dto/update-employee-history.dto';
export declare class EmployeeHistoryController {
    private readonly employeeHistoryService;
    constructor(employeeHistoryService: EmployeeHistoryService);
    getEmployeeHistory(req: any, employeeId: string, res: any): Promise<{
        title: string;
        data: import("./entities/employee-history.entity").EmployeeHistory[];
        user: any;
    }>;
    getrehire(req: any, id: string, res: any): Promise<{
        title: string;
        data: import("./entities/employee-history.entity").EmployeeHistory | null;
        user: any;
    }>;
    rehire(req: any, id: string, res: any, body: any): Promise<any>;
    archives(req: any, search?: string, page?: number): Promise<{
        title: string;
        data: import("./entities/employee-history.entity").EmployeeHistory[];
        search: string;
        startPage: number;
        endPage: number;
        totalPages: number;
        total: number;
        currentPage: number;
        user: any;
    }>;
    create(createEmployeeHistoryDto: CreateEmployeeHistoryDto): string;
    findAll(): string;
    findOne(id: string): Promise<import("./entities/employee-history.entity").EmployeeHistory | null>;
    update(id: string, updateEmployeeHistoryDto: UpdateEmployeeHistoryDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("./entities/employee-history.entity").EmployeeHistory | "Employee not found">;
}
