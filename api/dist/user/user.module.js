"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const user_controller_1 = require("./user.controller");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const auth_service_1 = require("../auth/auth.service");
const mail_service_1 = require("../mail/mail.service");
const jwt_1 = require("@nestjs/jwt");
const employee_entity_1 = require("../employee/entities/employee.entity");
const leave_entity_1 = require("../leave/entities/leave.entity");
const history_entity_1 = require("../history/entities/history.entity");
const history_service_1 = require("../history/history.service");
const employee_service_1 = require("../employee/employee.service");
const employee_history_entity_1 = require("../employee-history/entities/employee-history.entity");
const employee_history_service_1 = require("../employee-history/employee-history.service");
const crypto_service_1 = require("../crypto/crypto.service");
const holiday_service_1 = require("../holiday/holiday.service");
const holiday_entity_1 = require("../holiday/entities/holiday.entity");
const carried_forward_entity_1 = require("../carried-forward/entities/carried-forward.entity");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, employee_entity_1.Employee, leave_entity_1.Leave, history_entity_1.History, employee_history_entity_1.EmployeeHistory, holiday_entity_1.Holiday, carried_forward_entity_1.CarriedForward])],
        controllers: [user_controller_1.UserController],
        providers: [user_service_1.UserService, auth_service_1.AuthService, mail_service_1.MailService, jwt_1.JwtService, history_service_1.HistoryService, employee_service_1.EmployeeService, employee_history_service_1.EmployeeHistoryService, crypto_service_1.CryptoService, holiday_service_1.HolidayService],
        exports: [user_service_1.UserService, auth_service_1.AuthService, mail_service_1.MailService, jwt_1.JwtService, typeorm_1.TypeOrmModule, history_service_1.HistoryService, employee_service_1.EmployeeService, employee_history_service_1.EmployeeHistoryService, crypto_service_1.CryptoService, holiday_service_1.HolidayService],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map