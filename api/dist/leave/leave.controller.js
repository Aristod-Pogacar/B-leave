"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const leave_service_1 = require("./leave.service");
const create_leave_dto_1 = require("./dto/create-leave.dto");
const update_leave_dto_1 = require("./dto/update-leave.dto");
const express = __importStar(require("express"));
const employee_service_1 = require("../employee/employee.service");
const role_guard_1 = require("../user/role.guard");
const role_decorator_1 = require("../user/role.decorator");
const user_entity_1 = require("../user/entities/user.entity");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const history_service_1 = require("../history/history.service");
const history_entity_1 = require("../history/entities/history.entity");
const task_service_1 = require("../task/task.service");
const leave_entity_1 = require("./entities/leave.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const leave_approve_event_1 = require("../notification/events/leave-approve.event");
let LeaveController = class LeaveController {
    leaveService;
    employeeService;
    historyService;
    taskService;
    eventEmitter;
    constructor(leaveService, employeeService, historyService, taskService, eventEmitter) {
        this.leaveService = leaveService;
        this.employeeService = employeeService;
        this.historyService = historyService;
        this.taskService = taskService;
        this.eventEmitter = eventEmitter;
    }
    getAllowedSites(userSite) {
        if (userSite === user_entity_1.Site.MADA) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2, user_entity_1.Site.TANA];
        }
        if (userSite === user_entity_1.Site.ANTSIRABE) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2];
        }
        return [userSite];
    }
    async newLeave(query, error) {
        return { title: "New Leave", error: error ? error : null };
    }
    async createNewLeave(createLeaveDto, res, req) {
        await this.leaveService.create(createLeaveDto, res, req);
    }
    async leaveHistory(query, req) {
        const error = req.query.error;
        const message = req.query.message;
        return { title: "Leave History", error, message };
    }
    async getPermissions(req, startDate = new Date().toISOString().split('T')[0], endDate = new Date().toISOString().split('T')[0], status = leave_entity_1.LeaveStatus.APPROVED, search = '') {
        const leaves = await this.leaveService.getPermissions(req.session.user, new Date(startDate), new Date(endDate), status);
        return { title: "Permissions list", error: req.query.error, leaves: leaves, message: req.query.message, search: search, startDate, endDate, status };
    }
    async getManagerAbsences(managerId) {
        return this.leaveService.getManagerAbsences(managerId);
    }
    async rejectPermission(leaveId, res, req) {
        await this.leaveService.rejectLeave(leaveId, req.session.user.id);
        const message = "Permission rejected successfully.";
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.LEAVE,
            message: "Permission rejected by " + req.session.user.employee.firstname + " " + req.session.user.employee.name,
            created_by: req.session.user.matricule,
        });
        res.redirect('/leave/approuve-permissions?message=' + message);
    }
    async approuvePermissions(req) {
        const leaves = await this.leaveService.getNonApprouvedLeaves(req.session.user, ["Permission_AMD"]);
        return { title: "Approuve Permissions", error: req.query.error, leaves: leaves, message: req.query.message };
    }
    async approvePermission(leaveId, res, req) {
        const message = "Permission approved successfully. You are pleased to validate also on OneHR platfrom.";
        const leave = await this.leaveService.findOne(leaveId);
        if (leave) {
            const data = {
                employee: leave.employee.matricule,
                start_date: leave.start_date,
                end_date: leave.end_date,
                reason: leave.reason,
                leave_type: leave.leave_type
            };
            this.taskService.runPuppeteerTask(data, leave);
            await this.leaveService.approveLeave(leaveId, req.session.user.id);
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.LEAVE,
                message: "Permission approved by " + req.session.user.employee.firstname + " " + req.session.user.employee.name,
                created_by: req.session.user.matricule,
            });
            this.eventEmitter.emit('permission.approved', new leave_approve_event_1.LeaveApproveEvent(leave.id, req.session.user.id));
        }
        res.redirect('/leave/approuve-permissions?message=' + message);
    }
    async approuveLeaves(req) {
        const leaves = await this.leaveService.getNonApprouvedLeaves(req.session.user);
        return { title: "Approuve Leaves", error: req.query.error, leaves: leaves, message: req.query.message };
    }
    async approveLeave(leaveId, res, req) {
        await this.leaveService.approveLeave(leaveId, req.session.user.id);
        const message = "Leave approved successfully. You are pleased to validate also on OneHR platfrom.";
        const leave = await this.leaveService.findOne(leaveId);
        if (leave) {
            const data = {
                employee: leave.employee.matricule,
                start_date: leave.start_date,
                end_date: leave.end_date,
                reason: leave.reason,
                leave_type: leave.leave_type
            };
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.LEAVE,
                message: "Leave approved by " + req.session.user.employee.firstname + " " + req.session.user.employee.name,
                created_by: req.session.user.matricule,
            });
            this.eventEmitter.emit('leave.approved', new leave_approve_event_1.LeaveApproveEvent(leave.id, req.session.user.id));
        }
        res.redirect('/leave/approuve-leaves?message=' + message);
    }
    async rejectLeave(leaveId, res, req) {
        await this.leaveService.rejectLeave(leaveId, req.session.user.id);
        const message = "Leave rejected successfully.";
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.LEAVE,
            message: "Leave rejected by " + req.session.user.employee.firstname + " " + req.session.user.employee.name,
            created_by: req.session.user.matricule,
        });
        res.redirect('/leave/approuve-leaves?message=' + message);
    }
    async getEmployeeLeaves(employeeId, skip, take, startDate, endDate, status) {
        const st = new Date(startDate);
        const et = new Date(endDate);
        return this.leaveService.getPaginateEmployeeLeaves(employeeId, skip, take, st, et, status);
    }
    async getEmployeeLeavesByMonth(employeeId, month, year) {
        return this.leaveService.getEmployeeLeavesByMonth(employeeId, month, year);
    }
    async getEmployeeLeavesByYear(employeeId, year) {
        return this.leaveService.getEmployeeLeavesByYear(employeeId, year);
    }
    async getEmployeeLeavesByRange(employeeId, startDate, endDate) {
        return this.leaveService.getEmployeeLeavesByRange(employeeId, startDate, endDate);
    }
    async getLeavesByLine(line) {
        return this.leaveService.getLeavesByLine(line);
    }
    async getLeavesBySection(section) {
        return this.leaveService.getLeavesBySection(section);
    }
    async getLeavesByMonth(month, year) {
        return this.leaveService.getLeavesByMonth(month, year);
    }
    async getLeavesByYear(year) {
        return this.leaveService.getLeavesByYear(year);
    }
    async getLeavesByLineAndSection(line, section) {
        return this.leaveService.getLeavesByLineAndSection(line, section);
    }
    async getLeavesByRange(req, year, startMonth, endMonth, line, section, division, site, search) {
        const leaves = await this.leaveService.getLeavesByRange(year, startMonth, endMonth, line, "", section, division, site, req.session.user, search);
        return leaves;
    }
    async getLeavesOverlap(matricule, startDate, endDate) {
        console.log(matricule, startDate, endDate);
        const st = new Date(startDate);
        const et = new Date(endDate);
        const leaves = await this.leaveService.getLeavesOverlap(matricule, st, et);
        return leaves;
    }
    async getLeavesByMonthAndLineAndDepartement(year, month, line, departement, site) {
        return this.leaveService.getLeavesByMonthAndLineAndDepartement(year, month, line, departement, site);
    }
    async getPlanning(year, startMonth, endMonth, line, section, skip, take) {
        return this.leaveService.getPlanning(year, startMonth, endMonth, line, section, skip, take);
    }
    async getEmployeeCumulativeBalance(matricule, date) {
        const employee = await this.employeeService.findOneByMatricule(matricule);
        return this.leaveService.getEmployeeCumulativeBalance(employee?.id, new Date(date));
    }
    async importLeavesView(req) {
        return { title: "Import Leaves", error: req.query.error };
    }
    async importCarriedForwardPost(file, res, req) {
        try {
            const date = new Date(req.body.date);
            const result = await this.leaveService.importCarriedForwardLeaves(file, date);
            if (result.result === 'error') {
                return res.redirect(`/leave/import-leaves?error=${result.message}`);
            }
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.LEAVE,
                message: "Import carried forward leaves by " + req.session.user.employee.firstname + " " + req.session.user.employee.name,
                created_by: req.session.user.matricule,
            });
            return res.redirect(`/leave/planning-view`);
        }
        catch (error) {
            return res.redirect(`/leave/import-leaves?error=${error.message}`);
        }
    }
    async importLeavesPost(file, res, req) {
        try {
            const result = await this.leaveService.importLeaves(file, req.session.user.id);
            if (result.result === 'error') {
                return res.redirect(`/leave/import-leaves?error=${result.message}`);
            }
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.LEAVE,
                message: "Import leaves by " + req.session.user.employee.firstname + " " + req.session.user.employee.name,
                created_by: req.session.user.matricule,
            });
            return res.redirect(`/leave/planning-view`);
        }
        catch (error) {
            return res.redirect(`/leave/import-leaves?error=${error.message}`);
        }
    }
    async exportView(req) {
        const sectionList = await this.employeeService.findAllSections();
        const divisionList = await this.employeeService.findAllDivisions();
        const lineList = await this.employeeService.findAllLines();
        const allowedSites = this.getAllowedSites(req.session.user.site);
        const KEYS = allowedSites.map(val => {
            const key = Object.keys(user_entity_1.Site).find(k => user_entity_1.Site[k] === val);
            return key;
        });
        return { title: "Export", sectionList, divisionList, lineList, allowedSites, KEYS };
    }
    async exportPlanningPost(startDate, endDate, line, section, division, site, status, req, res) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const workbook = await this.leaveService.exportLeavePlanning(req.session.user, start, end, line, section, division, site, status);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${status}-leaves-${line}-${section}-${startDate}-${endDate}.xlsx`);
        await workbook.xlsx.write(res);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.LEAVE,
            message: "Export leaves by " + req.session.user.employee.firstname + " " + req.session.user.employee.name,
            created_by: req.session.user.matricule,
        });
        res.end();
    }
    async exportEmployeeLeaves(employeeId, startDate, endDate, status, res, req) {
        const employee = await this.employeeService.findOne(employeeId);
        if (!employee) {
            return res.status(404).send('Employee not found');
        }
        const workbook = await this.leaveService.exportEmployeeLeaves(employee, new Date(startDate), new Date(endDate), status);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=employee-leaves-${employee.matricule}-${employee.name + " " + employee.firstname}.xlsx`);
        await workbook.xlsx.write(res);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.LEAVE,
            message: "Export leaves of employee " + employee.name + " " + employee.firstname + " by " + req.session.user.employee.firstname + " " + req.session.user.employee.name,
            created_by: req.session.user.matricule,
        });
        res.end();
    }
    async planningView(req) {
        const allowedSites = this.getAllowedSites(req.session.user.site);
        const departementList = await this.employeeService.findAllDepartments();
        const divisionList = await this.employeeService.findAllDivisions();
        const sectionList = await this.employeeService.findAllSections();
        const lineList = await this.employeeService.findAllLines();
        const KEYS = allowedSites.map(val => {
            const key = Object.keys(user_entity_1.Site).find(k => user_entity_1.Site[k] === val);
            return key;
        });
        return { title: "Planning View", departementList, divisionList, lineList, allowedSites, KEYS, sectionList };
    }
    async newLeaveView() {
        return { title: "New leave" };
    }
    async simulateLeave() {
        return { title: "Simulate leave", userRole: user_entity_1.UserRole };
    }
    create(createLeaveDto, res, req) {
        return this.leaveService.create(createLeaveDto, res, req);
    }
    findAll() {
        return this.leaveService.findAll();
    }
    findOne(id) {
        return this.leaveService.findOne(id);
    }
    update(id, updateLeaveDto) {
        return this.leaveService.update(id, updateLeaveDto);
    }
    remove(id) {
        return this.leaveService.remove(id);
    }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Get)('new-leave'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Render)('new-leave'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "newLeave", null);
__decorate([
    (0, common_1.Post)('new-leave'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leave_dto_1.CreateLeaveDto, Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "createNewLeave", null);
__decorate([
    (0, common_1.Get)('leave-history'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Render)('leave-history'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "leaveHistory", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.HR_LEAD, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Render)('permission-list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getPermissions", null);
__decorate([
    (0, common_1.Get)('manager/:id/absences'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getManagerAbsences", null);
__decorate([
    (0, common_1.Post)('reject-permission/:leaveId'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.HR_LEAD),
    __param(0, (0, common_1.Param)('leaveId')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "rejectPermission", null);
__decorate([
    (0, common_1.Get)('approuve-permissions'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Render)('approuve-leaves'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "approuvePermissions", null);
__decorate([
    (0, common_1.Post)('approve-permission/:leaveId'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.HR_LEAD),
    __param(0, (0, common_1.Param)('leaveId')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "approvePermission", null);
__decorate([
    (0, common_1.Get)('approuve-leaves'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Render)('approuve-leaves'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "approuveLeaves", null);
__decorate([
    (0, common_1.Post)('approve-leave/:leaveId'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.HR_LEAD),
    __param(0, (0, common_1.Param)('leaveId')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "approveLeave", null);
__decorate([
    (0, common_1.Post)('reject-leave/:leaveId'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.HR_LEAD),
    __param(0, (0, common_1.Param)('leaveId')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "rejectLeave", null);
__decorate([
    (0, common_1.Get)('employee-leaves/paginate/:employeeId'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.HR_LEAD),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('take')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getEmployeeLeaves", null);
__decorate([
    (0, common_1.Get)('employee-leaves/:employeeId/:month/:year'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('month')),
    __param(2, (0, common_1.Param)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getEmployeeLeavesByMonth", null);
__decorate([
    (0, common_1.Get)('employee-leaves/:employeeId/:year'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getEmployeeLeavesByYear", null);
__decorate([
    (0, common_1.Get)('employee-leaves/:employeeId/:startDate/:endDate'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('startDate')),
    __param(2, (0, common_1.Param)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date, Date]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getEmployeeLeavesByRange", null);
__decorate([
    (0, common_1.Get)('leaves-line/:line'),
    __param(0, (0, common_1.Param)('line')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeavesByLine", null);
__decorate([
    (0, common_1.Get)('leaves-section/:section'),
    __param(0, (0, common_1.Param)('section')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeavesBySection", null);
__decorate([
    (0, common_1.Get)('leaves-month-year/:month/:year'),
    __param(0, (0, common_1.Param)('month')),
    __param(1, (0, common_1.Param)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeavesByMonth", null);
__decorate([
    (0, common_1.Get)('leaves-year/:year'),
    __param(0, (0, common_1.Param)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeavesByYear", null);
__decorate([
    (0, common_1.Get)('leaves-line-section/:line/:section'),
    __param(0, (0, common_1.Param)('line')),
    __param(1, (0, common_1.Param)('section')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeavesByLineAndSection", null);
__decorate([
    (0, common_1.Get)('range'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('startMonth')),
    __param(3, (0, common_1.Query)('endMonth')),
    __param(4, (0, common_1.Query)('line')),
    __param(5, (0, common_1.Query)('section')),
    __param(6, (0, common_1.Query)('division')),
    __param(7, (0, common_1.Query)('site')),
    __param(8, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeavesByRange", null);
__decorate([
    (0, common_1.Get)('overlap-leaves/:matricule/:startDate/:endDate'),
    __param(0, (0, common_1.Param)('matricule')),
    __param(1, (0, common_1.Param)('startDate')),
    __param(2, (0, common_1.Param)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeavesOverlap", null);
__decorate([
    (0, common_1.Get)('month-line-departement'),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('line')),
    __param(3, (0, common_1.Query)('departement')),
    __param(4, (0, common_1.Query)('site')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeavesByMonthAndLineAndDepartement", null);
__decorate([
    (0, common_1.Get)('planning'),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('startMonth')),
    __param(2, (0, common_1.Query)('endMonth')),
    __param(3, (0, common_1.Query)('line')),
    __param(4, (0, common_1.Query)('section')),
    __param(5, (0, common_1.Query)('skip')),
    __param(6, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getPlanning", null);
__decorate([
    (0, common_1.Post)('simulate-cumul-balance'),
    __param(0, (0, common_1.Body)('matricule')),
    __param(1, (0, common_1.Body)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getEmployeeCumulativeBalance", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Get)('import-leaves'),
    (0, common_1.Render)('import-leaves'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "importLeavesView", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Post)('import-carried-forward'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "importCarriedForwardPost", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Post)('import-leaves'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "importLeavesPost", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Get)('export'),
    (0, common_1.Render)('export'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "exportView", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Post)('export-planning'),
    __param(0, (0, common_1.Body)('startDate')),
    __param(1, (0, common_1.Body)('endDate')),
    __param(2, (0, common_1.Body)('line')),
    __param(3, (0, common_1.Body)('section')),
    __param(4, (0, common_1.Body)('division')),
    __param(5, (0, common_1.Body)('site')),
    __param(6, (0, common_1.Body)('status')),
    __param(7, (0, common_1.Req)()),
    __param(8, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date, String, String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "exportPlanningPost", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Get)('export-employee-leaves'),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Res)()),
    __param(5, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "exportEmployeeLeaves", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Get)('planning-view'),
    (0, common_1.Render)('leave-planning'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "planningView", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Get)('new-leave-test'),
    (0, common_1.Render)('new-leave-test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "newLeaveView", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Get)('simulate-leave'),
    (0, common_1.Render)('simulate-leave'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "simulateLeave", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leave_dto_1.CreateLeaveDto, Object, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_leave_dto_1.UpdateLeaveDto]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "remove", null);
exports.LeaveController = LeaveController = __decorate([
    (0, common_1.Controller)('leave'),
    __metadata("design:paramtypes", [leave_service_1.LeaveService,
        employee_service_1.EmployeeService,
        history_service_1.HistoryService,
        task_service_1.TaskService,
        event_emitter_1.EventEmitter2])
], LeaveController);
//# sourceMappingURL=leave.controller.js.map