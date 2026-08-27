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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarriedForwardController = void 0;
const common_1 = require("@nestjs/common");
const carried_forward_service_1 = require("./carried-forward.service");
const create_carried_forward_dto_1 = require("./dto/create-carried-forward.dto");
const update_carried_forward_dto_1 = require("./dto/update-carried-forward.dto");
let CarriedForwardController = class CarriedForwardController {
    carriedForwardService;
    constructor(carriedForwardService) {
        this.carriedForwardService = carriedForwardService;
    }
    create(createCarriedForwardDto) {
        return this.carriedForwardService.create(createCarriedForwardDto);
    }
    findAll() {
        return this.carriedForwardService.findAll();
    }
    findOne(id) {
        return this.carriedForwardService.findOne(+id);
    }
    update(id, updateCarriedForwardDto) {
        return this.carriedForwardService.update(+id, updateCarriedForwardDto);
    }
    remove(id) {
        return this.carriedForwardService.remove(+id);
    }
};
exports.CarriedForwardController = CarriedForwardController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_carried_forward_dto_1.CreateCarriedForwardDto]),
    __metadata("design:returntype", void 0)
], CarriedForwardController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CarriedForwardController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarriedForwardController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_carried_forward_dto_1.UpdateCarriedForwardDto]),
    __metadata("design:returntype", void 0)
], CarriedForwardController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarriedForwardController.prototype, "remove", null);
exports.CarriedForwardController = CarriedForwardController = __decorate([
    (0, common_1.Controller)('carried-forward'),
    __metadata("design:paramtypes", [carried_forward_service_1.CarriedForwardService])
], CarriedForwardController);
//# sourceMappingURL=carried-forward.controller.js.map