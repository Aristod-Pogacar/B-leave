"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalServiceModule = void 0;
const common_1 = require("@nestjs/common");
const medical_service_service_1 = require("./medical_service.service");
const medical_service_controller_1 = require("./medical_service.controller");
const typeorm_1 = require("@nestjs/typeorm");
const medical_service_entity_1 = require("./entities/medical_service.entity");
const history_service_1 = require("../history/history.service");
const history_entity_1 = require("../history/entities/history.entity");
let MedicalServiceModule = class MedicalServiceModule {
};
exports.MedicalServiceModule = MedicalServiceModule;
exports.MedicalServiceModule = MedicalServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([medical_service_entity_1.MedicalService, history_entity_1.History]),
        ],
        controllers: [medical_service_controller_1.MedicalServiceController],
        providers: [medical_service_service_1.MedicalServiceService, history_service_1.HistoryService],
        exports: [medical_service_service_1.MedicalServiceService, history_service_1.HistoryService],
    })
], MedicalServiceModule);
//# sourceMappingURL=medical_service.module.js.map