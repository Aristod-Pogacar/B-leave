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
exports.HolidayController = void 0;
const common_1 = require("@nestjs/common");
const holiday_service_1 = require("./holiday.service");
const create_holiday_dto_1 = require("./dto/create-holiday.dto");
const update_holiday_dto_1 = require("./dto/update-holiday.dto");
const role_guard_1 = require("../user/role.guard");
const role_decorator_1 = require("../user/role.decorator");
const user_entity_1 = require("../user/entities/user.entity");
const history_service_1 = require("../history/history.service");
const history_entity_1 = require("../history/entities/history.entity");
let HolidayController = class HolidayController {
    holidayService;
    historyService;
    constructor(holidayService, historyService) {
        this.holidayService = holidayService;
        this.historyService = historyService;
    }
    async getByDate(start_date, end_date) {
        const date1 = new Date(start_date);
        const date2 = new Date(end_date);
        if (date1 > date2) {
            return [];
        }
        const holidays = await this.holidayService.findByDateRange(start_date, end_date);
        return holidays;
    }
    async getHolidays(req, res, year) {
        var y;
        if (!year) {
            y = new Date().getFullYear();
        }
        else {
            y = new Date(year).getFullYear();
        }
        const holidays = await this.holidayService.findAllByYear(y);
        const thisyear = new Date().getFullYear() + 1;
        var length = thisyear - 2026 + 1;
        if (length > 11) {
            length = 11;
        }
        const years = Array.from({ length }, (_, i) => thisyear - i);
        return {
            title: "Holidays",
            holidays,
            user: req.session.user,
            years,
            currentYear: y
        };
    }
    async postEditHolidays(req, createHolidayDto, res, id) {
        const old_holiday = await this.holidayService.findOne(id);
        const holiday = await this.holidayService.update(id, createHolidayDto);
        const holiday_details = await this.holidayService.findOne(id);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.HOLIDAY,
            message: "Holiday " + old_holiday?.name + " of " + old_holiday?.date + " updated to " + holiday_details?.name + " of " + holiday_details?.date + " by " + req.session.user.employee.matricule,
            created_by: req.session.user.employee.matricule,
        });
        if (holiday) {
            return res.redirect('/holiday/holidays?message=Holiday updated successfully!');
        }
        return res.redirect('/holiday/holidays?error=Failed to update holiday!');
    }
    async getDeleteHolidays(req, res, id) {
        const holiday = await this.holidayService.findOne(id);
        return {
            title: "Delete holiday",
            holiday,
            user: req.session.user,
        };
    }
    async postDeleteHolidays(req, res, id) {
        const old_holiday = await this.holidayService.findOne(id);
        const holiday = await this.holidayService.remove(id);
        if (holiday) {
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.HOLIDAY,
                message: "Holiday " + old_holiday?.name + " of " + old_holiday?.date + " deleted by " + req.session.user.employee.matricule,
                created_by: req.session.user.employee.matricule,
            });
            return res.redirect('/holiday/holidays?message=Holiday deleted successfully!');
        }
        return res.redirect('/holiday/holidays?error=Failed to delete holiday!');
    }
    async postNewHolidays(req, createHolidayDto, res) {
        const holiday = await this.holidayService.create(createHolidayDto);
        if (holiday) {
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.HOLIDAY,
                message: "Holiday " + createHolidayDto?.name + " of " + createHolidayDto?.date + " created by " + req.session.user.employee.matricule,
                created_by: req.session.user.employee.matricule,
            });
            return res.redirect('/holiday/holidays?message=Holiday created successfully!');
        }
        return res.redirect('/holiday/holidays?error=Failed to create holiday!');
    }
    async getEditHolidays(req, res, id) {
        const holiday = await this.holidayService.findOne(id);
        const thisyear = new Date().getFullYear();
        var length = thisyear - 2026 + 1;
        if (length > 10) {
            length = 10;
        }
        return {
            title: "Edit holiday",
            holiday,
            user: req.session.user,
        };
    }
    async getNewHolidays(req, res) {
        const thisyear = new Date().getFullYear();
        var length = thisyear - 2026 + 1;
        if (length > 10) {
            length = 10;
        }
        const years = Array.from({ length }, (_, i) => thisyear - i);
        return {
            title: "New holidays",
            user: req.session.user,
            years
        };
    }
    create(createHolidayDto) {
        return this.holidayService.create(createHolidayDto);
    }
    findAll() {
        return this.holidayService.findAll();
    }
    findOne(id) {
        return this.holidayService.findOne(id);
    }
    update(id, updateHolidayDto) {
        return this.holidayService.update(id, updateHolidayDto);
    }
    remove(id) {
        return this.holidayService.remove(id);
    }
};
exports.HolidayController = HolidayController;
__decorate([
    (0, common_1.Get)('by-date/:start_date/:end_date'),
    __param(0, (0, common_1.Param)('start_date')),
    __param(1, (0, common_1.Param)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HolidayController.prototype, "getByDate", null);
__decorate([
    (0, common_1.Get)('holidays'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Render)('holidays'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], HolidayController.prototype, "getHolidays", null);
__decorate([
    (0, common_1.Post)('edit-holiday/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_holiday_dto_1.CreateHolidayDto, Object, String]),
    __metadata("design:returntype", Promise)
], HolidayController.prototype, "postEditHolidays", null);
__decorate([
    (0, common_1.Get)('delete-holiday/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Render)('confirm-delete-holiday'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], HolidayController.prototype, "getDeleteHolidays", null);
__decorate([
    (0, common_1.Post)('delete-holiday/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], HolidayController.prototype, "postDeleteHolidays", null);
__decorate([
    (0, common_1.Post)('new-holiday'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_holiday_dto_1.CreateHolidayDto, Object]),
    __metadata("design:returntype", Promise)
], HolidayController.prototype, "postNewHolidays", null);
__decorate([
    (0, common_1.Get)('edit-holiday/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Render)('edit-holiday'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], HolidayController.prototype, "getEditHolidays", null);
__decorate([
    (0, common_1.Get)('new-holiday'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Render)('new-holiday'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HolidayController.prototype, "getNewHolidays", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_holiday_dto_1.CreateHolidayDto]),
    __metadata("design:returntype", void 0)
], HolidayController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HolidayController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HolidayController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_holiday_dto_1.UpdateHolidayDto]),
    __metadata("design:returntype", void 0)
], HolidayController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HolidayController.prototype, "remove", null);
exports.HolidayController = HolidayController = __decorate([
    (0, common_1.Controller)('holiday'),
    __metadata("design:paramtypes", [holiday_service_1.HolidayService,
        history_service_1.HistoryService])
], HolidayController);
//# sourceMappingURL=holiday.controller.js.map