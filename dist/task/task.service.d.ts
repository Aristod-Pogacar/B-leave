import { PuppeteerManagerService } from "../puppeteer-manager/puppeteer-manager.service";
import { PuppeteerService } from "../puppeteer/puppeteer.service";
import { EmployeeService } from "../employee/employee.service";
import { LeaveService } from "../leave/leave.service";
import { CryptoService } from "../crypto/crypto.service";
import { CreateLeaveDto } from "../leave/dto/create-leave.dto";
import { Repository } from "typeorm";
import { Employee } from "../employee/entities/employee.entity";
import { Leave } from "../leave/entities/leave.entity";
import { HistoryService } from "../history/history.service";
export declare class TaskService {
    private readonly manager;
    private readonly bot;
    private readonly employeeService;
    private readonly leaveService;
    private cryptoService;
    private readonly historyService;
    private readonly employeeRepo;
    private readonly leaveRepo;
    constructor(manager: PuppeteerManagerService, bot: PuppeteerService, employeeService: EmployeeService, leaveService: LeaveService, cryptoService: CryptoService, historyService: HistoryService, employeeRepo: Repository<Employee>, leaveRepo: Repository<Leave>);
    executePendingTasks(): Promise<void>;
    runPuppeteerTask(data: CreateLeaveDto, leave: Leave): Promise<void>;
}
