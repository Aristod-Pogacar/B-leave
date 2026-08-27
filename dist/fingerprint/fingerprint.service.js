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
exports.FingerprintService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("../employee/entities/employee.entity");
let FingerprintService = class FingerprintService {
    employeeRepo;
    constructor(employeeRepo) {
        this.employeeRepo = employeeRepo;
    }
    async findById(id) {
        return this.employeeRepo.findOne({ where: { id } });
    }
    async findByMatricule(matricule) {
        return this.employeeRepo.findOne({ where: { matricule } });
    }
    async findByFingerprintId(fingerprintId) {
        return this.employeeRepo.findOne({ where: { fingerprintId } });
    }
    async getNextFreeSlot() {
        const used = await this.employeeRepo.find({
            where: { fingerprintId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
            select: ['fingerprintId'],
        });
        const usedSlots = new Set(used.map(e => e.fingerprintId));
        for (let i = 1; i <= 162; i++) {
            if (!usedSlots.has(i))
                return i;
        }
        throw new Error('Plus de slots disponibles dans le capteur');
    }
    async saveFingerprintId(matricule, fingerprintId, deviceId) {
        const employee = await this.employeeRepo.findOne({ where: { matricule: matricule } });
        if (!employee)
            return null;
        employee.fingerprintId = fingerprintId;
        employee.deviceId = deviceId;
        return this.employeeRepo.save(employee);
    }
    async clearFingerprintId(matricule) {
        const employee = await this.employeeRepo.findOne({ where: { matricule: matricule } });
        if (!employee)
            return null;
        employee.fingerprintId = null;
        employee.deviceId = null;
        return this.employeeRepo.save(employee);
    }
};
exports.FingerprintService = FingerprintService;
exports.FingerprintService = FingerprintService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FingerprintService);
//# sourceMappingURL=fingerprint.service.js.map