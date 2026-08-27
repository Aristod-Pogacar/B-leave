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
exports.Permission2hController = void 0;
const common_1 = require("@nestjs/common");
const permission2h_service_1 = require("./permission2h.service");
const create_permission2h_dto_1 = require("./dto/create-permission2h.dto");
const update_permission2h_dto_1 = require("./dto/update-permission2h.dto");
const role_decorator_1 = require("../user/role.decorator");
const user_entity_1 = require("../user/entities/user.entity");
const role_guard_1 = require("../user/role.guard");
const history_entity_1 = require("../history/entities/history.entity");
const history_service_1 = require("../history/history.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const permission_created_event_1 = require("../notification/events/permission-created.event");
let Permission2hController = class Permission2hController {
    permission2hService;
    historyService;
    eventEmitter;
    constructor(permission2hService, historyService, eventEmitter) {
        this.permission2hService = permission2hService;
        this.historyService = historyService;
        this.eventEmitter = eventEmitter;
    }
    async approuveLeaves(req, error) {
        const permissions = await this.permission2hService.getNonApprouvedLeaves(req.session.user.employee.id);
        return { title: "Approuve Permission 2h", error: error ? error : null, permissions: permissions };
    }
    async approveLeave(permissionId, res, req) {
        const permission = await this.permission2hService.findOne(permissionId);
        if (!permission) {
            return res.redirect('/permission2h/approuve-permission-2h');
        }
        await this.permission2hService.approveLeave(permissionId, req.session.user.id);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.PERMISSION_2H,
            message: "Permission 2h " + permission.date + " of " + permission.employee.name + " " + permission.employee.firstname + " approved by " + req.session.user.firstName + " " + req.session.user.name,
            created_by: req.session.user.matricule,
        });
        res.redirect('/permission2h/approuve-permission-2h');
    }
    async rejectLeave(permissionId, res, req) {
        const permission = await this.permission2hService.findOne(permissionId);
        if (!permission) {
            return res.redirect('/permission2h/approuve-permission-2h');
        }
        await this.permission2hService.rejectLeave(permissionId, req.session.user.id);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.PERMISSION_2H,
            message: "Permission 2h " + permission.date + " of " + permission.employee.name + " " + permission.employee.firstname + " rejected by " + req.session.user.firstName + " " + req.session.user.name,
            created_by: req.session.user.matricule,
        });
        res.redirect('/permission2h/approuve-permission-2h');
    }
    async export(res, req, search = '', startDate = new Date().toISOString().split('T')[0], endDate = new Date().toISOString().split('T')[0], site = '') {
        const data = await this.permission2hService.getToExport(search, startDate, endDate, site, req.session.user);
        const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB');
        const dateRange = `${formatDate(startDate)}-${formatDate(endDate)}`;
        const { data: toExport, total: toExportTotal } = await this.permission2hService.getToExport(search, startDate, endDate, site, req.session.user);
        await this.permission2hService.exportPermission2hToExcel(toExport, res, dateRange);
    }
    async permission2h(req, page = 1, search = '', startDate = new Date().toISOString().split('T')[0], endDate = new Date().toISOString().split('T')[0], site = '') {
        const limit = 20;
        const { data, total, totalPages } = await this.permission2hService.paginatePermission2h(search, Number(page), limit, startDate, endDate, site, req.session.user);
        const currentPage = Number(page);
        const maxButtons = 7;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        const allowedSites = this.getAllowedSites(req.session.user.site);
        const KEYS = allowedSites.map(val => {
            const key = Object.keys(user_entity_1.Site).find(k => user_entity_1.Site[k] === val);
            return key;
        });
        return {
            totalPermissions: total,
            currentPage,
            totalPages,
            startPage,
            endPage,
            data,
            total,
            search,
            startDate,
            endDate,
            allowedSites,
            KEYS,
            site,
            title: 'Permission 2h',
            user: req.session.user,
        };
    }
    async create(createPermission2hDto) {
        const permission2h = await this.permission2hService.create(createPermission2hDto);
        this.eventEmitter.emit('permission2h.created', new permission_created_event_1.Permission2hCreatedEvent(permission2h.id));
        return permission2h;
    }
    findAll() {
        return this.permission2hService.findAll();
    }
    findOne(id) {
        return this.permission2hService.findOne(id);
    }
    update(id, updatePermission2hDto) {
        return this.permission2hService.update(id, updatePermission2hDto);
    }
    remove(id) {
        return this.permission2hService.remove(id);
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
};
exports.Permission2hController = Permission2hController;
__decorate([
    (0, common_1.Get)('approuve-permission-2h'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.MANAGER),
    (0, common_1.Render)('approuve-permission-2h'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], Permission2hController.prototype, "approuveLeaves", null);
__decorate([
    (0, common_1.Post)('approve-permission-2h/:permissionId'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('permissionId')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], Permission2hController.prototype, "approveLeave", null);
__decorate([
    (0, common_1.Post)('reject-permission-2h/:permissionId'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('permissionId')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], Permission2hController.prototype, "rejectLeave", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.HR_LEAD),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('site')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], Permission2hController.prototype, "export", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Render)('permission-2h'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('site')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], Permission2hController.prototype, "permission2h", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_permission2h_dto_1.CreatePermission2hDto]),
    __metadata("design:returntype", Promise)
], Permission2hController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Permission2hController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], Permission2hController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_permission2h_dto_1.UpdatePermission2hDto]),
    __metadata("design:returntype", void 0)
], Permission2hController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], Permission2hController.prototype, "remove", null);
exports.Permission2hController = Permission2hController = __decorate([
    (0, common_1.Controller)('permission2h'),
    __metadata("design:paramtypes", [permission2h_service_1.Permission2hService,
        history_service_1.HistoryService,
        event_emitter_1.EventEmitter2])
], Permission2hController);
//# sourceMappingURL=permission2h.controller.js.map