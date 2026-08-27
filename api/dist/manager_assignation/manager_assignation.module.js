"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerAssignationModule = void 0;
const common_1 = require("@nestjs/common");
const manager_assignation_service_1 = require("./manager_assignation.service");
const manager_assignation_controller_1 = require("./manager_assignation.controller");
const typeorm_1 = require("@nestjs/typeorm");
const manager_assignation_entity_1 = require("./entities/manager_assignation.entity");
const employee_entity_1 = require("../employee/entities/employee.entity");
const user_entity_1 = require("../user/entities/user.entity");
let ManagerAssignationModule = class ManagerAssignationModule {
};
exports.ManagerAssignationModule = ManagerAssignationModule;
exports.ManagerAssignationModule = ManagerAssignationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([manager_assignation_entity_1.ManagerAssignation, employee_entity_1.Employee, user_entity_1.User])],
        controllers: [manager_assignation_controller_1.ManagerAssignationController],
        providers: [manager_assignation_service_1.ManagerAssignationService],
    })
], ManagerAssignationModule);
//# sourceMappingURL=manager_assignation.module.js.map