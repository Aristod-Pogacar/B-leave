import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import * as express from 'express';
import { EmployeeService } from '../employee/employee.service';
import { UserRole } from '../user/entities/user.entity';
import { HistoryService } from '../history/history.service';
import { TaskService } from '../task/task.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class LeaveController {
    private readonly leaveService;
    private readonly employeeService;
    private readonly historyService;
    private readonly taskService;
    private readonly eventEmitter;
    constructor(leaveService: LeaveService, employeeService: EmployeeService, historyService: HistoryService, taskService: TaskService, eventEmitter: EventEmitter2);
    private getAllowedSites;
    newLeave(query: any, error?: string): Promise<{
        title: string;
        error: string | null;
    }>;
    createNewLeave(createLeaveDto: CreateLeaveDto, res: express.Response, req: any): Promise<void>;
    leaveHistory(query: any, req: any): Promise<{
        title: string;
        error: any;
        message: any;
    }>;
    getPermissions(req: any, startDate?: string, endDate?: string, status?: string, search?: string): Promise<{
        title: string;
        error: any;
        leaves: import("./entities/leave.entity").Leave[];
        message: any;
        search: string;
        startDate: string;
        endDate: string;
        status: string;
    }>;
    getManagerAbsences(managerId: string): Promise<import("./entities/leave.entity").Leave[]>;
    rejectPermission(leaveId: string, res: express.Response, req: any): Promise<void>;
    approuvePermissions(req: any): Promise<{
        title: string;
        error: any;
        leaves: import("./entities/leave.entity").Leave[];
        message: any;
    }>;
    approvePermission(leaveId: string, res: express.Response, req: any): Promise<void>;
    approuveLeaves(req: any): Promise<{
        title: string;
        error: any;
        leaves: import("./entities/leave.entity").Leave[];
        message: any;
    }>;
    approveLeave(leaveId: string, res: express.Response, req: any): Promise<void>;
    rejectLeave(leaveId: string, res: express.Response, req: any): Promise<void>;
    getEmployeeLeaves(employeeId: string, skip: number, take: number, startDate: string, endDate: string, status: string): Promise<{
        data: import("./entities/leave.entity").Leave[];
        count: number;
    }>;
    getEmployeeLeavesByMonth(employeeId: string, month: number, year: number): Promise<import("./entities/leave.entity").Leave[]>;
    getEmployeeLeavesByYear(employeeId: string, year: number): Promise<import("./entities/leave.entity").Leave[]>;
    getEmployeeLeavesByRange(employeeId: string, startDate: Date, endDate: Date): Promise<import("./entities/leave.entity").Leave[]>;
    getLeavesByLine(line: string): Promise<import("./entities/leave.entity").Leave[]>;
    getLeavesBySection(section: string): Promise<import("./entities/leave.entity").Leave[]>;
    getLeavesByMonth(month: number, year: number): Promise<import("./entities/leave.entity").Leave[]>;
    getLeavesByYear(year: number): Promise<import("./entities/leave.entity").Leave[]>;
    getLeavesByLineAndSection(line: string, section: string): Promise<import("./entities/leave.entity").Leave[]>;
    getLeavesByRange(req: any, year: number, startMonth: number, endMonth: number, line: string, section: string, division: string, site: string, search: string): Promise<import("./entities/leave.entity").Leave[]>;
    getLeavesOverlap(matricule: string, startDate: string, endDate: string): Promise<import("./entities/leave.entity").Leave[]>;
    getLeavesByMonthAndLineAndDepartement(year: number, month: number, line: string, departement: string, site: string): Promise<import("./entities/leave.entity").Leave[]>;
    getPlanning(year: number, startMonth: number, endMonth: number, line: string, section: string, skip: number, take: number): Promise<import("./entities/leave.entity").Leave[]>;
    getEmployeeCumulativeBalance(matricule: string, date: string): Promise<{
        solde_cumul: number;
        solde_cumul_mensuel: number;
        solde_debut: number;
        solde_pris: number;
        solde_restant: number;
        solde_restant_mensuel: number;
        id: string;
        departement: string;
        section: string;
        line: string;
        matricule: string;
        gender: string;
        DOE: Date;
        DOR?: Date | null;
        division: string;
        name: string;
        firstname?: string;
        job_level: string;
        designation: string;
        site: string;
        type: string;
        is_deleted: boolean;
        is_active: boolean;
        leaves: import("./entities/leave.entity").Leave[];
        permission2h: import("../permission2h/entities/permission2h.entity").Permission2h[];
        smia_ostie: import("../smia_ostie/entities/smia_ostie.entity").SmiaOstie[];
        manager?: import("../employee/entities/employee.entity").Employee | null;
        app_password: string;
        onehr_password: string;
        histories: import("../employee-history/entities/employee-history.entity").EmployeeHistory[];
        fingerprintId?: number | null;
        deviceId?: string | null;
        user?: import("../user/entities/user.entity").User;
        subordinates: import("../employee/entities/employee.entity").Employee[];
        carriedForwards: import("../carried-forward/entities/carried-forward.entity").CarriedForward[];
    } | null>;
    importLeavesView(req: any): Promise<{
        title: string;
        error: any;
    }>;
    importCarriedForwardPost(file: Express.Multer.File, res: express.Response, req: any): Promise<void>;
    importLeavesPost(file: Express.Multer.File, res: express.Response, req: any): Promise<void>;
    exportView(req: any): Promise<{
        title: string;
        sectionList: string[];
        divisionList: string[];
        lineList: string[];
        allowedSites: string[];
        KEYS: ("ANTSIRABE" | "TANA" | "MADA" | "ABE1" | "ABE2" | undefined)[];
    }>;
    exportPlanningPost(startDate: Date, endDate: Date, line: string, section: string, division: string, site: string, status: string, req: any, res: express.Response): Promise<void>;
    exportEmployeeLeaves(employeeId: string, startDate: string, endDate: string, status: string, res: express.Response, req: any): Promise<express.Response<any, Record<string, any>> | undefined>;
    planningView(req: any): Promise<{
        title: string;
        departementList: string[];
        divisionList: string[];
        lineList: string[];
        allowedSites: string[];
        KEYS: ("ANTSIRABE" | "TANA" | "MADA" | "ABE1" | "ABE2" | undefined)[];
        sectionList: string[];
    }>;
    newLeaveView(): Promise<{
        title: string;
    }>;
    simulateLeave(): Promise<{
        title: string;
        userRole: typeof UserRole;
    }>;
    create(createLeaveDto: CreateLeaveDto, res: express.Response, req: any): Promise<void>;
    findAll(): Promise<import("./entities/leave.entity").Leave[]>;
    findOne(id: string): Promise<import("./entities/leave.entity").Leave | null>;
    update(id: string, updateLeaveDto: UpdateLeaveDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
