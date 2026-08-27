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
exports.MedicalServiceController = void 0;
const common_1 = require("@nestjs/common");
const medical_service_service_1 = require("./medical_service.service");
const create_medical_service_dto_1 = require("./dto/create-medical_service.dto");
const update_medical_service_dto_1 = require("./dto/update-medical_service.dto");
const role_decorator_1 = require("../user/role.decorator");
const role_guard_1 = require("../user/role.guard");
const user_entity_1 = require("../user/entities/user.entity");
const history_entity_1 = require("../history/entities/history.entity");
const history_service_1 = require("../history/history.service");
let MedicalServiceController = class MedicalServiceController {
    medicalServiceService;
    historyService;
    constructor(medicalServiceService, historyService) {
        this.medicalServiceService = medicalServiceService;
        this.historyService = historyService;
    }
    async getMedicalService(req, search = '', page = 1) {
        const limit = 20;
        const { data, total, totalPages } = await this.medicalServiceService.paginateMedicalService(search, Number(page), limit);
        const currentPage = Number(page);
        const maxButtons = 7;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        return {
            title: 'Medical Service Setting',
            data,
            search,
            total,
            totalPages,
            startPage,
            endPage,
            currentPage
        };
    }
    async getNewMedicalService(req) {
        return {
            title: 'New Medical Service',
            user: req.session.user,
        };
    }
    async postNewMedicalService(req, body, res) {
        if (body.name == "") {
            return res.render('new-medical-service', {
                title: 'New Medical Service',
                user: req.session.user,
                error: 'Name is required',
            });
        }
        const existingMedicalService = await this.medicalServiceService.findOneByName(body.name);
        if (existingMedicalService) {
            return res.render('new-medical-service', {
                title: 'New Medical Service',
                user: req.session.user,
                error: 'Medical service already exists',
            });
        }
        await this.medicalServiceService.create({ name: body.name });
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.MEDICAL_SERVICE,
            message: "New medical service " + body.name + " by " + req.session.user.firstName + " " + req.session.user.name,
            created_by: req.session.user.matricule,
        });
        return res.redirect('/medical-service/list');
    }
    async getEditMedicalService(req, id) {
        const medicalService = await this.medicalServiceService.findOne(id);
        return {
            title: 'Edit Medical Service',
            user: req.session.user,
            data: medicalService,
        };
    }
    async postEditMedicalService(req, id, body, res) {
        if (body.name == "") {
            return res.render('edit-medical-service', {
                title: 'Edit Medical Service',
                user: req.session.user,
                error: 'Name is required',
            });
        }
        const existingMedicalService = await this.medicalServiceService.findOneByName(body.name);
        if (existingMedicalService) {
            return res.render('new-medical-service', {
                title: 'New Medical Service',
                user: req.session.user,
                error: 'Medical service already exists',
            });
        }
        await this.medicalServiceService.update(id, { name: body.name });
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.MEDICAL_SERVICE,
            message: "Medical service " + body.name + " updated by " + req.session.user.firstName + " " + req.session.user.name,
            created_by: req.session.user.matricule,
        });
        return res.redirect('/medical-service/list');
    }
    async deleteMedicalService(req, id, res) {
        const medicalService = await this.medicalServiceService.findOne(id);
        if (!medicalService) {
            return res.redirect('/medical-service/list');
        }
        await this.medicalServiceService.remove(id);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.MEDICAL_SERVICE,
            message: "Medical service " + medicalService.name + " deleted by " + req.session.user.firstName + " " + req.session.user.name,
            created_by: req.session.user.matricule,
        });
        return res.redirect('/medical-service/list');
    }
    create(createMedicalServiceDto) {
        return this.medicalServiceService.create(createMedicalServiceDto);
    }
    findAll() {
        return this.medicalServiceService.findAll();
    }
    findOne(id) {
        return this.medicalServiceService.findOne(id);
    }
    update(id, updateMedicalServiceDto) {
        return this.medicalServiceService.update(id, updateMedicalServiceDto);
    }
    remove(id) {
        return this.medicalServiceService.remove(id);
    }
};
exports.MedicalServiceController = MedicalServiceController;
__decorate([
    (0, common_1.Get)('list'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Render)('medical-service-setting'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "getMedicalService", null);
__decorate([
    (0, common_1.Get)('new-medical-service'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Render)('new-medical-service'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "getNewMedicalService", null);
__decorate([
    (0, common_1.Post)('new-medical-service'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PAYROLL),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_medical_service_dto_1.CreateMedicalServiceDto, Object]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "postNewMedicalService", null);
__decorate([
    (0, common_1.Get)('edit-medical-service/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Render)('edit-medical-service'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "getEditMedicalService", null);
__decorate([
    (0, common_1.Post)('edit-medical-service/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_medical_service_dto_1.UpdateMedicalServiceDto, Object]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "postEditMedicalService", null);
__decorate([
    (0, common_1.Post)("delete-medical-service/:id"),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "deleteMedicalService", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_medical_service_dto_1.CreateMedicalServiceDto]),
    __metadata("design:returntype", void 0)
], MedicalServiceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MedicalServiceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MedicalServiceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_medical_service_dto_1.UpdateMedicalServiceDto]),
    __metadata("design:returntype", void 0)
], MedicalServiceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MedicalServiceController.prototype, "remove", null);
exports.MedicalServiceController = MedicalServiceController = __decorate([
    (0, common_1.Controller)('medical-service'),
    __metadata("design:paramtypes", [medical_service_service_1.MedicalServiceService, history_service_1.HistoryService])
], MedicalServiceController);
//# sourceMappingURL=medical_service.controller.js.map