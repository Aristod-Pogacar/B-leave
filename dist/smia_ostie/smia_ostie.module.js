"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmiaOstieModule = void 0;
const common_1 = require("@nestjs/common");
const smia_ostie_service_1 = require("./smia_ostie.service");
const smia_ostie_controller_1 = require("./smia_ostie.controller");
const employee_entity_1 = require("../employee/entities/employee.entity");
const smia_ostie_entity_1 = require("./entities/smia_ostie.entity");
const typeorm_1 = require("@nestjs/typeorm");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
const history_entity_1 = require("../history/entities/history.entity");
const history_service_1 = require("../history/history.service");
let SmiaOstieModule = class SmiaOstieModule {
};
exports.SmiaOstieModule = SmiaOstieModule;
exports.SmiaOstieModule = SmiaOstieModule = __decorate([
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
            typeorm_1.TypeOrmModule.forFeature([smia_ostie_entity_1.SmiaOstie, employee_entity_1.Employee, history_entity_1.History]),
        ],
        controllers: [smia_ostie_controller_1.SmiaOstieController],
        providers: [smia_ostie_service_1.SmiaOstieService, history_service_1.HistoryService],
        exports: [smia_ostie_service_1.SmiaOstieService, history_service_1.HistoryService],
    })
], SmiaOstieModule);
//# sourceMappingURL=smia_ostie.module.js.map