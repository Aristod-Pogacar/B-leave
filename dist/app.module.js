"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const employee_module_1 = require("./employee/employee.module");
const leave_module_1 = require("./leave/leave.module");
const config_1 = require("@nestjs/config");
const leave_entity_1 = require("./leave/entities/leave.entity");
const employee_entity_1 = require("./employee/entities/employee.entity");
const user_module_1 = require("./user/user.module");
const auth_module_1 = require("./auth/auth.module");
const mail_service_1 = require("./mail/mail.service");
const auth_service_1 = require("./auth/auth.service");
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("./user/entities/user.entity");
const employee_service_1 = require("./employee/employee.service");
const session_locals_middleware_1 = require("./session-locals/session-locals.middleware");
const nestjs_i18n_1 = require("nestjs-i18n");
const puppeteer_service_1 = require("./puppeteer/puppeteer.service");
const puppeteer_controller_1 = require("./puppeteer/puppeteer.controller");
const puppeteer_module_1 = require("./puppeteer/puppeteer.module");
const crypto_service_1 = require("./crypto/crypto.service");
const puppeteer_manager_service_1 = require("./puppeteer-manager/puppeteer-manager.service");
const leave_module_2 = require("./api/leave/leave.module");
const manager_assignation_module_1 = require("./manager_assignation/manager_assignation.module");
const path_1 = __importDefault(require("path"));
const manager_assignation_entity_1 = require("./manager_assignation/entities/manager_assignation.entity");
const permission2h_module_1 = require("./permission2h/permission2h.module");
const permission2h_entity_1 = require("./permission2h/entities/permission2h.entity");
const medical_service_module_1 = require("./medical_service/medical_service.module");
const medical_service_entity_1 = require("./medical_service/entities/medical_service.entity");
const smia_ostie_module_1 = require("./smia_ostie/smia_ostie.module");
const smia_ostie_entity_1 = require("./smia_ostie/entities/smia_ostie.entity");
const task_module_1 = require("./task/task.module");
const task_service_1 = require("./task/task.service");
const history_module_1 = require("./history/history.module");
const history_entity_1 = require("./history/entities/history.entity");
const history_service_1 = require("./history/history.service");
const fingerprint_gateway_1 = require("./fingerprint/fingerprint.gateway");
const fortest_gateway_1 = require("./fortest/fortest.gateway");
const fingerprint_service_1 = require("./fingerprint/fingerprint.service");
const fingerprint_module_1 = require("./fingerprint/fingerprint.module");
const permission2h_service_1 = require("./permission2h/permission2h.service");
const smia_ostie_service_1 = require("./smia_ostie/smia_ostie.service");
const employee_history_module_1 = require("./employee-history/employee-history.module");
const employee_history_entity_1 = require("./employee-history/entities/employee-history.entity");
const employee_history_service_1 = require("./employee-history/employee-history.service");
const holiday_module_1 = require("./holiday/holiday.module");
const holiday_entity_1 = require("./holiday/entities/holiday.entity");
const notification_module_1 = require("./notification/notification.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const notification_entity_1 = require("./notification/entities/notification.entity");
const notification_middleware_1 = require("./notification/notification.middleware");
const withdraw_module_1 = require("./withdraw/withdraw.module");
const withdraw_entity_1 = require("./withdraw/entities/withdraw.entity");
const carried_forward_module_1 = require("./carried-forward/carried-forward.module");
const carried_forward_entity_1 = require("./carried-forward/entities/carried-forward.entity");
const carried_forward_service_1 = require("./carried-forward/carried-forward.service");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(session_locals_middleware_1.SessionLocalsMiddleware, notification_middleware_1.NotificationMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_i18n_1.I18nModule.forRoot({
                fallbackLanguage: 'fr',
                loader: nestjs_i18n_1.I18nJsonLoader,
                loaderOptions: {
                    path: path_1.default.join(__dirname, '/i18n/'),
                    watch: false,
                },
                resolvers: [
                    { use: nestjs_i18n_1.QueryResolver, options: ['lang'] },
                    nestjs_i18n_1.AcceptLanguageResolver,
                ],
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'mysql',
                    url: config.get('MYSQL_URL'),
                    entities: [
                        leave_entity_1.Leave,
                        employee_entity_1.Employee,
                        user_entity_1.User,
                        manager_assignation_entity_1.ManagerAssignation,
                        permission2h_entity_1.Permission2h,
                        medical_service_entity_1.MedicalService,
                        smia_ostie_entity_1.SmiaOstie,
                        history_entity_1.History,
                        employee_history_entity_1.EmployeeHistory,
                        holiday_entity_1.Holiday,
                        notification_entity_1.Notification,
                        withdraw_entity_1.Withdraw,
                        carried_forward_entity_1.CarriedForward
                    ],
                    synchronize: true,
                }),
            }),
            employee_module_1.EmployeeModule,
            leave_module_1.LeaveModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            puppeteer_module_1.PuppeteerModule,
            leave_module_2.ApiLeaveModule,
            manager_assignation_module_1.ManagerAssignationModule,
            permission2h_module_1.Permission2hModule,
            medical_service_module_1.MedicalServiceModule,
            smia_ostie_module_1.SmiaOstieModule,
            task_module_1.TaskModule,
            history_module_1.HistoryModule,
            fingerprint_module_1.FingerprintModule,
            employee_history_module_1.EmployeeHistoryModule,
            holiday_module_1.HolidayModule,
            notification_module_1.NotificationModule,
            withdraw_module_1.WithdrawModule,
            carried_forward_module_1.CarriedForwardModule,
        ],
        controllers: [app_controller_1.AppController, puppeteer_controller_1.PuppeteerController],
        providers: [
            app_service_1.AppService,
            mail_service_1.MailService,
            auth_service_1.AuthService,
            jwt_1.JwtService,
            employee_service_1.EmployeeService,
            puppeteer_service_1.PuppeteerService,
            crypto_service_1.CryptoService,
            puppeteer_manager_service_1.PuppeteerManagerService,
            task_service_1.TaskService,
            history_service_1.HistoryService,
            fingerprint_gateway_1.FingerprintGateway,
            fortest_gateway_1.FortestGateway,
            fingerprint_service_1.FingerprintService,
            permission2h_service_1.Permission2hService,
            smia_ostie_service_1.SmiaOstieService,
            employee_history_service_1.EmployeeHistoryService,
            carried_forward_service_1.CarriedForwardService
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map