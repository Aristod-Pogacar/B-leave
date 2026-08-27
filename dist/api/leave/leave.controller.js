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
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const leave_service_1 = require("../leave/leave.service");
const create_leave_dto_1 = require("../leave/dto/create-leave.dto");
const update_leave_dto_1 = require("../leave/dto/update-leave.dto");
const history_service_1 = require("../../history/history.service");
const history_entity_1 = require("../../history/entities/history.entity");
let LeaveController = class LeaveController {
    leaveService;
    historyService;
    constructor(leaveService, historyService) {
        this.leaveService = leaveService;
        this.historyService = historyService;
    }
    async create(createLeaveDto, res) {
        const leave = await this.leaveService.create(createLeaveDto, res);
        if (leave?.status == 200 && leave?.body?.id) {
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.LEAVE,
                message: "New leave send by API for employee " + leave.body.employee.matricule,
                created_by: leave.body.employee.matricule,
            });
        }
        return leave;
    }
    async findAllHistory(matricule) {
        const leaves = await this.leaveService.findAllHistory(matricule);
        return leaves;
    }
    findAll() {
        return this.leaveService.findAll();
    }
    findOne(id) {
        return this.leaveService.findOne(+id);
    }
    update(id, updateLeaveDto) {
        return this.leaveService.update(+id, updateLeaveDto);
    }
    remove(id) {
        return this.leaveService.remove(+id);
    }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leave_dto_1.CreateLeaveDto, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('history/:matricule'),
    __param(0, (0, common_1.Param)('matricule')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "findAllHistory", null);
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
    (0, common_1.Controller)('api/leave'),
    __metadata("design:paramtypes", [leave_service_1.LeaveService,
        history_service_1.HistoryService])
], LeaveController);
//# sourceMappingURL=leave.controller.js.map