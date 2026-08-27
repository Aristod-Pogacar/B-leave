"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const typeorm_1 = require("@nestjs/typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const leave_entity_1 = require("../leave/entities/leave.entity");
const leave_listener_1 = require("./listeners/leave.listener");
const notification_controller_1 = require("./notification.controller");
const user_entity_1 = require("../user/entities/user.entity");
const user_service_1 = require("../user/user.service");
const jwt_1 = require("@nestjs/jwt");
const employee_service_1 = require("../employee/employee.service");
const employee_entity_1 = require("../employee/entities/employee.entity");
const employee_history_entity_1 = require("../employee-history/entities/employee-history.entity");
const employee_history_service_1 = require("../employee-history/employee-history.service");
const crypto_service_1 = require("../crypto/crypto.service");
const holiday_service_1 = require("../holiday/holiday.service");
const history_service_1 = require("../history/history.service");
const holiday_entity_1 = require("../holiday/entities/holiday.entity");
const history_entity_1 = require("../history/entities/history.entity");
const permission2h_entity_1 = require("../permission2h/entities/permission2h.entity");
const permission2h_service_1 = require("../permission2h/permission2h.service");
const withdraw_service_1 = require("../withdraw/withdraw.service");
const withdraw_entity_1 = require("../withdraw/entities/withdraw.entity");
const leave_service_1 = require("../leave/leave.service");
const smia_ostie_entity_1 = require("../smia_ostie/entities/smia_ostie.entity");
const smia_ostie_service_1 = require("../smia_ostie/smia_ostie.service");
const carried_forward_service_1 = require("../carried-forward/carried-forward.service");
const carried_forward_entity_1 = require("../carried-forward/entities/carried-forward.entity");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                notification_entity_1.Notification,
                leave_entity_1.Leave,
                user_entity_1.User,
                employee_entity_1.Employee,
                holiday_entity_1.Holiday,
                history_entity_1.History,
                permission2h_entity_1.Permission2h,
                employee_history_entity_1.EmployeeHistory,
                withdraw_entity_1.Withdraw,
                smia_ostie_entity_1.SmiaOstie,
                carried_forward_entity_1.CarriedForward
            ]),
        ],
        controllers: [
            notification_controller_1.NotificationController,
        ],
        providers: [
            notification_service_1.NotificationService,
            user_service_1.UserService,
            leave_service_1.LeaveService,
            permission2h_service_1.Permission2hService,
            leave_listener_1.LeaveListener,
            jwt_1.JwtService,
            employee_service_1.EmployeeService,
            crypto_service_1.CryptoService,
            holiday_service_1.HolidayService,
            history_service_1.HistoryService,
            employee_history_service_1.EmployeeHistoryService,
            withdraw_service_1.WithdrawService,
            carried_forward_service_1.CarriedForwardService,
            smia_ostie_service_1.SmiaOstieService
        ],
        exports: [
            notification_service_1.NotificationService,
            user_service_1.UserService,
            leave_service_1.LeaveService,
            jwt_1.JwtService,
            employee_service_1.EmployeeService,
            crypto_service_1.CryptoService,
            holiday_service_1.HolidayService,
            history_service_1.HistoryService,
            employee_history_service_1.EmployeeHistoryService,
            withdraw_service_1.WithdrawService,
            carried_forward_service_1.CarriedForwardService,
            smia_ostie_service_1.SmiaOstieService
        ],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map