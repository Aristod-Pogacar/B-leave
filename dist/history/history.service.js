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
exports.HistoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const history_entity_1 = require("./entities/history.entity");
const typeorm_2 = require("typeorm");
let HistoryService = class HistoryService {
    historyRepository;
    constructor(historyRepository) {
        this.historyRepository = historyRepository;
    }
    async paginate(search, page, limit, start_date, end_date) {
        const query = this.historyRepository.createQueryBuilder('h');
        query.orderBy('h.date_at', 'DESC');
        if (search && search.trim() !== '') {
            query.andWhere('h.reason LIKE :s OR h.message LIKE :s OR h.created_by LIKE :s', { s: `%${search}%` });
        }
        if (start_date && start_date.trim() !== '') {
            query.andWhere('h.date_at >= :start_date', { start_date });
        }
        if (end_date && end_date.trim() !== '') {
            query.andWhere('h.date_at <= :end_date', { end_date });
        }
        const total = await query.getCount();
        const data = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return { data, total, totalPages: Math.ceil(total / limit) };
    }
    async create(createHistoryDto) {
        return this.historyRepository.save(createHistoryDto);
    }
    async findAll() {
        return this.historyRepository.find();
    }
    async findOne(id) {
        return this.historyRepository.findOne({ where: { id } });
    }
    async update(id, updateHistoryDto) {
        return this.historyRepository.update(id, updateHistoryDto);
    }
    remove(id) {
        return this.historyRepository.delete({ id });
    }
};
exports.HistoryService = HistoryService;
exports.HistoryService = HistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(history_entity_1.History)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], HistoryService);
//# sourceMappingURL=history.service.js.map