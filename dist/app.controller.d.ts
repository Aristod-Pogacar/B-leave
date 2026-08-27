import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { UserRole } from './user/entities/user.entity';
import { EmployeeService } from './employee/employee.service';
import { I18nContext } from 'nestjs-i18n';
import { LeaveService } from './leave/leave.service';
import { SmiaOstieService } from './smia_ostie/smia_ostie.service';
export declare class AppController {
    private readonly appService;
    private readonly authService;
    private readonly userService;
    private readonly employeeService;
    private readonly leaveService;
    private readonly smiaOstieService;
    constructor(appService: AppService, authService: AuthService, userService: UserService, employeeService: EmployeeService, leaveService: LeaveService, smiaOstieService: SmiaOstieService);
    obtenirDateReference: () => Date;
    private getAllowedSites;
    getHello(i18n: I18nContext, req: any): Promise<{
        t: (key: string) => unknown;
        title: string;
        activeEmployees: number;
        onLeaveEmployees: number;
        totalEmployees: number;
        diff: number;
        status: string;
        currentRate: string;
        lastRate: string;
        variation: string;
        ongoingLeaves: number;
        approvedLeaves: number;
        totalLeaves: number;
        approvalRate: string | number;
        pendingLeaves: number;
        totalLeaves2: number;
        pendingRate: string | number;
        monthlyStats: {
            month: number;
            leaveApproved: number;
            leavePending: number;
            permissionApproved: number;
            permissionPending: number;
            indispoApproved: number;
            indispoPending: number;
        }[];
        leaveTypes: {
            total: number;
            localLeave: number;
            permissionAMD: number;
            indispo: number;
            localPct: string | number;
            permissionPct: string | number;
            indispoPct: string | number;
        };
        leaveStatus: {
            totalPast: number;
            totalFuture: number;
            totalRejected: number;
            total: number;
            totalPastPct: string | number;
            totalFuturePct: string | number;
            totalRejectedPct: string | number;
        };
        managerStats: any[];
        sectionStats: import("./leave/leave.service").SectionAbsenceStat[];
        medicalStats: import("./smia_ostie/smia_ostie.service").SectionMedicalStat[];
        medicalByManagerStats: any[];
        userStats: {
            users: import("./user/entities/user.entity").User[];
            stats: {
                admins: number;
                hrManagers: number;
                managers: number;
                payrolls: number;
            };
        };
        departementList: string[];
        divisionList: string[];
        sectionList: string[];
        lineList: string[];
        KEYS: ("ANTSIRABE" | "TANA" | "MADA" | "ABE1" | "ABE2" | undefined)[];
        allowedSites: string[];
        employeesBySection: any[];
        absenceRateBySection: {
            section: any;
            days: number;
            rate: number;
        }[];
        monthlyGlobalAbsenceRate: {
            currentRate: number;
            previousRate: number;
            variation: number;
        };
        ongoingLeavesBySection: {
            section: any;
            totalEmployees: number;
            ongoingEmployees: number;
            rate: number;
        }[];
        pendingLeavesBySection: {
            section: any;
            pendingCount: number;
            rate: number;
        }[];
    }>;
    getLogin(i18n: I18nContext, req: any, res: any): Promise<any>;
    login(i18n: I18nContext, body: any, req: any, res: any): Promise<any>;
    getRegister(): {
        title: string;
        UserRole: typeof UserRole;
    };
    register(body: any, req: any, res: any): Promise<any>;
    logout(req: any, res: any): Promise<any>;
    test(req: any, res: any): Promise<any>;
}
