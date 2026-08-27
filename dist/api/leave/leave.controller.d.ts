import { LeaveService } from '../leave/leave.service';
import { CreateLeaveDto } from '../leave/dto/create-leave.dto';
import { UpdateLeaveDto } from '../leave/dto/update-leave.dto';
import { HistoryService } from '../../history/history.service';
export declare class LeaveController {
    private readonly leaveService;
    private readonly historyService;
    constructor(leaveService: LeaveService, historyService: HistoryService);
    create(createLeaveDto: CreateLeaveDto, res: any): Promise<any>;
    findAllHistory(matricule: string): Promise<import("../../leave/entities/leave.entity").Leave[] | null>;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateLeaveDto: UpdateLeaveDto): string;
    remove(id: string): string;
}
