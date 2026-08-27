import { WithdrawService } from './withdraw.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { HistoryService } from '../history/history.service';
export declare class WithdrawController {
    private readonly withdrawService;
    private readonly historyService;
    constructor(withdrawService: WithdrawService, historyService: HistoryService);
    findAllApprovedRequest(req: any, res: any): Promise<{
        title: string;
        error: any;
        requests: import("./entities/withdraw.entity").Withdraw[];
        message: any;
    }>;
    findAllRequest(req: any, res: any): Promise<{
        title: string;
        error: any;
        requests: import("./entities/withdraw.entity").Withdraw[];
        message: any;
    }>;
    approve(req: any, res: any, id: string): Promise<void>;
    done(req: any, res: any, id: string): Promise<void>;
    markDone(req: any, res: any, id: string): Promise<void>;
    create(createWithdrawDto: CreateWithdrawDto): Promise<{
        leave: import("../leave/entities/leave.entity").Leave;
    } & import("./entities/withdraw.entity").Withdraw>;
    findAll(): Promise<import("./entities/withdraw.entity").Withdraw[]>;
    findOne(id: string): Promise<import("./entities/withdraw.entity").Withdraw | null>;
    update(id: string, updateWithdrawDto: UpdateWithdrawDto): Promise<void>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
