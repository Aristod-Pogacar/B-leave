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
exports.EmployeeHistoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const employee_history_entity_1 = require("./entities/employee-history.entity");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("../employee/entities/employee.entity");
let EmployeeHistoryService = class EmployeeHistoryService {
    employeeHistoryRepository;
    employeeRepository;
    constructor(employeeHistoryRepository, employeeRepository) {
        this.employeeHistoryRepository = employeeHistoryRepository;
        this.employeeRepository = employeeRepository;
    }
    async rehire(id, body) {
        const archive = await this.employeeHistoryRepository.findOne({ where: { id }, relations: ['employee'] });
        const employee = archive?.employee;
        if (employee) {
            const doe = new Date(body.DOE);
            var dor = new Date(body.DOR);
            doe.setUTCHours(12, 0, 0, 0);
            dor.setUTCHours(12, 0, 0, 0);
            employee.DOE = doe;
            if (body.DOR == null || body.DOR == '') {
                employee.DOR = null;
            }
            else {
                employee.DOR = dor;
            }
            employee.matricule = body.matricule;
            employee.is_active = true;
            employee.is_deleted = false;
            employee.manager = null;
            return this.employeeRepository.save(employee);
        }
        return `Employee not found`;
    }
    async paginateArchives(search, page, limit, user) {
        const queryBuilder = this.employeeHistoryRepository.createQueryBuilder('employeeHistory');
        queryBuilder
            .where(qb => {
            const subQuery = qb
                .subQuery()
                .select('MAX(eh.createdAt)')
                .from(employee_history_entity_1.EmployeeHistory, 'eh')
                .where('eh.employee_id = employeeHistory.employee_id')
                .getQuery();
            return `employeeHistory.createdAt = ${subQuery}`;
        })
            .leftJoinAndSelect('employeeHistory.employee', 'employee')
            .orderBy('employeeHistory.createdAt', 'DESC');
        if (search) {
            queryBuilder.andWhere('employeeHistory.name LIKE :search OR employeeHistory.firstname LIKE :search OR employeeHistory.matricule LIKE :search OR employeeHistory.designation LIKE :search OR employeeHistory.section LIKE :search OR employeeHistory.manager LIKE :search', { search: `%${search}%` });
        }
        const total = await queryBuilder.getCount();
        const totalPages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;
        const data = await queryBuilder.skip(skip).take(limit).getMany();
        return { data, total, totalPages };
    }
    async employeeHistory(employeeId) {
        const employeeHistory = await this.employeeHistoryRepository.find({
            where: { employee: { id: employeeId } },
            relations: ['employee'],
            order: { createdAt: 'DESC' }
        });
        return employeeHistory;
    }
    create(createEmployeeHistoryDto) {
        return 'This action adds a new employeeHistory';
    }
    findAll() {
        return `This action returns all employeeHistory`;
    }
    async findOne(id) {
        return await this.employeeHistoryRepository.findOne({ where: { id } });
    }
    async update(id, updateEmployeeHistoryDto) {
        return await this.employeeHistoryRepository.update(id, updateEmployeeHistoryDto);
    }
    async remove(id) {
        const employee = await this.employeeHistoryRepository.findOne({ where: { id } });
        if (employee) {
            return await this.employeeHistoryRepository.remove(employee);
        }
        return `Employee not found`;
    }
};
exports.EmployeeHistoryService = EmployeeHistoryService;
exports.EmployeeHistoryService = EmployeeHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_history_entity_1.EmployeeHistory)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], EmployeeHistoryService);
//# sourceMappingURL=employee-history.service.js.map