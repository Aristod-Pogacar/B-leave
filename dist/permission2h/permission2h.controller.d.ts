import { Permission2hService } from './permission2h.service';
import { CreatePermission2hDto } from './dto/create-permission2h.dto';
import { UpdatePermission2hDto } from './dto/update-permission2h.dto';
import type { Response } from 'express';
import { HistoryService } from '../history/history.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class Permission2hController {
    private readonly permission2hService;
    private readonly historyService;
    private readonly eventEmitter;
    constructor(permission2hService: Permission2hService, historyService: HistoryService, eventEmitter: EventEmitter2);
    approuveLeaves(req: any, error?: string): Promise<{
        title: string;
        error: string | null;
        permissions: import("./entities/permission2h.entity").Permission2h[];
    }>;
    approveLeave(permissionId: string, res: Response, req: any): Promise<void>;
    rejectLeave(permissionId: string, res: Response, req: any): Promise<void>;
    export(res: Response, req: any, search?: string, startDate?: string, endDate?: string, site?: string): Promise<void>;
    permission2h(req: any, page?: number, search?: string, startDate?: string, endDate?: string, site?: string): Promise<{
        totalPermissions: number;
        currentPage: number;
        totalPages: number;
        startPage: number;
        endPage: number;
        data: import("./entities/permission2h.entity").Permission2h[];
        total: number;
        search: string;
        startDate: string;
        endDate: string;
        allowedSites: string[];
        KEYS: ("ANTSIRABE" | "TANA" | "MADA" | "ABE1" | "ABE2" | undefined)[];
        site: string;
        title: string;
        user: any;
    }>;
    create(createPermission2hDto: CreatePermission2hDto): Promise<import("./entities/permission2h.entity").Permission2h>;
    findAll(): Promise<import("./entities/permission2h.entity").Permission2h[]>;
    findOne(id: string): Promise<import("./entities/permission2h.entity").Permission2h | null>;
    update(id: string, updatePermission2hDto: UpdatePermission2hDto): Promise<import("./entities/permission2h.entity").Permission2h>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
    private getAllowedSites;
}
