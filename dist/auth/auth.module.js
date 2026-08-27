"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const user_service_1 = require("../user/user.service");
const mail_service_1 = require("../mail/mail.service");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../user/entities/user.entity");
const employee_entity_1 = require("../employee/entities/employee.entity");
const employee_service_1 = require("../employee/employee.service");
const employee_history_entity_1 = require("../employee-history/entities/employee-history.entity");
const employee_history_service_1 = require("../employee-history/employee-history.service");
const crypto_service_1 = require("../crypto/crypto.service");
const holiday_service_1 = require("../holiday/holiday.service");
const holiday_entity_1 = require("../holiday/entities/holiday.entity");
const history_service_1 = require("../history/history.service");
const history_entity_1 = require("../history/entities/history.entity");
const leave_entity_1 = require("../leave/entities/leave.entity");
const carried_forward_entity_1 = require("../carried-forward/entities/carried-forward.entity");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, employee_entity_1.Employee, employee_history_entity_1.EmployeeHistory, holiday_entity_1.Holiday, history_entity_1.History, leave_entity_1.Leave, carried_forward_entity_1.CarriedForward])],
        providers: [auth_service_1.AuthService, user_service_1.UserService, mail_service_1.MailService, jwt_1.JwtService, employee_service_1.EmployeeService, employee_history_service_1.EmployeeHistoryService, crypto_service_1.CryptoService, holiday_service_1.HolidayService, history_service_1.HistoryService],
        exports: [auth_service_1.AuthService, user_service_1.UserService, mail_service_1.MailService, jwt_1.JwtService, typeorm_1.TypeOrmModule, employee_service_1.EmployeeService, employee_history_service_1.EmployeeHistoryService, crypto_service_1.CryptoService, holiday_service_1.HolidayService, history_service_1.HistoryService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map