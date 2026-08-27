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
exports.WithdrawController = void 0;
const common_1 = require("@nestjs/common");
const withdraw_service_1 = require("./withdraw.service");
const create_withdraw_dto_1 = require("./dto/create-withdraw.dto");
const update_withdraw_dto_1 = require("./dto/update-withdraw.dto");
const auth_guard_1 = require("../auth/auth.guard");
const role_guard_1 = require("../user/role.guard");
const role_decorator_1 = require("../user/role.decorator");
const user_entity_1 = require("../user/entities/user.entity");
const withdraw_entity_1 = require("./entities/withdraw.entity");
const history_service_1 = require("../history/history.service");
const history_entity_1 = require("../history/entities/history.entity");
let WithdrawController = class WithdrawController {
    withdrawService;
    historyService;
    constructor(withdrawService, historyService) {
        this.withdrawService = withdrawService;
        this.historyService = historyService;
    }
    async findAllApprovedRequest(req, res) {
        console.log("USER:", req.session.user.site);
        const requests = await this.withdrawService.findBySite(req.session.user.site, withdraw_entity_1.WithdrawStatus.WITHDRAW_APPROVED);
        console.log("REQUESTS:", requests);
        return { title: "Approved withdraws", error: req.query.error, requests: requests, message: req.query.message };
    }
    async findAllRequest(req, res) {
        const requests = await this.withdrawService.findBySite(req.session.user.site);
        return { title: "Approuve withdraws", error: req.query.error, requests: requests, message: req.query.message };
    }
    async approve(req, res, id) {
        await this.withdrawService.approve(id, req.session.user);
        const message = "Withdraw approved successfully. The payroll department needs to confirm it.";
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.WITHDRAW,
            message: "Withdraw request of " + req.session.user.employee.matricule + " approved by " + req.session.user.employee.matricule,
            created_by: req.session.user.employee.matricule,
        });
        res.redirect('/withdraw/request?message=' + message);
    }
    async done(req, res, id) {
        await this.withdrawService.done(id, req.session.user.id);
        const message = "Withdraw done successfully.";
        res.redirect('/withdraw/tasks?message=' + message);
    }
    async markDone(req, res, id) {
        await this.withdrawService.markDone(id);
        const message = "Withdraw marked done successfully.";
        res.redirect('/withdraw/tasks?message=' + message);
    }
    create(createWithdrawDto) {
        return this.withdrawService.create(createWithdrawDto);
    }
    findAll() {
        return this.withdrawService.findAll();
    }
    findOne(id) {
        return this.withdrawService.findOne(id);
    }
    update(id, updateWithdrawDto) {
        return this.withdrawService.update(id, updateWithdrawDto);
    }
    remove(id) {
        return this.withdrawService.remove(id);
    }
};
exports.WithdrawController = WithdrawController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Get)('tasks'),
    (0, common_1.Render)('withdraw-tasks'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WithdrawController.prototype, "findAllApprovedRequest", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Get)('request'),
    (0, common_1.Render)('withdraw-request'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WithdrawController.prototype, "findAllRequest", null);
__decorate([
    (0, common_1.Post)('approve/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], WithdrawController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('done/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], WithdrawController.prototype, "done", null);
__decorate([
    (0, common_1.Post)('mark-done/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], WithdrawController.prototype, "markDone", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_withdraw_dto_1.CreateWithdrawDto]),
    __metadata("design:returntype", void 0)
], WithdrawController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WithdrawController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WithdrawController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_withdraw_dto_1.UpdateWithdrawDto]),
    __metadata("design:returntype", void 0)
], WithdrawController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WithdrawController.prototype, "remove", null);
exports.WithdrawController = WithdrawController = __decorate([
    (0, common_1.Controller)('withdraw'),
    __metadata("design:paramtypes", [withdraw_service_1.WithdrawService,
        history_service_1.HistoryService])
], WithdrawController);
//# sourceMappingURL=withdraw.controller.js.map