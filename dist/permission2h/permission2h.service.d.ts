import { Permission2h } from './entities/permission2h.entity';
import { Repository } from 'typeorm';
import { CreatePermission2hDto } from './dto/create-permission2h.dto';
import { UpdatePermission2hDto } from './dto/update-permission2h.dto';
import { Employee } from '../employee/entities/employee.entity';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { HistoryService } from '../history/history.service';
export declare class Permission2hService {
    private readonly userService;
    private employeeRepository;
    private permission2hRepository;
    private readonly configService;
    private readonly mailerService;
    private readonly historyService;
    constructor(userService: UserService, employeeRepository: Repository<Employee>, permission2hRepository: Repository<Permission2h>, configService: ConfigService, mailerService: MailerService, historyService: HistoryService);
    rejectLeave(permissionId: string, userId: string): Promise<Permission2h>;
    approveLeave(permissionId: string, userId: string): Promise<Permission2h>;
    getNonApprouvedLeaves(id: any): Promise<Permission2h[]>;
    paginatePermission2h(search: string, page: number, limit: number, startDate: string, endDate: string, site: string, user: any): Promise<{
        data: Permission2h[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getToExport(search: string, startDate: string, endDate: string, site: string, user: any): Promise<{
        data: Permission2h[];
        total: number;
    }>;
    paginatePermission2hById(id: number, search: string, page: number, limit: number, date: string): Promise<{
        data: Permission2h[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    create(dto: CreatePermission2hDto): Promise<Permission2h>;
    findAll(): Promise<Permission2h[]>;
    findOne(id: string): Promise<Permission2h | null>;
    getPermission2h(date: string, site: string): Promise<Permission2h[]>;
    exportPermission2hToExcel(data: any[], res: Response, date: string): Promise<void>;
    update(id: string, dto: UpdatePermission2hDto): Promise<Permission2h>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
    countToday(): Promise<number>;
}
