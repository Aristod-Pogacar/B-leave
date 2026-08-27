"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission2hModule = void 0;
const common_1 = require("@nestjs/common");
const permission2h_service_1 = require("./permission2h.service");
const permission2h_controller_1 = require("./permission2h.controller");
const typeorm_1 = require("@nestjs/typeorm");
const permission2h_entity_1 = require("./entities/permission2h.entity");
const employee_entity_1 = require("../employee/entities/employee.entity");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../user/entities/user.entity");
const user_service_1 = require("../user/user.service");
const jwt_1 = require("@nestjs/jwt");
const mailer_1 = require("@nestjs-modules/mailer");
const history_entity_1 = require("../history/entities/history.entity");
const history_service_1 = require("../history/history.service");
const employee_service_1 = require("../employee/employee.service");
const employee_history_service_1 = require("../employee-history/employee-history.service");
const crypto_service_1 = require("../crypto/crypto.service");
const holiday_service_1 = require("../holiday/holiday.service");
const employee_history_entity_1 = require("../employee-history/entities/employee-history.entity");
const holiday_entity_1 = require("../holiday/entities/holiday.entity");
const leave_entity_1 = require("../leave/entities/leave.entity");
const leave_service_1 = require("../leave/leave.service");
const smia_ostie_service_1 = require("../smia_ostie/smia_ostie.service");
const smia_ostie_entity_1 = require("../smia_ostie/entities/smia_ostie.entity");
const carried_forward_entity_1 = require("../carried-forward/entities/carried-forward.entity");
const carried_forward_service_1 = require("../carried-forward/carried-forward.service");
let Permission2hModule = class Permission2hModule {
};
exports.Permission2hModule = Permission2hModule;
exports.Permission2hModule = Permission2hModule = __decorate([
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
            typeorm_1.TypeOrmModule.forFeature([
                permission2h_entity_1.Permission2h,
                employee_entity_1.Employee,
                employee_history_entity_1.EmployeeHistory,
                holiday_entity_1.Holiday,
                leave_entity_1.Leave,
                history_entity_1.History,
                user_entity_1.User,
                smia_ostie_entity_1.SmiaOstie,
                carried_forward_entity_1.CarriedForward
            ]),
        ],
        controllers: [permission2h_controller_1.Permission2hController],
        providers: [
            permission2h_service_1.Permission2hService,
            history_service_1.HistoryService,
            user_service_1.UserService,
            jwt_1.JwtService,
            employee_service_1.EmployeeService,
            employee_history_service_1.EmployeeHistoryService,
            crypto_service_1.CryptoService,
            holiday_service_1.HolidayService,
            leave_service_1.LeaveService,
            smia_ostie_service_1.SmiaOstieService,
            carried_forward_service_1.CarriedForwardService
        ],
        exports: [
            permission2h_service_1.Permission2hService,
            history_service_1.HistoryService,
            user_service_1.UserService,
            jwt_1.JwtService,
            employee_service_1.EmployeeService,
            employee_history_service_1.EmployeeHistoryService,
            crypto_service_1.CryptoService,
            holiday_service_1.HolidayService,
            leave_service_1.LeaveService,
            smia_ostie_service_1.SmiaOstieService,
            carried_forward_service_1.CarriedForwardService
        ],
    })
], Permission2hModule);
//# sourceMappingURL=permission2h.module.js.map