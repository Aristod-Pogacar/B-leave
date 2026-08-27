import type { Response } from 'express';
import { CryptoService } from '../crypto/crypto.service';
import { EmployeeService } from '../employee/employee.service';
import { CreateLeaveDto } from '../leave/dto/create-leave.dto';
import { LeaveService } from '../leave/leave.service';
import { PuppeteerManagerService } from '../puppeteer-manager/puppeteer-manager.service';
import { PuppeteerService } from './puppeteer.service';
export declare class PuppeteerController {
    private readonly manager;
    private readonly bot;
    private readonly employeeService;
    private readonly leaveService;
    private cryptoService;
    constructor(manager: PuppeteerManagerService, bot: PuppeteerService, employeeService: EmployeeService, leaveService: LeaveService, cryptoService: CryptoService);
    createSession(): Promise<{
        sessionId: any;
    }>;
    start(sessionId: string, res: Response): Promise<{
        success: boolean;
    }>;
    login(sessionId: string, body: {
        username: string;
        encryptedPassword: string;
    }, res: Response): Promise<{
        success: boolean;
    }>;
    goToLeave(sessionId: string, res: Response): Promise<{
        success: boolean;
    }>;
    goToNewLeave(sessionId: string, res: Response): Promise<{
        success: boolean;
    }>;
    completeForm(sessionId: string, data: CreateLeaveDto, res: Response): Promise<{
        success: boolean;
    }>;
    close(sessionId: string): Promise<{
        message: string;
    } | undefined>;
    fullLeave(data: CreateLeaveDto, res: Response): Promise<void>;
}
