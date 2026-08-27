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
exports.MedicalServiceService = void 0;
const common_1 = require("@nestjs/common");
const medical_service_entity_1 = require("./entities/medical_service.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
let MedicalServiceService = class MedicalServiceService {
    medicalServiceRepo;
    constructor(medicalServiceRepo) {
        this.medicalServiceRepo = medicalServiceRepo;
    }
    findOneByName(name) {
        return this.medicalServiceRepo.findOne({ where: { name } });
    }
    create(createMedicalServiceDto) {
        return this.medicalServiceRepo.save(createMedicalServiceDto);
    }
    findAll() {
        return this.medicalServiceRepo.find();
    }
    findOne(id) {
        return this.medicalServiceRepo.findOne({ where: { id } });
    }
    update(id, updateMedicalServiceDto) {
        return this.medicalServiceRepo.update(id, updateMedicalServiceDto);
    }
    remove(id) {
        return this.medicalServiceRepo.delete(id);
    }
    async paginateMedicalService(search, page, limit) {
        const skip = (page - 1) * limit;
        const query = this.medicalServiceRepo
            .createQueryBuilder('m');
        if (search && search.trim() !== '') {
            query.where('m.name LIKE :search', { search: `%${search}%` });
        }
        const [data, total] = await query
            .orderBy('m.id', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
};
exports.MedicalServiceService = MedicalServiceService;
exports.MedicalServiceService = MedicalServiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(medical_service_entity_1.MedicalService)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], MedicalServiceService);
//# sourceMappingURL=medical_service.service.js.map