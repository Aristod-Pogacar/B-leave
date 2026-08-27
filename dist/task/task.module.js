"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModule = void 0;
const common_1 = require("@nestjs/common");
const task_service_1 = require("./task.service");
const task_controller_1 = require("./task.controller");
const typeorm_1 = require("@nestjs/typeorm");
const task_entity_1 = require("./entities/task.entity");
const puppeteer_manager_service_1 = require("../puppeteer-manager/puppeteer-manager.service");
const puppeteer_service_1 = require("../puppeteer/puppeteer.service");
const employee_service_1 = require("../employee/employee.service");
const leave_service_1 = require("../leave/leave.service");
const crypto_service_1 = require("../crypto/crypto.service");
const task_scheduler_1 = require("./task.scheduler");
const employee_entity_1 = require("../employee/entities/employee.entity");
const leave_entity_1 = require("../leave/entities/leave.entity");
const user_service_1 = require("../user/user.service");
const user_entity_1 = require("../user/entities/user.entity");
const jwt_1 = require("@nestjs/jwt");
const schedule_1 = require("@nestjs/schedule");
const history_service_1 = require("../history/history.service");
const history_entity_1 = require("../history/entities/history.entity");
const permission2h_service_1 = require("../permission2h/permission2h.service");
const permission2h_entity_1 = require("../permission2h/entities/permission2h.entity");
const smia_ostie_entity_1 = require("../smia_ostie/entities/smia_ostie.entity");
const smia_ostie_service_1 = require("../smia_ostie/smia_ostie.service");
const employee_history_service_1 = require("../employee-history/employee-history.service");
const employee_history_entity_1 = require("../employee-history/entities/employee-history.entity");
const holiday_entity_1 = require("../holiday/entities/holiday.entity");
const holiday_service_1 = require("../holiday/holiday.service");
const carried_forward_entity_1 = require("../carried-forward/entities/carried-forward.entity");
const carried_forward_service_1 = require("../carried-forward/carried-forward.service");
let TaskModule = class TaskModule {
};
exports.TaskModule = TaskModule;
exports.TaskModule = TaskModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forFeature([task_entity_1.Task, employee_entity_1.Employee, leave_entity_1.Leave, user_entity_1.User, history_entity_1.History, permission2h_entity_1.Permission2h, smia_ostie_entity_1.SmiaOstie, employee_history_entity_1.EmployeeHistory, holiday_entity_1.Holiday, carried_forward_entity_1.CarriedForward])
        ],
        controllers: [task_controller_1.TaskController],
        providers: [
            task_service_1.TaskService,
            task_scheduler_1.TaskScheduler,
            puppeteer_manager_service_1.PuppeteerManagerService,
            puppeteer_service_1.PuppeteerService,
            employee_service_1.EmployeeService,
            leave_service_1.LeaveService,
            crypto_service_1.CryptoService,
            user_service_1.UserService,
            jwt_1.JwtService,
            history_service_1.HistoryService,
            permission2h_service_1.Permission2hService,
            smia_ostie_service_1.SmiaOstieService,
            employee_history_service_1.EmployeeHistoryService,
            holiday_service_1.HolidayService,
            carried_forward_service_1.CarriedForwardService
        ],
        exports: [
            task_service_1.TaskService,
            task_scheduler_1.TaskScheduler,
            puppeteer_service_1.PuppeteerService,
            crypto_service_1.CryptoService,
            employee_service_1.EmployeeService,
            leave_service_1.LeaveService,
            typeorm_1.TypeOrmModule,
            user_service_1.UserService,
            history_service_1.HistoryService,
            jwt_1.JwtService,
            permission2h_service_1.Permission2hService,
            smia_ostie_service_1.SmiaOstieService,
            employee_history_service_1.EmployeeHistoryService,
            holiday_service_1.HolidayService,
            carried_forward_service_1.CarriedForwardService
        ],
    })
], TaskModule);
//# sourceMappingURL=task.module.js.map