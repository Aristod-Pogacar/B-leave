"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeHistoryModule = void 0;
const common_1 = require("@nestjs/common");
const employee_history_service_1 = require("./employee-history.service");
const employee_history_controller_1 = require("./employee-history.controller");
const typeorm_1 = require("@nestjs/typeorm");
const employee_history_entity_1 = require("./entities/employee-history.entity");
const employee_entity_1 = require("../employee/entities/employee.entity");
const employee_service_1 = require("../employee/employee.service");
const leave_entity_1 = require("../leave/entities/leave.entity");
const manager_assignation_entity_1 = require("../manager_assignation/entities/manager_assignation.entity");
const user_entity_1 = require("../user/entities/user.entity");
const history_entity_1 = require("../history/entities/history.entity");
const permission2h_entity_1 = require("../permission2h/entities/permission2h.entity");
const smia_ostie_entity_1 = require("../smia_ostie/entities/smia_ostie.entity");
const history_service_1 = require("../history/history.service");
const crypto_service_1 = require("../crypto/crypto.service");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const holiday_entity_1 = require("../holiday/entities/holiday.entity");
const holiday_service_1 = require("../holiday/holiday.service");
const carried_forward_entity_1 = require("../carried-forward/entities/carried-forward.entity");
const carried_forward_service_1 = require("../carried-forward/carried-forward.service");
let EmployeeHistoryModule = class EmployeeHistoryModule {
};
exports.EmployeeHistoryModule = EmployeeHistoryModule;
exports.EmployeeHistoryModule = EmployeeHistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([leave_entity_1.Leave, employee_entity_1.Employee, manager_assignation_entity_1.ManagerAssignation, user_entity_1.User, history_entity_1.History, permission2h_entity_1.Permission2h, smia_ostie_entity_1.SmiaOstie, employee_history_entity_1.EmployeeHistory, holiday_entity_1.Holiday, carried_forward_entity_1.CarriedForward])],
        controllers: [employee_history_controller_1.EmployeeHistoryController],
        providers: [employee_history_service_1.EmployeeHistoryService, employee_service_1.EmployeeService, history_service_1.HistoryService, crypto_service_1.CryptoService, jwt_1.JwtService, user_service_1.UserService, holiday_service_1.HolidayService, carried_forward_service_1.CarriedForwardService],
        exports: [
            employee_history_service_1.EmployeeHistoryService,
            typeorm_1.TypeOrmModule,
            employee_service_1.EmployeeService,
            history_service_1.HistoryService,
            crypto_service_1.CryptoService,
            jwt_1.JwtService,
            user_service_1.UserService,
            holiday_service_1.HolidayService,
            carried_forward_service_1.CarriedForwardService
        ],
    })
], EmployeeHistoryModule);
//# sourceMappingURL=employee-history.module.js.map