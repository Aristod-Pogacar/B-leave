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
exports.EmployeeHistoryController = void 0;
const common_1 = require("@nestjs/common");
const employee_history_service_1 = require("./employee-history.service");
const create_employee_history_dto_1 = require("./dto/create-employee-history.dto");
const update_employee_history_dto_1 = require("./dto/update-employee-history.dto");
const role_guard_1 = require("../user/role.guard");
const role_decorator_1 = require("../user/role.decorator");
const user_entity_1 = require("../user/entities/user.entity");
let EmployeeHistoryController = class EmployeeHistoryController {
    employeeHistoryService;
    constructor(employeeHistoryService) {
        this.employeeHistoryService = employeeHistoryService;
    }
    async getEmployeeHistory(req, employeeId, res) {
        const data = await this.employeeHistoryService.employeeHistory(employeeId);
        return {
            title: "History | " + data[0].employee.name + " " + data[0].employee.firstname,
            data,
            user: req.session.user
        };
    }
    async getrehire(req, id, res) {
        const data = await this.employeeHistoryService.findOne(id);
        return {
            title: "Rehire",
            data,
            user: req.session.user
        };
    }
    async rehire(req, id, res, body) {
        const data = await this.employeeHistoryService.rehire(id, body);
        return res.redirect('/employee-history/archives');
    }
    async archives(req, search = '', page = 1) {
        const limit = 20;
        const { data, total, totalPages } = await this.employeeHistoryService.paginateArchives(search, Number(page), limit, req.session.user);
        const currentPage = Number(page);
        const maxButtons = 7;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        return {
            title: "Archives",
            data,
            search,
            startPage,
            endPage,
            totalPages,
            total,
            currentPage,
            user: req.session.user
        };
    }
    create(createEmployeeHistoryDto) {
        return this.employeeHistoryService.create(createEmployeeHistoryDto);
    }
    findAll() {
        return this.employeeHistoryService.findAll();
    }
    findOne(id) {
        return this.employeeHistoryService.findOne(id);
    }
    update(id, updateEmployeeHistoryDto) {
        return this.employeeHistoryService.update(id, updateEmployeeHistoryDto);
    }
    remove(id) {
        return this.employeeHistoryService.remove(id);
    }
};
exports.EmployeeHistoryController = EmployeeHistoryController;
__decorate([
    (0, common_1.Get)('get-employee-history/:employeeId'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Render)('history'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('employeeId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeHistoryController.prototype, "getEmployeeHistory", null);
__decorate([
    (0, common_1.Get)('rehire/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Render)('rehire'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeHistoryController.prototype, "getrehire", null);
__decorate([
    (0, common_1.Post)('rehire/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.HR_LEAD),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeHistoryController.prototype, "rehire", null);
__decorate([
    (0, common_1.Get)('archives'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Render)('archive'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], EmployeeHistoryController.prototype, "archives", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_employee_history_dto_1.CreateEmployeeHistoryDto]),
    __metadata("design:returntype", void 0)
], EmployeeHistoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmployeeHistoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeHistoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_employee_history_dto_1.UpdateEmployeeHistoryDto]),
    __metadata("design:returntype", void 0)
], EmployeeHistoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeHistoryController.prototype, "remove", null);
exports.EmployeeHistoryController = EmployeeHistoryController = __decorate([
    (0, common_1.Controller)('employee-history'),
    __metadata("design:paramtypes", [employee_history_service_1.EmployeeHistoryService])
], EmployeeHistoryController);
//# sourceMappingURL=employee-history.controller.js.map