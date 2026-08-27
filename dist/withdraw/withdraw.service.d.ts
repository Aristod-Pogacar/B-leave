import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { Withdraw, WithdrawStatus } from './entities/withdraw.entity';
import { Repository } from 'typeorm';
import { LeaveService } from '../leave/leave.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Site } from '../user/entities/user.entity';
export declare class WithdrawService {
    private readonly withdrawRepository;
    private readonly leaveService;
    private readonly eventEmitter;
    constructor(withdrawRepository: Repository<Withdraw>, leaveService: LeaveService, eventEmitter: EventEmitter2);
    done(id: string, userId: string): Promise<Withdraw>;
    markDone(id: string): Promise<Withdraw>;
    approve(id: string, user: any): Promise<Withdraw>;
    reject(id: string, user: any): Promise<Withdraw>;
    create(createWithdrawDto: CreateWithdrawDto): Promise<{
        leave: import("../leave/entities/leave.entity").Leave;
    } & Withdraw>;
    private getAllowedSites;
    findBySite(site: Site, status?: WithdrawStatus, onehr_status?: boolean): Promise<Withdraw[]>;
    findAll(): Promise<Withdraw[]>;
    findOne(id: string): Promise<Withdraw | null>;
    update(id: string, updateWithdrawDto: UpdateWithdrawDto): Promise<void>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
