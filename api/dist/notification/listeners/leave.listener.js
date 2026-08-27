"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveListener = void 0;
const common_1 = require("@nestjs/common");
const leave_entity_1 = require("../../leave/entities/leave.entity");
const typeorm_1 = require("typeorm");
const notification_service_1 = require("../notification.service");
const leave_created_event_1 = require("../events/leave-created.event");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_2 = require("@nestjs/typeorm");
const leave_approve_event_1 = require("../events/leave-approve.event");
const user_service_1 = require("../../user/user.service");
const permission_created_event_1 = require("../events/permission-created.event");
const permission2h_service_1 = require("../../permission2h/permission2h.service");
const withdraw_request_event_1 = require("../events/withdraw-request.event");
const withdraw_service_1 = require("../../withdraw/withdraw.service");
const user_entity_1 = require("../../user/entities/user.entity");
const medical_service_event_1 = require("../events/medical-service.event");
const smia_ostie_service_1 = require("../../smia_ostie/smia_ostie.service");
let LeaveListener = class LeaveListener {
    leaveRepository;
    notificationService;
    userService;
    permission2hService;
    withdrawService;
    medicalService;
    constructor(leaveRepository, notificationService, userService, permission2hService, withdrawService, medicalService) {
        this.leaveRepository = leaveRepository;
        this.notificationService = notificationService;
        this.userService = userService;
        this.permission2hService = permission2hService;
        this.withdrawService = withdrawService;
        this.medicalService = medicalService;
    }
    async handleLeaveCreated(event) {
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
            message: `${leave.employee.name} ${leave.employee.firstname} requested leave.`,
            url: `/leave/approuve-leaves`,
        });
    }
    async handleLeaveApprove(event) {
        const leave = await this.leaveRepository.findOne({
            where: {
                id: event.leaveId,
            },
            relations: [
                'employee',
                'employee.manager',
                'approver',
            ]
        });
        if (!leave)
            return;
        const employeeManager = leave.employee.manager;
        if (!employeeManager)
            return;
        const employeeAccount = await this.userService.findOneByMatricule(employeeManager.matricule);
        const approver = await this.userService.findOne(event.userId);
        if (!approver || !employeeAccount || approver.id === employeeAccount.id)
            return;
        await this.notificationService.create({
            recipient: employeeAccount,
            title: "Leave request approved",
            message: `${leave.employee.matricule}'s leave approuved by ${approver.employee?.name} ${approver.employee?.firstname}`,
            url: `/leave/planning-view`,
        });
    }
    async handlePermissionApproved(event) {
        const leave = await this.leaveRepository.findOne({
            where: {
                id: event.leaveId,
            },
            relations: [
                'employee',
                'employee.manager',
                'approver',
            ]
        });
        if (!leave)
            return;
        const employeeManager = leave.employee.manager;
        if (!employeeManager)
            return;
        const employeeAccount = await this.userService.findOneByMatricule(employeeManager.matricule);
        const approver = await this.userService.findOne(event.userId);
        if (!approver || !employeeAccount || approver.id === employeeAccount.id)
            return;
        await this.notificationService.create({
            recipient: employeeAccount,
            title: "Permission approved",
            message: `${leave.employee.matricule}'s permission approuved by ${approver.employee?.name} ${approver.employee?.firstname}`,
            url: `/leave/planning-view`,
        });
    }
    async handlePermission2hApproved(event) {
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
            message: `${permission.employee?.name} ${permission.employee?.firstname} has requested a 2h permission from ${permission.expectedStartTime} to ${permission.expectedEndTime}.`,
            url: `/permission2h/list`,
        });
    }
    async handlePermission2hCreated(event) {
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
            message: `${permission.employee?.matricule} requested a 2h permission.`,
            url: `/permission2h/approuve-permission-2h`,
        });
    }
    async handleWithdrawRequestCreated(event) {
        const withdraw = await this.withdrawService.findOne(event.withdrawId);
        if (!withdraw)
            return;
        const hr_lead = await this.userService.findUsersByRole(user_entity_1.UserRole.HR_LEAD, withdraw?.leave?.employee?.site);
        if (hr_lead.length == 0)
            return;
        await this.notificationService.create({
            recipient: hr_lead[0],
            title: "New withdraw request",
            message: `${withdraw.leave?.employee?.matricule} requested to withdraw leave.`,
            url: `/withdraw/request/`,
        });
    }
    async handleWithdrawApproved(event) {
        const withdraw = await this.withdrawService.findOne(event.withdrawId);
        if (!withdraw)
            return;
        const employeeManager = withdraw.leave?.employee?.manager;
        if (!employeeManager)
            return;
        const payrollAccount = await this.userService.findPayrollUser(user_entity_1.UserRole.PAYROLL, withdraw?.leave?.employee?.site);
        if (!payrollAccount || payrollAccount.length == 0)
            return;
        for (let i = 0; i < payrollAccount.length; i++) {
            await this.notificationService.create({
                recipient: payrollAccount[i],
                title: "Withdraw request approved",
                message: `${withdraw.approver?.employee?.matricule} approved the withdraw request of ${withdraw.leave?.employee?.matricule}.`,
                url: `/withdraw/tasks`,
            });
        }
    }
    async handleWithdrawRejected(event) {
        const withdraw = await this.withdrawService.findOne(event.withdrawId);
        if (!withdraw)
            return;
        const employeeManager = withdraw.leave?.employee?.manager;
        if (!employeeManager)
            return;
        const employeeManagerAccount = await this.userService.findOneByMatricule(employeeManager.matricule);
        if (!employeeManagerAccount)
            return;
        await this.notificationService.create({
            recipient: employeeManagerAccount,
            title: "Withdraw request rejected",
            message: `${withdraw.approver?.employee?.matricule} rejected the withdraw request of ${withdraw.leave?.employee?.matricule}.`,
            url: `/leave/planning-view`,
        });
    }
    async handleWithdrawSentOnehr(event) {
        const withdraw = await this.withdrawService.findOne(event.withdrawId);
        if (!withdraw)
            return;
        const employeeManager = withdraw.leave?.employee?.manager;
        if (!employeeManager)
            return;
        const employeeManagerAccount = await this.userService.findOneByMatricule(employeeManager.matricule);
        if (!employeeManagerAccount)
            return;
        await this.notificationService.create({
            recipient: employeeManagerAccount,
            title: "Withdraw request sent to OneHR",
            message: `${withdraw.leave?.employee?.matricule} withdraw request sended to OneHR.`,
            url: `/withdraw/request/`,
        });
    }
    async handleConsultationCreated(event) {
        const consultation = await this.medicalService.findOne(event.consultationId);
        if (!consultation)
            return;
        const employeeManager = consultation.employee.manager;
        if (!employeeManager)
            return;
        const employeeManagerAccount = await this.userService.findOneByMatricule(employeeManager.matricule);
        if (!employeeManagerAccount)
            return;
        await this.notificationService.create({
            recipient: employeeManagerAccount,
            title: "New medical consultation",
            message: `${consultation.employee?.matricule} has requested a medical consultation.`,
            url: `/smia-ostie/list`,
        });
    }
};
exports.LeaveListener = LeaveListener;
__decorate([
    (0, event_emitter_1.OnEvent)('leave.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_created_event_1.LeaveCreatedEvent]),
    __metadata("design:returntype", Promise)
], LeaveListener.prototype, "handleLeaveCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('leave.approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_approve_event_1.LeaveApproveEvent]),
    __metadata("design:returntype", Promise)
], LeaveListener.prototype, "handleLeaveApprove", null);
__decorate([
    (0, event_emitter_1.OnEvent)('permission.approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_approve_event_1.LeaveApproveEvent]),
    __metadata("design:returntype", Promise)
], LeaveListener.prototype, "handlePermissionApproved", null);
__decorate([
    (0, event_emitter_1.OnEvent)('permission2h.approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [permission_created_event_1.Permission2hCreatedEvent]),
    __metadata("design:returntype", Promise)
], LeaveListener.prototype, "handlePermission2hApproved", null);
__decorate([
    (0, event_emitter_1.OnEvent)('permission2h.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [permission_created_event_1.Permission2hCreatedEvent]),
    __metadata("design:returntype", Promise)
], LeaveListener.prototype, "handlePermission2hCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('withdraw.request.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [withdraw_request_event_1.WithdrawRequestEvent]),
    __metadata("design:returntype", Promise)
], LeaveListener.prototype, "handleWithdrawRequestCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('withdraw.approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [withdraw_request_event_1.WithdrawApprovedEvent]),
    __metadata("design:returntype", Promise)
], LeaveListener.prototype, "handleWithdrawApproved", null);
__decorate([
    (0, event_emitter_1.OnEvent)('withdraw.rejected'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [withdraw_request_event_1.WithdrawApprovedEvent]),
    __metadata("design:returntype", Promise)
], LeaveListener.prototype, "handleWithdrawRejected", null);
__decorate([
    (0, event_emitter_1.OnEvent)('withdraw.sent.onehr'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [withdraw_request_event_1.WithdrawRequestEvent]),
    __metadata("design:returntype", Promise)
], LeaveListener.prototype, "handleWithdrawSentOnehr", null);
__decorate([
    (0, event_emitter_1.OnEvent)('consultation.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [medical_service_event_1.ConsultationCreatedEvent]),
    __metadata("design:returntype", Promise)
], LeaveListener.prototype, "handleConsultationCreated", null);
exports.LeaveListener = LeaveListener = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(leave_entity_1.Leave)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        notification_service_1.NotificationService,
        user_service_1.UserService,
        permission2h_service_1.Permission2hService,
        withdraw_service_1.WithdrawService,
        smia_ostie_service_1.SmiaOstieService])
], LeaveListener);
//# sourceMappingURL=leave.listener.js.map