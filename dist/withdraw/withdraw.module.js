"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawModule = void 0;
const common_1 = require("@nestjs/common");
const withdraw_service_1 = require("./withdraw.service");
const withdraw_controller_1 = require("./withdraw.controller");
const typeorm_1 = require("@nestjs/typeorm");
const withdraw_entity_1 = require("./entities/withdraw.entity");
const leave_service_1 = require("../leave/leave.service");
const leave_entity_1 = require("../leave/entities/leave.entity");
const employee_entity_1 = require("../employee/entities/employee.entity");
const employee_service_1 = require("../employee/employee.service");
const user_entity_1 = require("../user/entities/user.entity");
const user_service_1 = require("../user/user.service");
const permission2h_service_1 = require("../permission2h/permission2h.service");
const permission2h_entity_1 = require("../permission2h/entities/permission2h.entity");
const smia_ostie_entity_1 = require("../smia_ostie/entities/smia_ostie.entity");
const smia_ostie_service_1 = require("../smia_ostie/smia_ostie.service");
const history_service_1 = require("../history/history.service");
const history_entity_1 = require("../history/entities/history.entity");
const employee_history_entity_1 = require("../employee-history/entities/employee-history.entity");
const crypto_service_1 = require("../crypto/crypto.service");
const holiday_service_1 = require("../holiday/holiday.service");
const holiday_entity_1 = require("../holiday/entities/holiday.entity");
const jwt_1 = require("@nestjs/jwt");
const carried_forward_entity_1 = require("../carried-forward/entities/carried-forward.entity");
const carried_forward_service_1 = require("../carried-forward/carried-forward.service");
let WithdrawModule = class WithdrawModule {
};
exports.WithdrawModule = WithdrawModule;
exports.WithdrawModule = WithdrawModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                withdraw_entity_1.Withdraw,
                leave_entity_1.Leave,
                employee_entity_1.Employee,
                user_entity_1.User,
                permission2h_entity_1.Permission2h,
                smia_ostie_entity_1.SmiaOstie,
                history_entity_1.History,
                employee_history_entity_1.EmployeeHistory,
                holiday_entity_1.Holiday,
                carried_forward_entity_1.CarriedForward
            ]),
        ],
        controllers: [withdraw_controller_1.WithdrawController],
        providers: [
            withdraw_service_1.WithdrawService,
            leave_service_1.LeaveService,
            employee_service_1.EmployeeService,
            user_service_1.UserService,
            permission2h_service_1.Permission2hService,
            smia_ostie_service_1.SmiaOstieService,
            history_service_1.HistoryService,
            employee_service_1.EmployeeService,
            crypto_service_1.CryptoService,
            holiday_service_1.HolidayService,
            jwt_1.JwtService,
            carried_forward_service_1.CarriedForwardService
        ],
        exports: [
            withdraw_service_1.WithdrawService,
            leave_service_1.LeaveService,
            employee_service_1.EmployeeService,
            user_service_1.UserService,
            permission2h_service_1.Permission2hService,
            smia_ostie_service_1.SmiaOstieService,
            history_service_1.HistoryService,
            employee_service_1.EmployeeService,
            crypto_service_1.CryptoService,
            holiday_service_1.HolidayService,
            jwt_1.JwtService,
            carried_forward_service_1.CarriedForwardService
        ],
    })
], WithdrawModule);
//# sourceMappingURL=withdraw.module.js.map