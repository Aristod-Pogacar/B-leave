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
exports.SmiaOstieController = void 0;
const common_1 = require("@nestjs/common");
const smia_ostie_service_1 = require("./smia_ostie.service");
const create_smia_ostie_dto_1 = require("./dto/create-smia_ostie.dto");
const update_smia_ostie_dto_1 = require("./dto/update-smia_ostie.dto");
const role_guard_1 = require("../user/role.guard");
const user_entity_1 = require("../user/entities/user.entity");
const role_decorator_1 = require("../user/role.decorator");
let SmiaOstieController = class SmiaOstieController {
    smiaOstieService;
    constructor(smiaOstieService) {
        this.smiaOstieService = smiaOstieService;
    }
    async getManagerMedicalServices(managerId) {
        return this.smiaOstieService.getManagerConsultations(managerId);
    }
    async export(res, req, search = '', page = 1, startDate = new Date().toISOString().split('T')[0], endDate = new Date().toISOString().split('T')[0]) {
        const data = await this.smiaOstieService.toExport(search, req.session.user, startDate, endDate);
        await this.smiaOstieService.exportSmiaOstieToExcel(data, res, startDate, endDate);
    }
    async getMedicalService(req, search = '', page = 1, startDate = new Date().toISOString().split('T')[0], endDate = new Date().toISOString().split('T')[0]) {
        const limit = 20;
        const { data, total, totalPages } = await this.smiaOstieService.paginateMedicalService(search, Number(page), limit, req.session.user, startDate, endDate);
        const currentPage = Number(page);
        const maxButtons = 7;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        return {
            title: 'Medical Service',
            data,
            search,
            startDate,
            endDate,
            total,
            totalPages,
            startPage,
            endPage,
            currentPage,
            user: req.session.user,
        };
    }
    async getAddMedicalService(req) {
        return {
            title: 'Add Medical Service',
            user: req.session.user,
        };
    }
    async add(res, createSmiaOstieDto) {
        await this.smiaOstieService.create(createSmiaOstieDto);
        const message = "Employee consulation added successfully.";
        res.redirect('/smia-ostie/list?message=' + message);
    }
    create(createSmiaOstieDto) {
        return this.smiaOstieService.create(createSmiaOstieDto);
    }
    findAll() {
        return this.smiaOstieService.findAll();
    }
    findByDateDoingToday() {
        return this.smiaOstieService.findByDateDoingToday();
    }
    findByDate({ date }) {
        return this.smiaOstieService.findByDate(new Date(date));
    }
    findOne(id) {
        return this.smiaOstieService.findOne(id);
    }
    update(id, updateSmiaOstieDto) {
        return this.smiaOstieService.update(id, updateSmiaOstieDto);
    }
    remove(id) {
        return this.smiaOstieService.remove(id);
    }
    getWeeklyStats(site) {
        return this.smiaOstieService.countByDayForCurrentWeek(site);
    }
};
exports.SmiaOstieController = SmiaOstieController;
__decorate([
    (0, common_1.Get)('manager/:id/medical-services'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SmiaOstieController.prototype, "getManagerMedicalServices", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.HR_LEAD),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Number, String, String]),
    __metadata("design:returntype", Promise)
], SmiaOstieController.prototype, "export", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.HR_LEAD, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Render)('medical-service'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, String, String]),
    __metadata("design:returntype", Promise)
], SmiaOstieController.prototype, "getMedicalService", null);
__decorate([
    (0, common_1.Get)('add'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Render)('add-medical-service'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SmiaOstieController.prototype, "getAddMedicalService", null);
__decorate([
    (0, common_1.Post)('add'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_smia_ostie_dto_1.CreateSmiaOstieDto]),
    __metadata("design:returntype", Promise)
], SmiaOstieController.prototype, "add", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_smia_ostie_dto_1.CreateSmiaOstieDto]),
    __metadata("design:returntype", void 0)
], SmiaOstieController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SmiaOstieController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('list/today'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SmiaOstieController.prototype, "findByDateDoingToday", null);
__decorate([
    (0, common_1.Post)('list/by-date'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SmiaOstieController.prototype, "findByDate", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SmiaOstieController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_smia_ostie_dto_1.UpdateSmiaOstieDto]),
    __metadata("design:returntype", void 0)
], SmiaOstieController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SmiaOstieController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('stats/week'),
    __param(0, (0, common_1.Query)('site')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SmiaOstieController.prototype, "getWeeklyStats", null);
exports.SmiaOstieController = SmiaOstieController = __decorate([
    (0, common_1.Controller)('smia-ostie'),
    __metadata("design:paramtypes", [smia_ostie_service_1.SmiaOstieService])
], SmiaOstieController);
//# sourceMappingURL=smia_ostie.controller.js.map