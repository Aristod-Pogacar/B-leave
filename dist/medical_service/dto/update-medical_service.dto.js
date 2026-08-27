"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMedicalServiceDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_medical_service_dto_1 = require("./create-medical_service.dto");
const class_validator_1 = require("class-validator");
class UpdateMedicalServiceDto extends (0, mapped_types_1.PartialType)(create_medical_service_dto_1.CreateMedicalServiceDto) {
    name;
}
exports.UpdateMedicalServiceDto = UpdateMedicalServiceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMedicalServiceDto.prototype, "name", void 0);
//# sourceMappingURL=update-medical_service.dto.js.map