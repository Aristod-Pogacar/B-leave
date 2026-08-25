import { Injectable } from "@nestjs/common";
import { Leave } from "../../leave/entities/leave.entity";
import { Repository } from "typeorm";
import { NotificationService } from "../notification.service";
import { LeaveCreatedEvent } from "../events/leave-created.event";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { LeaveApproveEvent } from "../events/leave-approve.event";
import { UserService } from "../../user/user.service";
import { Permission2hCreatedEvent } from "../events/permission-created.event";
import { Permission2hService } from "../../permission2h/permission2h.service";
import { WithdrawApprovedEvent, WithdrawRequestEvent } from "../events/withdraw-request.event";
import { WithdrawService } from "../../withdraw/withdraw.service";
import { Site, UserRole } from "../../user/entities/user.entity";
import { ConsultationCreatedEvent, MedicalServiceCreatedEvent } from "../events/medical-service.event";
import { SmiaOstieService } from "../../smia_ostie/smia_ostie.service";

@Injectable()
export class LeaveListener {

    constructor(
        @InjectRepository(Leave)
        private readonly leaveRepository: Repository<Leave>,
        private readonly notificationService: NotificationService,
        private readonly userService: UserService,
        private readonly permission2hService: Permission2hService,
        private readonly withdrawService: WithdrawService,
        private readonly medicalService: SmiaOstieService,
    ) { }

    @OnEvent('leave.created')
    async handleLeaveCreated(event: LeaveCreatedEvent) {

        const leave = await this.leaveRepository.findOne({
            where: {
                id: event.leaveId,
            },
            relations: [
                'employee',
                'employee.manager',
                'employee.manager.user'
            ]
        });

        if (!leave)
            return;

        const manager = leave.employee.manager?.user;

        if (!manager)
            return;

        await this.notificationService.create({

            recipient: manager,

            title: "New leave request",

            message:
                `${leave.employee.name} ${leave.employee.firstname} requested leave.`,

            url: `/leave/approuve-leaves`,

        });

    }

    // @OnEvent(['leave.approved', 'permission.approved'])
    @OnEvent('leave.approved')
    async handleLeaveApprove(event: LeaveApproveEvent) {

        const leave = await this.leaveRepository.findOne({
            where: {
                id: event.leaveId,
            },
            relations: [
                'employee',
                'employee.manager',
                // 'employee.manager.user',
                'approver',
            ]
        });

        if (!leave)
            return;

        const employeeManager = leave.employee.manager;
        if (!employeeManager) return;
        const employeeAccount = await this.userService.findOneByMatricule(employeeManager.matricule);
        const approver = await this.userService.findOne(event.userId);
        if (!approver || !employeeAccount || approver.id === employeeAccount.id) return;

        await this.notificationService.create({

            recipient: employeeAccount,

            title: "Leave request approved",

            message:
                `${leave.employee.matricule}'s leave approuved by ${approver.employee?.name} ${approver.employee?.firstname}`,

            url: `/leave/planning-view`,

        });

    }

    @OnEvent('permission.approved')
    async handlePermissionApproved(event: LeaveApproveEvent) {

        const leave = await this.leaveRepository.findOne({
            where: {
                id: event.leaveId,
            },
            relations: [
                'employee',
                'employee.manager',
                // 'employee.manager.user',
                'approver',
            ]
        });

        if (!leave)
            return;

        const employeeManager = leave.employee.manager;
        if (!employeeManager) return;
        const employeeAccount = await this.userService.findOneByMatricule(employeeManager.matricule);
        const approver = await this.userService.findOne(event.userId);
        if (!approver || !employeeAccount || approver.id === employeeAccount.id) return;

        await this.notificationService.create({

            recipient: employeeAccount,

            title: "Permission approved",

            message:
                `${leave.employee.matricule}'s permission approuved by ${approver.employee?.name} ${approver.employee?.firstname}`,

            url: `/leave/planning-view`,

        });

    }

    @OnEvent('permission2h.approved')
    async handlePermission2hApproved(event: Permission2hCreatedEvent) {

        const permission = await this.permission2hService.findOne(event.permissionId);
        if (!permission)
            return;

        const employeeManager = permission.employee.manager;
        if (!employeeManager)
            return;

        const employeeAccount = await this.userService.findOneByMatricule(employeeManager.matricule);
        if (!employeeAccount)
            return;

        await this.notificationService.create({

            recipient: employeeAccount,

            title: "2h permission request approved",

            message:
                `${permission.employee?.name} ${permission.employee?.firstname} has requested a 2h permission from ${permission.expectedStartTime} to ${permission.expectedEndTime}.`,

            url: `/permission2h/list`,

        });

    }

    @OnEvent('permission2h.created')
    async handlePermission2hCreated(event: Permission2hCreatedEvent) {

        const permission = await this.permission2hService.findOne(event.permissionId);
        if (!permission)
            return;

        const employeeManager = permission.employee.manager;
        if (!employeeManager)
            return;

        const employeeAccount = await this.userService.findOneByMatricule(employeeManager.matricule);
        if (!employeeAccount)
            return;

        await this.notificationService.create({

            recipient: employeeAccount,

            title: "New 2h permission request",

            message:
                `${permission.employee?.matricule} requested a 2h permission.`,

            url: `/permission2h/approuve-permission-2h`,

        });

    }

    @OnEvent('withdraw.request.created')
    async handleWithdrawRequestCreated(event: WithdrawRequestEvent) {

        const withdraw = await this.withdrawService.findOne(event.withdrawId);
        if (!withdraw) return;
        const hr_lead = await this.userService.findUsersByRole(UserRole.HR_LEAD, withdraw?.leave?.employee?.site as Site);
        if (hr_lead.length == 0) return;
        await this.notificationService.create({

            recipient: hr_lead[0],

            title: "New withdraw request",

            message:
                `${withdraw.leave?.employee?.matricule} requested to withdraw leave.`,

            url: `/withdraw/request/`,

        });

    }

    @OnEvent('withdraw.approved')
    async handleWithdrawApproved(event: WithdrawApprovedEvent) {

        const withdraw = await this.withdrawService.findOne(event.withdrawId);
        if (!withdraw) return;
        const employeeManager = withdraw.leave?.employee?.manager;
        if (!employeeManager) return;
        const payrollAccount = await this.userService.findPayrollUser(UserRole.PAYROLL, withdraw?.leave?.employee?.site as Site);
        if (!payrollAccount || payrollAccount.length == 0) return;
        for (let i = 0; i < payrollAccount.length; i++) {
            await this.notificationService.create({

                recipient: payrollAccount[i],

                title: "Withdraw request approved",

                message:
                    `${withdraw.approver?.employee?.matricule} approved the withdraw request of ${withdraw.leave?.employee?.matricule}.`,

                url: `/withdraw/tasks`,

            });
        }
    }

    @OnEvent('withdraw.rejected')
    async handleWithdrawRejected(event: WithdrawApprovedEvent) {

        const withdraw = await this.withdrawService.findOne(event.withdrawId);
        if (!withdraw) return;
        const employeeManager = withdraw.leave?.employee?.manager;
        if (!employeeManager) return;
        const employeeManagerAccount = await this.userService.findOneByMatricule(employeeManager.matricule);
        if (!employeeManagerAccount) return;
        await this.notificationService.create({

            recipient: employeeManagerAccount,

            title: "Withdraw request rejected",

            message:
                `${withdraw.approver?.employee?.matricule} rejected the withdraw request of ${withdraw.leave?.employee?.matricule}.`,

            url: `/leave/planning-view`,

        });

    }

    @OnEvent('withdraw.sent.onehr')
    async handleWithdrawSentOnehr(event: WithdrawRequestEvent) {

        const withdraw = await this.withdrawService.findOne(event.withdrawId);
        if (!withdraw) return;
        const employeeManager = withdraw.leave?.employee?.manager;
        if (!employeeManager) return;
        const employeeManagerAccount = await this.userService.findOneByMatricule(employeeManager.matricule);
        if (!employeeManagerAccount) return;
        await this.notificationService.create({

            recipient: employeeManagerAccount,

            title: "Withdraw request sent to OneHR",

            message:
                `${withdraw.leave?.employee?.matricule} withdraw request sended to OneHR.`,

            url: `/withdraw/request/`,

        });

    }

    @OnEvent('consultation.created')
    async handleConsultationCreated(event: ConsultationCreatedEvent) {

        const consultation = await this.medicalService.findOne(event.consultationId);
        if (!consultation) return;
        const employeeManager = consultation.employee.manager;
        if (!employeeManager) return;
        const employeeManagerAccount = await this.userService.findOneByMatricule(employeeManager.matricule);
        if (!employeeManagerAccount) return;
        await this.notificationService.create({

            recipient: employeeManagerAccount,

            title: "New medical consultation",

            message:
                `${consultation.employee?.matricule} has requested a medical consultation.`,

            url: `/smia-ostie/list`,

        });

    }

}