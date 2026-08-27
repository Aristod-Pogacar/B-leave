"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiLeaveModule = void 0;
const common_1 = require("@nestjs/common");
const leave_service_1 = require("./leave.service");
const leave_controller_1 = require("./leave.controller");
const typeorm_1 = require("@nestjs/typeorm");
const leave_entity_1 = require("../../leave/entities/leave.entity");
const employee_entity_1 = require("../../employee/entities/employee.entity");
const crypto_service_1 = require("../../crypto/crypto.service");
const config_1 = require("@nestjs/config");
const mailer_1 = require("@nestjs-modules/mailer");
const history_entity_1 = require("../../history/entities/history.entity");
const history_service_1 = require("../../history/history.service");
const employee_service_1 = require("../../employee/employee.service");
const user_service_1 = require("../../user/user.service");
const user_entity_1 = require("../../user/entities/user.entity");
const jwt_1 = require("@nestjs/jwt");
const employee_history_entity_1 = require("../../employee-history/entities/employee-history.entity");
const employee_history_service_1 = require("../../employee-history/employee-history.service");
const holiday_entity_1 = require("../../holiday/entities/holiday.entity");
const holiday_service_1 = require("../../holiday/holiday.service");
const carried_forward_entity_1 = require("../../carried-forward/entities/carried-forward.entity");
let ApiLeaveModule = class ApiLeaveModule {
};
exports.ApiLeaveModule = ApiLeaveModule;
exports.ApiLeaveModule = ApiLeaveModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    transport: {
                        host: "smtp.office365.com",
                        port: 587,
                        secure: false,
                        auth: {
                            user: configService.get('EMAIL_ADRESS'),
                            pass: configService.get('EMAIL_PASSWORD'),
                        },
                    },
                    defaults: {
                        from: `"No Reply" <${configService.get('EMAIL_ADRESS')}>`,
                    },
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([leave_entity_1.Leave, employee_entity_1.Employee, history_entity_1.History, user_entity_1.User, employee_history_entity_1.EmployeeHistory, holiday_entity_1.Holiday, carried_forward_entity_1.CarriedForward])
        ],
        controllers: [leave_controller_1.LeaveController],
        providers: [leave_service_1.LeaveService, crypto_service_1.CryptoService, history_service_1.HistoryService, employee_service_1.EmployeeService, user_service_1.UserService, jwt_1.JwtService, employee_history_service_1.EmployeeHistoryService, holiday_service_1.HolidayService],
        exports: [leave_service_1.LeaveService, typeorm_1.TypeOrmModule, crypto_service_1.CryptoService, history_service_1.HistoryService, employee_service_1.EmployeeService, user_service_1.UserService, jwt_1.JwtService, employee_history_service_1.EmployeeHistoryService, holiday_service_1.HolidayService],
    })
], ApiLeaveModule);
//# sourceMappingURL=leave.module.js.map