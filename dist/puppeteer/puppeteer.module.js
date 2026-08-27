"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppeteerModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const employee_entity_1 = require("../employee/entities/employee.entity");
const leave_entity_1 = require("../leave/entities/leave.entity");
const puppeteer_controller_1 = require("./puppeteer.controller");
const puppeteer_service_1 = require("./puppeteer.service");
const puppeteer_manager_service_1 = require("../puppeteer-manager/puppeteer-manager.service");
const employee_service_1 = require("../employee/employee.service");
const leave_service_1 = require("../leave/leave.service");
const crypto_service_1 = require("../crypto/crypto.service");
const user_entity_1 = require("../user/entities/user.entity");
const history_entity_1 = require("../history/entities/history.entity");
const history_service_1 = require("../history/history.service");
const permission2h_service_1 = require("../permission2h/permission2h.service");
const smia_ostie_service_1 = require("../smia_ostie/smia_ostie.service");
const permission2h_entity_1 = require("../permission2h/entities/permission2h.entity");
const smia_ostie_entity_1 = require("../smia_ostie/entities/smia_ostie.entity");
const user_service_1 = require("../user/user.service");
const jwt_1 = require("@nestjs/jwt");
const employee_history_service_1 = require("../employee-history/employee-history.service");
const employee_history_entity_1 = require("../employee-history/entities/employee-history.entity");
const holiday_entity_1 = require("../holiday/entities/holiday.entity");
const holiday_service_1 = require("../holiday/holiday.service");
const carried_forward_service_1 = require("../carried-forward/carried-forward.service");
const carried_forward_entity_1 = require("../carried-forward/entities/carried-forward.entity");
let PuppeteerModule = class PuppeteerModule {
};
exports.PuppeteerModule = PuppeteerModule;
exports.PuppeteerModule = PuppeteerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forFeature([employee_entity_1.Employee, leave_entity_1.Leave, user_entity_1.User, history_entity_1.History, permission2h_entity_1.Permission2h, smia_ostie_entity_1.SmiaOstie, user_entity_1.User, leave_entity_1.Leave, employee_history_entity_1.EmployeeHistory, holiday_entity_1.Holiday, carried_forward_entity_1.CarriedForward]),
        ],
        controllers: [puppeteer_controller_1.PuppeteerController],
        providers: [
            puppeteer_service_1.PuppeteerService,
            puppeteer_manager_service_1.PuppeteerManagerService,
            employee_service_1.EmployeeService,
            leave_service_1.LeaveService,
            crypto_service_1.CryptoService,
            history_service_1.HistoryService,
            permission2h_service_1.Permission2hService,
            smia_ostie_service_1.SmiaOstieService,
            user_service_1.UserService,
            jwt_1.JwtService,
            user_service_1.UserService,
            employee_history_service_1.EmployeeHistoryService,
            holiday_service_1.HolidayService,
            carried_forward_service_1.CarriedForwardService
        ],
        exports: [
            puppeteer_service_1.PuppeteerService,
            crypto_service_1.CryptoService,
            employee_service_1.EmployeeService,
            leave_service_1.LeaveService,
            typeorm_1.TypeOrmModule,
            history_service_1.HistoryService,
            permission2h_service_1.Permission2hService,
            smia_ostie_service_1.SmiaOstieService,
            user_service_1.UserService,
            jwt_1.JwtService,
            user_service_1.UserService,
            employee_history_service_1.EmployeeHistoryService,
            holiday_service_1.HolidayService,
            carried_forward_service_1.CarriedForwardService
        ],
    })
], PuppeteerModule);
//# sourceMappingURL=puppeteer.module.js.map