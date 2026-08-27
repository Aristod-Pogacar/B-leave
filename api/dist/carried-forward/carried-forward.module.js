"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarriedForwardModule = void 0;
const common_1 = require("@nestjs/common");
const carried_forward_service_1 = require("./carried-forward.service");
const carried_forward_controller_1 = require("./carried-forward.controller");
const typeorm_1 = require("@nestjs/typeorm");
const carried_forward_entity_1 = require("./entities/carried-forward.entity");
const employee_entity_1 = require("../employee/entities/employee.entity");
let CarriedForwardModule = class CarriedForwardModule {
};
exports.CarriedForwardModule = CarriedForwardModule;
exports.CarriedForwardModule = CarriedForwardModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([carried_forward_entity_1.CarriedForward, employee_entity_1.Employee])],
        controllers: [carried_forward_controller_1.CarriedForwardController],
        providers: [carried_forward_service_1.CarriedForwardService],
        exports: [carried_forward_service_1.CarriedForwardService],
    })
], CarriedForwardModule);
//# sourceMappingURL=carried-forward.module.js.map