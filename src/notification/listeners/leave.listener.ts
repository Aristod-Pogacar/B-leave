import { Injectable } from "@nestjs/common";
import { Leave } from "src/leave/entities/leave.entity";
import { Repository } from "typeorm";
import { NotificationService } from "../notification.service";
import { LeaveCreatedEvent } from "../events/leave-created.event";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { LeaveApproveEvent } from "../events/leave-approve.event";
import { UserService } from "src/user/user.service";
import { Permission2hCreatedEvent } from "../events/permission-created.event";
import { Permission2hService } from "src/permission2h/permission2h.service";
import { WithdrawRequestEvent } from "../events/withdraw-request.event";
import { WithdrawService } from "src/withdraw/withdraw.service";
import { Site, UserRole } from "src/user/entities/user.entity";

@Injectable()
export class LeaveListener {

    constructor(
        @InjectRepository(Leave)
        private readonly leaveRepository: Repository<Leave>,
        private readonly notificationService: NotificationService,
        private readonly userService: UserService,
        private readonly permission2hService: Permission2hService,
        private readonly withdrawService: WithdrawService,
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
                `${leave.employee.name} ${leave.employee.firstname} has requested a leave.`,

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

            title: "Leave request has been approved",

            message:
                `${approver.employee?.name} ${approver.employee?.firstname} has approved leave request of ${leave.employee.matricule} from ${new Date(leave.start_date).toLocaleDateString('en-GB')} to ${new Date(leave.end_date).toLocaleDateString('en-GB')}.`,

            url: `/leave`,

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

            title: "Leave request has been approved",

            message:
                `${approver.employee?.name} ${approver.employee?.firstname} has approved leave request of ${leave.employee.matricule} from ${new Date(leave.start_date).toLocaleDateString('en-GB')} to ${new Date(leave.end_date).toLocaleDateString('en-GB')}.`,

            url: `/leave`,

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

            title: "Leave request has been approved",

            message:
                `${permission.employee?.name} ${permission.employee?.firstname} has requested a 2h permission from ${permission.expectedStartTime} to ${permission.expectedEndTime}.`,

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

            title: "Leave withdrawal request has been created",

            message:
                `${withdraw.leave?.employee?.name} ${withdraw.leave?.employee?.firstname} has requested to withdraw leave of ${withdraw.leave?.employee?.matricule} from ${new Date(withdraw.leave?.start_date).toLocaleDateString('en-GB')} to ${new Date(withdraw.leave?.end_date).toLocaleDateString('en-GB')}.`,

            url: `/withdraw/request/`,

        });

    }

}