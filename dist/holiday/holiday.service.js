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
exports.HolidayService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const holiday_entity_1 = require("./entities/holiday.entity");
const typeorm_2 = require("typeorm");
let HolidayService = class HolidayService {
    holidayRepository;
    constructor(holidayRepository) {
        this.holidayRepository = holidayRepository;
    }
    async findByDateRange(start_date, end_date) {
        return await this.holidayRepository.find({
            where: {
                date: (0, typeorm_2.Between)(new Date(start_date), new Date(end_date))
            }
        });
    }
    async findAllByYear(year) {
        const holidays = await this.holidayRepository.find({
            where: {
                date: (0, typeorm_2.Between)(new Date(year, 0, 0), new Date(year, 12, 0))
            }
        });
        return holidays;
    }
    async findBetweenDate(start_date, end_date) {
        return await this.holidayRepository.find({
            where: {
                date: (0, typeorm_2.Between)(new Date(start_date), new Date(end_date))
            }
        });
    }
    create(createHolidayDto) {
        return this.holidayRepository.save(createHolidayDto);
    }
    findAll() {
        return this.holidayRepository.find();
    }
    findOne(id) {
        return this.holidayRepository.findOne({ where: { id } });
    }
    update(id, updateHolidayDto) {
        return this.holidayRepository.update(id, updateHolidayDto);
    }
    remove(id) {
        return this.holidayRepository.delete(id);
    }
};
exports.HolidayService = HolidayService;
exports.HolidayService = HolidayService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(holiday_entity_1.Holiday)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], HolidayService);
//# sourceMappingURL=holiday.service.js.map