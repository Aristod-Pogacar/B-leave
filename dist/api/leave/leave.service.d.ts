import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { Repository } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';
import { Leave } from '../../leave/entities/leave.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmployeeService } from '../../employee/employee.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class LeaveService {
    private readonly leaveRepository;
    private readonly employeeRepository;
    private readonly mailerService;
    private readonly configService;
    private readonly employeeService;
    private readonly eventEmitter;
    constructor(leaveRepository: Repository<Leave>, employeeRepository: Repository<Employee>, mailerService: MailerService, configService: ConfigService, employeeService: EmployeeService, eventEmitter: EventEmitter2);
    findAllHistory(matricule: string): Promise<Leave[] | null>;
    create(createLeaveDto: CreateLeaveDto, res: any): Promise<any>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateLeaveDto: UpdateLeaveDto): string;
    remove(id: number): string;
}
