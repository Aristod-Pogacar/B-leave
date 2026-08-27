import { ConfigService } from '@nestjs/config';
import { Employee } from '../employee/entities/employee.entity';
import { CreateLeaveDto } from '../leave/dto/create-leave.dto';
import { Leave } from '../leave/entities/leave.entity';
import { PuppeteerManagerService } from '../puppeteer-manager/puppeteer-manager.service';
import { Repository } from 'typeorm';
export declare class PuppeteerService {
    private readonly employeeRepo;
    private leaveRepo;
    private readonly config;
    private readonly manager;
    constructor(employeeRepo: Repository<Employee>, leaveRepo: Repository<Leave>, config: ConfigService, manager: PuppeteerManagerService);
    start(sessionId: string): Promise<{
        success: boolean;
    }>;
    login(sessionId: string, username: string, password: string): Promise<{
        success: boolean;
    }>;
    goToLeave(sessionId: string): Promise<{
        success: boolean;
    }>;
    goToNewLeave(sessionId: string): Promise<{
        success: boolean;
    }>;
    completeFormulaire(sessionId: string, data: CreateLeaveDto): Promise<{
        success: boolean;
    }>;
}
