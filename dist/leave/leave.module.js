"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveModule = void 0;
const common_1 = require("@nestjs/common");
const leave_service_1 = require("./leave.service");
const leave_controller_1 = require("./leave.controller");
const leave_entity_1 = require("./entities/leave.entity");
const typeorm_1 = require("@nestjs/typeorm");
const employee_entity_1 = require("../employee/entities/employee.entity");
const employee_service_1 = require("../employee/employee.service");
const crypto_service_1 = require("../crypto/crypto.service");
const manager_assignation_entity_1 = require("../manager_assignation/entities/manager_assignation.entity");
const user_entity_1 = require("../user/entities/user.entity");
const config_1 = require("@nestjs/config");
const mailer_1 = require("@nestjs-modules/mailer");
const history_service_1 = require("../history/history.service");
const history_entity_1 = require("../history/entities/history.entity");
const task_entity_1 = require("../task/entities/task.entity");
const task_service_1 = require("../task/task.service");
const puppeteer_manager_service_1 = require("../puppeteer-manager/puppeteer-manager.service");
const puppeteer_service_1 = require("../puppeteer/puppeteer.service");
const smia_ostie_service_1 = require("../smia_ostie/smia_ostie.service");
const smia_ostie_entity_1 = require("../smia_ostie/entities/smia_ostie.entity");
const permission2h_service_1 = require("../permission2h/permission2h.service");
const permission2h_entity_1 = require("../permission2h/entities/permission2h.entity");
const user_service_1 = require("../user/user.service");
const jwt_1 = require("@nestjs/jwt");
const employee_history_service_1 = require("../employee-history/employee-history.service");
const employee_history_entity_1 = require("../employee-history/entities/employee-history.entity");
const holiday_entity_1 = require("../holiday/entities/holiday.entity");
const holiday_service_1 = require("../holiday/holiday.service");
const withdraw_entity_1 = require("../withdraw/entities/withdraw.entity");
const withdraw_service_1 = require("../withdraw/withdraw.service");
const carried_forward_service_1 = require("../carried-forward/carried-forward.service");
const carried_forward_entity_1 = require("../carried-forward/entities/carried-forward.entity");
let LeaveModule = class LeaveModule {
};
exports.LeaveModule = LeaveModule;
exports.LeaveModule = LeaveModule = __decorate([
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
            typeorm_1.TypeOrmModule.forFeature([leave_entity_1.Leave, employee_entity_1.Employee, manager_assignation_entity_1.ManagerAssignation, user_entity_1.User, history_entity_1.History, task_entity_1.Task, smia_ostie_entity_1.SmiaOstie, permission2h_entity_1.Permission2h, employee_history_entity_1.EmployeeHistory, holiday_entity_1.Holiday, withdraw_entity_1.Withdraw, carried_forward_entity_1.CarriedForward]),
        ],
        controllers: [leave_controller_1.LeaveController],
        providers: [leave_service_1.LeaveService, employee_service_1.EmployeeService, crypto_service_1.CryptoService, history_service_1.HistoryService, task_service_1.TaskService, puppeteer_manager_service_1.PuppeteerManagerService, puppeteer_service_1.PuppeteerService, smia_ostie_service_1.SmiaOstieService, permission2h_service_1.Permission2hService, user_service_1.UserService, jwt_1.JwtService, employee_history_service_1.EmployeeHistoryService, holiday_service_1.HolidayService, withdraw_service_1.WithdrawService, carried_forward_service_1.CarriedForwardService],
        exports: [leave_service_1.LeaveService, typeorm_1.TypeOrmModule, crypto_service_1.CryptoService, history_service_1.HistoryService, task_service_1.TaskService, puppeteer_manager_service_1.PuppeteerManagerService, puppeteer_service_1.PuppeteerService, smia_ostie_service_1.SmiaOstieService, permission2h_service_1.Permission2hService, user_service_1.UserService, jwt_1.JwtService, employee_history_service_1.EmployeeHistoryService, holiday_service_1.HolidayService, withdraw_service_1.WithdrawService, carried_forward_service_1.CarriedForwardService],
    })
], LeaveModule);
//# sourceMappingURL=leave.module.js.map