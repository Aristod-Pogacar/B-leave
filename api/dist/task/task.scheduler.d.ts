import { TaskService } from './task.service';
import { Employee } from '../employee/entities/employee.entity';
import { Repository } from 'typeorm';
import { Leave } from '../leave/entities/leave.entity';
import { LeaveService } from '../leave/leave.service';
export declare class TaskScheduler {
    private readonly leaveService;
    private readonly taskService;
    private readonly employeeRepo;
    private readonly leaveRepo;
    private i;
    constructor(leaveService: LeaveService, taskService: TaskService, employeeRepo: Repository<Employee>, leaveRepo: Repository<Leave>);
    runTasks(): Promise<void>;
}
