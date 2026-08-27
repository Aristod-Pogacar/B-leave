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
exports.ManagerAssignationController = void 0;
const common_1 = require("@nestjs/common");
const manager_assignation_service_1 = require("./manager_assignation.service");
const create_manager_assignation_dto_1 = require("./dto/create-manager_assignation.dto");
const update_manager_assignation_dto_1 = require("./dto/update-manager_assignation.dto");
let ManagerAssignationController = class ManagerAssignationController {
    managerAssignationService;
    constructor(managerAssignationService) {
        this.managerAssignationService = managerAssignationService;
    }
    create(createManagerAssignationDto) {
        return this.managerAssignationService.create(createManagerAssignationDto);
    }
    findAll() {
        return this.managerAssignationService.findAll();
    }
    findOne(id) {
        return this.managerAssignationService.findOne(+id);
    }
    update(id, updateManagerAssignationDto) {
        return this.managerAssignationService.update(+id, updateManagerAssignationDto);
    }
    remove(id) {
        return this.managerAssignationService.remove(+id);
    }
};
exports.ManagerAssignationController = ManagerAssignationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_manager_assignation_dto_1.CreateManagerAssignationDto]),
    __metadata("design:returntype", void 0)
], ManagerAssignationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ManagerAssignationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ManagerAssignationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_manager_assignation_dto_1.UpdateManagerAssignationDto]),
    __metadata("design:returntype", void 0)
], ManagerAssignationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ManagerAssignationController.prototype, "remove", null);
exports.ManagerAssignationController = ManagerAssignationController = __decorate([
    (0, common_1.Controller)('manager-assignation'),
    __metadata("design:paramtypes", [manager_assignation_service_1.ManagerAssignationService])
], ManagerAssignationController);
//# sourceMappingURL=manager_assignation.controller.js.map