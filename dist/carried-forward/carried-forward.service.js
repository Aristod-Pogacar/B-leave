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
exports.CarriedForwardService = void 0;
const common_1 = require("@nestjs/common");
const carried_forward_entity_1 = require("./entities/carried-forward.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
let CarriedForwardService = class CarriedForwardService {
    carriedForwardRepository;
    constructor(carriedForwardRepository) {
        this.carriedForwardRepository = carriedForwardRepository;
    }
    async addAll(data) {
        return await this.carriedForwardRepository.save(data);
    }
    create(createCarriedForwardDto) {
        const newCarriedForward = this.carriedForwardRepository.create(createCarriedForwardDto);
        return this.carriedForwardRepository.save(newCarriedForward);
    }
    findAll() {
        return `This action returns all carriedForward`;
    }
    findOne(id) {
        return `This action returns a #${id} carriedForward`;
    }
    update(id, updateCarriedForwardDto) {
        return `This action updates a #${id} carriedForward`;
    }
    remove(id) {
        return `This action removes a #${id} carriedForward`;
    }
};
exports.CarriedForwardService = CarriedForwardService;
exports.CarriedForwardService = CarriedForwardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(carried_forward_entity_1.CarriedForward)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], CarriedForwardService);
//# sourceMappingURL=carried-forward.service.js.map