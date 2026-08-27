"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const employee_entity_1 = require("./entities/employee.entity");
const typeorm_2 = require("typeorm");
const ExcelJS = __importStar(require("exceljs"));
const XLSX = __importStar(require("xlsx"));
const leave_entity_1 = require("../leave/entities/leave.entity");
const user_entity_1 = require("../user/entities/user.entity");
const bcrypt = __importStar(require("bcrypt"));
const crypto_service_1 = require("../crypto/crypto.service");
const history_service_1 = require("../history/history.service");
const history_entity_1 = require("../history/entities/history.entity");
const employee_history_entity_1 = require("../employee-history/entities/employee-history.entity");
const holiday_service_1 = require("../holiday/holiday.service");
const carried_forward_entity_1 = require("../carried-forward/entities/carried-forward.entity");
let EmployeeService = class EmployeeService {
    employeeRepository;
    employeeHistoryRepository;
    leaveRepository;
    userRepository;
    carriedForwardRepository;
    cryptoService;
    holidayService;
    historyService;
    constructor(employeeRepository, employeeHistoryRepository, leaveRepository, userRepository, carriedForwardRepository, cryptoService, holidayService, historyService) {
        this.employeeRepository = employeeRepository;
        this.employeeHistoryRepository = employeeHistoryRepository;
        this.leaveRepository = leaveRepository;
        this.userRepository = userRepository;
        this.carriedForwardRepository = carriedForwardRepository;
        this.cryptoService = cryptoService;
        this.holidayService = holidayService;
        this.historyService = historyService;
    }
    async archiveEmployee(id, dor) {
        const employee = await this.employeeRepository.findOne({ where: { id } });
        if (!employee) {
            throw new common_1.BadRequestException("Employee not found");
        }
        const date = new Date(dor);
        date.setHours(12, 0, 0, 0);
        await this.employeeHistoryRepository.save({
            employee: employee,
            matricule: employee.matricule,
            name: employee.name,
            firstname: employee.firstname,
            section: employee.section,
            site: employee.site,
            job_level: employee.job_level,
            line: employee.line,
            departement: employee.departement,
            designation: employee.designation,
            DOR: date,
            DOE: employee.DOE,
            division: employee.division,
            type: employee.type,
        });
        employee.is_deleted = true;
        employee.is_active = false;
        employee.DOR = date;
        await this.employeeRepository.save(employee);
        return employee;
    }
    async getEmployeeCountBySection() {
        return this.employeeRepository
            .createQueryBuilder('employee')
            .select('employee.section', 'section')
            .addSelect('COUNT(employee.id)', 'count')
            .where('employee.is_deleted = :isDeleted', { isDeleted: false })
            .andWhere('employee.is_active = :isActive', { isActive: true })
            .groupBy('employee.section')
            .orderBy('employee.section', 'ASC')
            .getRawMany();
    }
    async paginateEmployee(search, page, limit, user) {
        const query = this.employeeRepository.createQueryBuilder('e');
        query.leftJoinAndSelect('e.manager', 'manager');
        query.orderBy('e.matricule', 'ASC');
        const role = this.getAllowedSites(user.site);
        if (search && search.trim() !== '') {
            query.andWhere('e.matricule LIKE :s OR e.name LIKE :s OR e.firstname LIKE :s', { s: `%${search}%` });
        }
        query.andWhere({ site: (0, typeorm_2.In)(role) });
        query.andWhere({ is_deleted: false, is_active: true });
        const total = await query.getCount();
        const data = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return { data, total, totalPages: Math.ceil(total / limit) };
    }
    async getMyTeam(user, search) {
        const query = this.employeeRepository.createQueryBuilder('e');
        query.leftJoinAndSelect('e.manager', 'manager');
        query.orderBy('e.matricule', 'ASC');
        query.where({ manager: { id: user.employee?.id }, is_active: true, is_deleted: false });
        if (search && search.trim() !== '') {
            query.andWhere('(e.matricule LIKE :s OR e.name LIKE :s OR e.firstname LIKE :s OR e.section LIKE :s OR e.designation LIKE :s) AND e.is_deleted = false AND e.is_active = true', { s: `%${search}%` });
        }
        const data = await query.getMany();
        return data;
    }
    async updateManager(data) {
        const employee = await this.employeeRepository.findOne({ where: { matricule: data.matricule, is_active: true, is_deleted: false } });
        if (employee) {
            const manager = await this.employeeRepository.findOne({ where: { matricule: data.manager, is_active: true, is_deleted: false } });
            if (manager) {
                employee.manager = manager;
                await this.employeeRepository.save(employee);
            }
        }
    }
    async getAssignedEmployees(managerId) {
        return this.employeeRepository.find({
            where: { manager: { id: managerId }, is_active: true, is_deleted: false },
            select: ['name', 'firstname', 'matricule', 'id', 'section', 'line']
        });
    }
    async compare(compareAdminDto) {
        const employee = await this.employeeRepository.findOne({ where: { matricule: compareAdminDto.matricule, is_active: true, is_deleted: false } });
        if (!employee) {
            throw new common_1.BadRequestException("Employee not found");
        }
        const compare = await bcrypt.compare(compareAdminDto.password, employee.app_password);
        return { "isEmployee": compare };
    }
    async create(createEmployeeDto, res, req) {
        try {
            await this.employeeRepository.save(createEmployeeDto);
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.EMPLOYEE,
                message: "New employee " + createEmployeeDto.matricule + " by " + req.session.user.firstName + " " + req.session.user.name,
                created_by: req.session.user.matricule,
            });
            return res.redirect('/');
        }
        catch (error) {
            return res.redirect('/employee/new-employee?error=' + error.message);
        }
    }
    findAllByLineAndDepartement(line, departement, skip, take, year) {
        return this.employeeRepository.find({ where: { line, departement, is_active: true, is_deleted: false }, skip, take, order: { matricule: 'ASC' } });
    }
    async updatePassword(data) {
        const salt = await bcrypt.genSalt(10);
        const employee = await this.employeeRepository.findOne({ where: { matricule: data.matricule } });
        if (employee) {
            employee.app_password = bcrypt.hashSync(data.app_password, salt);
            employee.onehr_password = this.cryptoService.encrypt(data.onehr_password);
            await this.employeeRepository.save(employee);
        }
    }
    async assignManager(managerId, employeeIds) {
        const manager = await this.userRepository.findOne({
            where: { id: managerId },
        });
        if (!manager) {
            throw new Error('Manager introuvable');
        }
        await this.employeeRepository.update({ id: (0, typeorm_2.In)(employeeIds) }, { manager: manager, is_active: true, is_deleted: false });
        return {
            message: `${employeeIds.length} employees assignés`,
        };
    }
    async getNoManager(site, search = "") {
        if (!site) {
            throw new common_1.BadRequestException("Site is required");
        }
        const allowedSites = this.getAllowedSites(site);
        const employees = await this.employeeRepository.find({
            where: [
                { site: (0, typeorm_2.In)(allowedSites), matricule: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                { site: (0, typeorm_2.In)(allowedSites), firstname: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                { site: (0, typeorm_2.In)(allowedSites), name: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false }
            ],
            select: [
                'name',
                'firstname',
                'matricule',
                'id',
                'section',
                'line'
            ]
        });
        return employees;
    }
    calculateAccruedLeave(year) {
        const today = new Date();
        let total = 0;
        for (let month = 0; month <= today.getMonth(); month++) {
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            if (month === today.getMonth()) {
                total += (2.5 / daysInMonth) * today.getDate();
            }
            else {
                total += 2.5;
            }
        }
        return parseFloat(total.toFixed(2));
    }
    getAllowedSites(userSite) {
        if (userSite === user_entity_1.Site.MADA) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2, user_entity_1.Site.TANA];
        }
        else if (userSite === user_entity_1.Site.ANTSIRABE) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2];
        }
        else if (userSite === user_entity_1.Site.TANA) {
            return [user_entity_1.Site.TANA];
        }
        else if (userSite === user_entity_1.Site.ABE1) {
            return [user_entity_1.Site.ABE1];
        }
        else if (userSite === user_entity_1.Site.ABE2) {
            return [user_entity_1.Site.ABE2];
        }
        else {
            return [];
        }
    }
    async getEmployeeBalanceAtDate(matricule, atDate) {
        const emp = await this.employeeRepository.findOne({
            where: {
                matricule,
                is_active: true,
                is_deleted: false,
            },
        });
        if (!emp) {
            return null;
        }
        const year = atDate.getFullYear();
        const carriedForward = await this.carriedForwardRepository
            .createQueryBuilder('cf')
            .leftJoin('cf.employee', 'employee')
            .select('employee.id', 'employeeId')
            .addSelect('cf.days', 'days')
            .addSelect('cf.daysTaken', 'daysTaken')
            .addSelect('cf.date', 'date')
            .where('employee.id = :employeeId', {
            employeeId: emp.id,
        })
            .andWhere('YEAR(cf.date) = :year', {
            year,
        })
            .andWhere('employee.site = :site', {
            site: emp.site,
        })
            .andWhere(qb => {
            const subQuery = qb
                .subQuery()
                .select('MAX(cf2.date)')
                .from(carried_forward_entity_1.CarriedForward, 'cf2')
                .leftJoin('cf2.employee', 'emp2')
                .where('emp2.id = employee.id')
                .andWhere('YEAR(cf2.date) = :year')
                .getQuery();
            return `cf.date = ${subQuery}`;
        })
            .setParameter('year', year)
            .getRawOne();
        let debut = 0;
        let daysTaken = 0;
        if (carriedForward) {
            debut = Number(carriedForward.days);
            daysTaken = Number(carriedForward.daysTaken || 0);
        }
        let dateFilter = (0, typeorm_2.Between)(new Date(year, 0, 1), atDate);
        const localLeaves = await this.leaveRepository.find({
            where: {
                employee: {
                    id: emp.id,
                },
                leave_type: 'Local_Leave_AMD',
                status: leave_entity_1.LeaveStatus.APPROVED,
                start_date: dateFilter,
            },
            relations: [
                'employee'
            ],
        });
        const permissionQuery = this.leaveRepository
            .createQueryBuilder('leave')
            .leftJoin('leave.employee', 'employee')
            .where('employee.id = :id', {
            id: emp.id,
        })
            .andWhere('leave.status = :status', {
            status: leave_entity_1.LeaveStatus.APPROVED,
        })
            .andWhere('leave.leave_type = :type', {
            type: 'Permission_AMD',
        })
            .andWhere('YEAR(leave.start_date) = :year', {
            year,
        })
            .andWhere('leave.start_date <= :date', {
            date: atDate,
        })
            .andWhere('employee.site = :site', {
            site: emp.site,
        });
        if (carriedForward) {
            permissionQuery.andWhere('leave.start_date >= :cfDate', {
                cfDate: carriedForward.date,
            });
        }
        const permissions = await permissionQuery.getMany();
        let permissionTaken = 0;
        let localLeaveTaken = 0;
        for (const leave of localLeaves) {
            const holidays = await this.getDaysTakenWithHoliday(new Date(leave.start_date)
                .toISOString()
                .split('T')[0], new Date(leave.end_date)
                .toISOString()
                .split('T')[0]);
            localLeaveTaken +=
                this.calculateDaysBetween(new Date(leave.start_date), new Date(leave.end_date))
                    - holidays;
        }
        permissions.forEach(l => {
            permissionTaken += Number(this.calculateDaysBetween(new Date(l.start_date), new Date(l.end_date)));
        });
        let cumulSolde;
        if (carriedForward) {
            cumulSolde =
                this.calculateSoldeCumulFromDate(new Date(carriedForward.date), Number(carriedForward.days), atDate);
        }
        else {
            cumulSolde =
                (await this.getEmployeeSolde(emp.matricule, atDate)).solde_cumul;
        }
        const pris = Number(localLeaveTaken.toFixed(2))
            + daysTaken;
        const prisPermission = Number(permissionTaken.toFixed(2));
        const restant = cumulSolde - pris;
        return {
            ...emp,
            solde_cumul: Number(cumulSolde.toFixed(2)),
            solde_debut: Number(debut),
            solde_pris: Number(pris.toFixed(2)),
            solde_pris_permission: Number(prisPermission.toFixed(2)),
            solde_restant: Number((restant + debut).toFixed(2)),
        };
    }
    async getEmployeeWithBalances(search, atDate = new Date()) {
        let employees;
        let total;
        let year = new Date(atDate).getFullYear();
        if (search && search.trim() !== "") {
            [employees, total] = await this.employeeRepository.findAndCount({
                where: [
                    { matricule: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                    { name: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                    { firstname: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                    { division: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                    { section: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                ],
                order: { matricule: 'ASC' },
            });
        }
        else {
            [employees, total] = await this.employeeRepository.findAndCount({
                where: { is_active: true, is_deleted: false },
                order: { matricule: 'ASC' },
            });
        }
        if (employees.length === 0) {
            return { data: [], total };
        }
        const employeeIds = employees.map(e => e.id);
        const carriedForwards = await this.carriedForwardRepository
            .createQueryBuilder('cf')
            .leftJoin('cf.employee', 'employee')
            .select('employee.id', 'employeeId')
            .addSelect('cf.days', 'days')
            .addSelect('cf.daysTaken', 'daysTaken')
            .addSelect('cf.date', 'date')
            .where('employee.id IN (:...employeeIds)', { employeeIds })
            .andWhere('YEAR(cf.date) = :year', { year })
            .andWhere(qb => {
            const subQuery = qb
                .subQuery()
                .select('MAX(cf2.date)')
                .from(carried_forward_entity_1.CarriedForward, 'cf2')
                .leftJoin('cf2.employee', 'emp2')
                .where('emp2.id = employee.id')
                .andWhere('YEAR(cf2.date) = :year')
                .getQuery();
            return `cf.date = ${subQuery}`;
        })
            .setParameter('year', year)
            .getRawMany();
        const carriedForwardMap = new Map(carriedForwards.map(cf => [
            cf.employeeId,
            {
                days: Number(cf.days),
                daysTaken: Number(cf.daysTaken || 0),
                date: new Date(cf.date),
            },
        ]));
        const today = new Date(atDate);
        let soldeCumul = 0;
        if (year < today.getFullYear()) {
            soldeCumul = 2.5 * 12;
        }
        else if (year > today.getFullYear()) {
            soldeCumul = 0;
        }
        else {
            for (let m = 0; m <= today.getMonth(); m++) {
                const daysInMonth = new Date(year, m + 1, 0).getDate();
                if (m === today.getMonth()) {
                    soldeCumul += (2.5 / daysInMonth) * today.getDate();
                }
                else {
                    soldeCumul += 2.5;
                }
            }
        }
        const promises = employees.map(async (emp) => {
            const carriedForward = carriedForwardMap.get(emp.id);
            var debut = 0;
            var daysTaken = 0;
            var dateFilter = (0, typeorm_2.Between)(new Date(year, 0, 1), new Date(year, 11, 31));
            if (carriedForward) {
                debut = carriedForward.days;
                daysTaken = carriedForward.daysTaken;
            }
            const localLeaves = await this.leaveRepository.find({
                where: {
                    employee: { id: emp.id },
                    leave_type: 'Local_Leave_AMD',
                    status: leave_entity_1.LeaveStatus.APPROVED,
                    start_date: dateFilter,
                },
                relations: ['employee']
            });
            const permissionQuery = this.leaveRepository
                .createQueryBuilder('leave')
                .leftJoin('leave.employee', 'employee')
                .where('employee.id = :id', { id: emp.id })
                .andWhere('leave.status = :status', { status: leave_entity_1.LeaveStatus.APPROVED })
                .andWhere('leave.leave_type = :type', { type: 'Permission_AMD' })
                .andWhere('YEAR(leave.start_date) = :year', { year });
            if (carriedForward) {
                permissionQuery.andWhere('leave.start_date >= :cfDate', {
                    cfDate: carriedForward.date,
                });
            }
            const permissions = await permissionQuery.getMany();
            var permissionTaken = 0;
            let localLeaveTaken = 0;
            for (const leave of localLeaves) {
                const holidays = await this.getDaysTakenWithHoliday(new Date(leave.start_date).toISOString().split('T')[0], new Date(leave.end_date).toISOString().split('T')[0]);
                localLeaveTaken +=
                    this.calculateDaysBetween(new Date(leave.start_date), new Date(leave.end_date))
                        - holidays;
            }
            permissions.forEach(l => {
                permissionTaken += Number(this.calculateDaysBetween(new Date(l.start_date), new Date(l.end_date)));
            });
            let cumulSolde;
            if (carriedForward) {
                cumulSolde = this.calculateSoldeCumulFromDate(carriedForward.date, carriedForward.days, today);
            }
            else {
                cumulSolde =
                    (await this.getEmployeeSolde(emp.matricule, today))
                        .solde_cumul;
            }
            cumulSolde =
                (await this.getEmployeeSolde(emp.matricule, today))
                    .solde_cumul;
            const pris = Number(localLeaveTaken.toFixed(2)) + daysTaken;
            const prisPermission = Number(permissionTaken.toFixed(2));
            const restant = cumulSolde - pris;
            const doeDate = new Date(emp.DOE);
            let soldeDebut = 0;
            if (year > doeDate.getFullYear() + 1) {
                var dateDebutCompte = new Date(doeDate.getFullYear() + 1, doeDate.getMonth(), doeDate.getDate());
                if (year - doeDate.getFullYear() > 3)
                    dateDebutCompte = new Date(year - 3, 0, 1);
                for (let i = dateDebutCompte.getFullYear(); i <= year; i += 3) {
                    for (let y = i; y < year; y++) {
                        soldeDebut += (await this.getEmployeeSolde(emp.matricule, new Date(y, 11, 31))).solde_restant;
                    }
                }
            }
            return {
                ...emp,
                solde_cumul: Number(cumulSolde.toFixed(2)),
                solde_debut: Number(debut),
                solde_pris: Number(pris.toFixed(2)),
                solde_pris_permission: Number(prisPermission.toFixed(2)),
                solde_restant: Number((restant + debut).toFixed(2)),
            };
        });
        const results = await Promise.all(promises);
        return { data: results, total };
    }
    async getEmployeesWithBalances(line, departement, section, division, site, skip, take, year, user, search = '') {
        let employees;
        let total;
        if (user.role === user_entity_1.UserRole.MANAGER) {
            if (search && search.trim() !== "") {
                [employees, total] = await this.employeeRepository.findAndCount({
                    where: [
                        { manager: { id: user.employee?.id }, matricule: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        { manager: { id: user.employee?.id }, name: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        { manager: { id: user.employee?.id }, firstname: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        { manager: { id: user.employee?.id }, division: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        { manager: { id: user.employee?.id }, section: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                    ],
                    order: { matricule: 'ASC' },
                    skip,
                    take,
                });
            }
            else {
                [employees, total] = await this.employeeRepository.findAndCount({
                    where: { manager: { id: user.employee?.id }, is_active: true, is_deleted: false },
                    order: { matricule: 'ASC' },
                    skip,
                    take,
                });
            }
        }
        else {
            if (search && search.trim() !== "") {
                [employees, total] = await this.employeeRepository.findAndCount({
                    where: [
                        { matricule: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        { name: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        { firstname: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        { division: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        { section: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                    ],
                    order: { matricule: 'ASC' },
                    skip,
                    take,
                });
            }
            else {
                [employees, total] = await this.employeeRepository.findAndCount({
                    where: { line, section, division, site, is_active: true, is_deleted: false },
                    order: { matricule: 'ASC' },
                    skip,
                    take,
                });
            }
        }
        if (employees.length === 0) {
            return { data: [], total };
        }
        const employeeIds = employees.map(e => e.id);
        const carriedForwards = await this.carriedForwardRepository
            .createQueryBuilder('cf')
            .leftJoin('cf.employee', 'employee')
            .select('employee.id', 'employeeId')
            .addSelect('cf.days', 'days')
            .addSelect('cf.daysTaken', 'daysTaken')
            .addSelect('cf.date', 'date')
            .where('employee.id IN (:...employeeIds)', { employeeIds })
            .andWhere('YEAR(cf.date) = :year', { year })
            .andWhere('employee.site = :site', { site })
            .andWhere(qb => {
            const subQuery = qb
                .subQuery()
                .select('MAX(cf2.date)')
                .from(carried_forward_entity_1.CarriedForward, 'cf2')
                .leftJoin('cf2.employee', 'emp2')
                .where('emp2.id = employee.id')
                .andWhere('YEAR(cf2.date) = :year')
                .getQuery();
            return `cf.date = ${subQuery}`;
        })
            .setParameter('year', year)
            .getRawMany();
        const carriedForwardMap = new Map(carriedForwards.map(cf => [
            cf.employeeId,
            {
                days: Number(cf.days),
                daysTaken: Number(cf.daysTaken || 0),
                date: new Date(cf.date),
            },
        ]));
        const today = new Date();
        let soldeCumul = 0;
        if (year < today.getFullYear()) {
            soldeCumul = 2.5 * 12;
        }
        else if (year > today.getFullYear()) {
            soldeCumul = 0;
        }
        else {
            for (let m = 0; m <= today.getMonth(); m++) {
                const daysInMonth = new Date(year, m + 1, 0).getDate();
                if (m === today.getMonth()) {
                    soldeCumul += (2.5 / daysInMonth) * today.getDate();
                }
                else {
                    soldeCumul += 2.5;
                }
            }
        }
        const promises = employees.map(async (emp) => {
            const carriedForward = carriedForwardMap.get(emp.id);
            var debut = 0;
            var daysTaken = 0;
            var dateFilter = (0, typeorm_2.Between)(new Date(year, 0, 1), new Date(year, 11, 31));
            if (carriedForward) {
                debut = carriedForward.days;
                daysTaken = carriedForward.daysTaken;
            }
            const localLeaves = await this.leaveRepository.find({
                where: {
                    employee: { id: emp.id },
                    leave_type: 'Local_Leave_AMD',
                    status: leave_entity_1.LeaveStatus.APPROVED,
                    start_date: dateFilter,
                },
                relations: ['employee']
            });
            const permissionQuery = this.leaveRepository
                .createQueryBuilder('leave')
                .leftJoin('leave.employee', 'employee')
                .where('employee.id = :id', { id: emp.id })
                .andWhere('leave.status = :status', { status: leave_entity_1.LeaveStatus.APPROVED })
                .andWhere('leave.leave_type = :type', { type: 'Permission_AMD' })
                .andWhere('YEAR(leave.start_date) = :year', { year })
                .andWhere('employee.site = :site', { site });
            if (carriedForward) {
                permissionQuery.andWhere('leave.start_date >= :cfDate', {
                    cfDate: carriedForward.date,
                });
            }
            const permissions = await permissionQuery.getMany();
            var permissionTaken = 0;
            let localLeaveTaken = 0;
            for (const leave of localLeaves) {
                const holidays = await this.getDaysTakenWithHoliday(new Date(leave.start_date).toISOString().split('T')[0], new Date(leave.end_date).toISOString().split('T')[0]);
                localLeaveTaken +=
                    this.calculateDaysBetween(new Date(leave.start_date), new Date(leave.end_date))
                        - holidays;
            }
            permissions.forEach(l => {
                permissionTaken += Number(this.calculateDaysBetween(new Date(l.start_date), new Date(l.end_date)));
            });
            let cumulSolde;
            if (carriedForward) {
                cumulSolde = this.calculateSoldeCumulFromDate(carriedForward.date, carriedForward.days, today);
            }
            else {
                cumulSolde =
                    (await this.getEmployeeSolde(emp.matricule, today))
                        .solde_cumul;
            }
            cumulSolde =
                (await this.getEmployeeSolde(emp.matricule, today))
                    .solde_cumul;
            const pris = Number(localLeaveTaken.toFixed(2)) + daysTaken;
            const prisPermission = Number(permissionTaken.toFixed(2));
            const restant = cumulSolde - pris;
            const doeDate = new Date(emp.DOE);
            let soldeDebut = 0;
            if (year > doeDate.getFullYear() + 1) {
                var dateDebutCompte = new Date(doeDate.getFullYear() + 1, doeDate.getMonth(), doeDate.getDate());
                if (year - doeDate.getFullYear() > 3)
                    dateDebutCompte = new Date(year - 3, 0, 1);
                for (let i = dateDebutCompte.getFullYear(); i <= year; i += 3) {
                    for (let y = i; y < year; y++) {
                        soldeDebut += (await this.getEmployeeSolde(emp.matricule, new Date(y, 11, 31))).solde_restant;
                    }
                }
            }
            return {
                ...emp,
                solde_cumul: Number(cumulSolde.toFixed(2)),
                solde_debut: Number(debut),
                solde_pris: Number(pris.toFixed(2)),
                solde_pris_permission: Number(prisPermission.toFixed(2)),
                solde_restant: Number((restant + debut).toFixed(2)),
            };
        });
        const results = await Promise.all(promises);
        return { data: results, total };
    }
    async getEmployees(line, departement) {
        const [employees, total] = await this.employeeRepository.findAndCount({
            where: { line, departement, is_active: true, is_deleted: false },
            order: { matricule: 'ASC' },
        });
        if (employees.length === 0) {
            return { data: [], total };
        }
        else {
            return { data: employees, total };
        }
    }
    async findDepartement() {
        const results = await this.employeeRepository
            .createQueryBuilder('empoyee')
            .select('DISTINCT empoyee.departement', 'departement')
            .where('empoyee.is_active = true AND empoyee.is_deleted = false')
            .getRawMany();
        return results.map(res => res.value);
    }
    async findAllDivisions() {
        const results = await this.employeeRepository
            .createQueryBuilder('employee')
            .select('DISTINCT employee.division', 'division')
            .where('employee.is_active = true AND employee.is_deleted = false')
            .orderBy('employee.division', 'ASC')
            .getRawMany();
        return results.map((res) => res.division);
    }
    async findAllSections() {
        const results = await this.employeeRepository
            .createQueryBuilder('employee')
            .select('DISTINCT employee.section', 'section')
            .where('employee.is_active = true AND employee.is_deleted = false')
            .orderBy('employee.section', 'ASC')
            .getRawMany();
        return results.map((res) => res.section);
    }
    async findAllDepartments() {
        const results = await this.employeeRepository
            .createQueryBuilder('employee')
            .select('DISTINCT employee.departement', 'departement')
            .where('employee.departement IS NOT NULL')
            .andWhere('employee.is_active = true AND employee.is_deleted = false')
            .orderBy('employee.departement', 'ASC')
            .getRawMany();
        return results.map((res) => res.departement);
    }
    async findAllLines() {
        const results = await this.employeeRepository
            .createQueryBuilder('employee')
            .select('DISTINCT employee.line', 'line')
            .where('employee.line IS NOT NULL')
            .andWhere('employee.is_active = true AND employee.is_deleted = false')
            .orderBy('employee.line', 'ASC')
            .getRawMany();
        return results.map((res) => res.line);
    }
    findAll() {
        return this.employeeRepository.find({ order: { matricule: 'ASC' } });
    }
    findOne(id) {
        return this.employeeRepository.findOne({ where: { id }, relations: ['manager', 'user'] });
    }
    update(id, updateEmployeeDto) {
        return this.employeeRepository.update(id, updateEmployeeDto);
    }
    async updateEmployee(id, updateEmployeeDto, res, managerId) {
        delete updateEmployeeDto.managerId;
        console.log(updateEmployeeDto);
        try {
            const employee = await this.employeeRepository.findOne({ where: { id } });
            if (!employee) {
                return res.status(404).redirect('/employee/edit/' + id + '?error=Employee not found');
            }
            const manager = await this.userRepository.findOne({ where: { employee: { id: managerId } } });
            if (!manager && managerId !== '')
                return res.status(404).redirect('/employee/edit/' + id + '?error=Manager not found');
            if (managerId === '' || manager == null) {
                await this.employeeRepository.update(id, { ...updateEmployeeDto });
            }
            else {
                const m = await this.employeeRepository.findOne({ where: { id: managerId } });
                await this.employeeRepository.update(id, { ...updateEmployeeDto, manager: m });
            }
            return res.redirect('/employee/details/' + id);
        }
        catch (error) {
            console.log(error);
            return res.status(500).redirect('/employee/edit/' + id + '?error=' + error.message);
        }
    }
    remove(id) {
        return this.employeeRepository.delete(id);
    }
    async processExcelBuffer(file) {
        const salt = bcrypt.genSaltSync(10);
        const workbook = new ExcelJS.Workbook();
        if (file.originalname.endsWith('.xls')) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet);
            const filtered = rows.map(row => ({
                type: row['Type'],
                departement: row['Dept'],
                section: row['Sect'],
                line: row['Line'],
                matricule: row['Emp Id'],
                gender: row['Gender'],
                DOE: row['D.O.E'],
                division: row['Division'],
                name: row['Name'],
                firstname: row['Firstname'],
                job_level: row['Job Level'],
                designation: row['Designation'],
                site: row['Sit'],
                app_password: bcrypt.hashSync("" + row['App password'], salt),
                onehr_password: this.cryptoService.encrypt(String(row['Onehr password'])),
            }));
            const cleanData = filtered.filter(x => x.matricule);
            try {
                await this.employeeRepository
                    .createQueryBuilder()
                    .insert()
                    .into(employee_entity_1.Employee)
                    .values(cleanData)
                    .orUpdate([
                    'type',
                    'departement',
                    'section',
                    'line',
                    'gender',
                    'DOE',
                    'division',
                    'name',
                    'firstname',
                    'job_level',
                    'designation',
                    'app_password',
                    'onehr_password',
                ], ['matricule'])
                    .execute();
            }
            catch (e) {
                console.log(e);
            }
            return {
                result: 'success',
                message: 'Master file imported successfully',
            };
        }
        await workbook.xlsx.load(file.buffer);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
            throw new Error('Aucune feuille trouvée dans le fichier Excel');
        }
        const headerRow = worksheet.getRow(1);
        const headerMap = {};
        headerRow.eachCell((cell, colNumber) => {
            const headerName = cell.value?.toString().trim().toLowerCase();
            if (headerName) {
                headerMap[headerName] = colNumber;
            }
        });
        const requiredColumns = ['emp id', 'type', 'division'];
        for (const column of requiredColumns) {
            if (!headerMap[column]) {
                throw new Error(`Missing column: ${column}`);
            }
        }
        const employees = [];
        for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            employees.push({
                type: row.getCell(headerMap['type']).value?.toString(),
                departement: row.getCell(headerMap['dept']).value?.toString(),
                section: row.getCell(headerMap['sect']).value?.toString(),
                line: row.getCell(headerMap['line']).value?.toString(),
                matricule: row.getCell(headerMap['emp id']).value?.toString(),
                gender: row.getCell(headerMap['gender']).value?.toString(),
                DOE: row.getCell(headerMap['d.o.e']).value,
                division: row.getCell(headerMap['division']).value?.toString(),
                name: row.getCell(headerMap['name']).value?.toString(),
                firstname: row.getCell(headerMap['firstname']).value?.toString(),
                job_level: row.getCell(headerMap['job level']).value?.toString(),
                designation: row.getCell(headerMap['designation']).value?.toString(),
                site: row.getCell(headerMap['sit']).value?.toString(),
            });
        }
        await this.employeeRepository
            .createQueryBuilder()
            .insert()
            .into(employee_entity_1.Employee)
            .values(employees)
            .orUpdate([
            'type',
            'departement',
            'section',
            'line',
            'gender',
            'DOE',
            'division',
            'name',
            'firstname',
            'job_level',
            'designation',
            'site',
        ], ['matricule'])
            .execute();
        return {
            result: 'success',
            message: 'Master file imported successfully',
        };
    }
    async getEmployeeSolde(matricule, at) {
        const year = at.getFullYear();
        const employee = await this.employeeRepository.findOne({ where: { matricule } });
        if (!employee)
            return { solde_cumul: 0, solde_pris: 0, solde_restant: 0 };
        const takenLeaves = await this.leaveRepository.find({
            where: {
                employee: { id: employee.id },
                status: leave_entity_1.LeaveStatus.APPROVED,
                leave_type: 'Local_Leave_AMD',
                start_date: (0, typeorm_2.LessThanOrEqual)(at),
            },
        });
        let soldeCumul = 0;
        const getCumul = (date) => {
            let cumul = 0;
            for (let m = 0; m <= date.getMonth(); m++) {
                const daysInMonth = new Date(date.getFullYear(), m + 1, 0).getDate();
                if (m === date.getMonth()) {
                    cumul += (2.5 / daysInMonth) * date.getDate();
                }
                else {
                    cumul += 2.5;
                }
            }
            return cumul;
        };
        if (year < at.getFullYear()) {
            soldeCumul = 2.5 * 12;
        }
        else if (year > at.getFullYear()) {
            soldeCumul = 0;
        }
        else {
            soldeCumul = getCumul(at);
        }
        const yearAfterDOE = new Date(employee.DOE);
        yearAfterDOE.setFullYear(yearAfterDOE.getFullYear() + 1);
        if (at.getFullYear() === yearAfterDOE.getFullYear()) {
            soldeCumul = soldeCumul - getCumul(yearAfterDOE);
        }
        else if (at.getFullYear() <= yearAfterDOE.getFullYear()) {
            soldeCumul = 0;
        }
        let pris = 0;
        for (const leave of takenLeaves) {
            const holidays = await this.getDaysTakenWithHoliday(new Date(leave.start_date).toISOString().split('T')[0], new Date(leave.end_date).toISOString().split('T')[0]);
            pris +=
                this.calculateDaysBetween(new Date(leave.start_date), new Date(leave.end_date)) - holidays;
        }
        const restant = soldeCumul - pris;
        const result = {
            ...employee,
            solde_cumul: Number(soldeCumul.toFixed(2)),
            solde_pris: Number(pris.toFixed(2)),
            solde_restant: Number(restant.toFixed(2)),
        };
        return result;
    }
    async searchForUser(q, user) {
        const allowedSites = this.getAllowedSites(user.site);
        if (!q)
            return [];
        const year = new Date().getFullYear();
        const queryBuilder = this.employeeRepository
            .createQueryBuilder('e')
            .leftJoin('e.user', 'u')
            .where('(e.matricule LIKE :q OR e.name LIKE :q OR e.firstname LIKE :q)', { q: `%${q}%` })
            .andWhere('e.is_active = true')
            .andWhere('e.is_deleted = false')
            .andWhere('u.id IS NULL')
            .select([
            'e.id',
            'e.matricule',
            'e.name',
            'e.firstname',
            'e.line',
            'e.departement',
            'e.section',
            'e.site',
            'e.DOE',
        ])
            .take(10);
        if (user.role === user_entity_1.UserRole.MANAGER) {
            queryBuilder.andWhere('e.manager = :managerId', { managerId: user.employee.id });
        }
        else {
            queryBuilder.andWhere('e.site IN (:...allowedSites)', { allowedSites });
        }
        const [data] = await queryBuilder.getManyAndCount();
        if (data.length === 0 || !data)
            return [];
        const date = new Date(data[0].DOE);
        date.setFullYear(date.getFullYear() + 1);
        let yearAfter3 = date.getFullYear();
        while (2026 - yearAfter3 > 3) {
            yearAfter3 = yearAfter3 + 3;
        }
        date.setFullYear(yearAfter3);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const takenLeaves = await this.leaveRepository
            .createQueryBuilder('leave')
            .leftJoin('leave.employee', 'employee')
            .select('employee.id', 'employeeId')
            .addSelect('leave.start_date', 'start_date')
            .addSelect('leave.end_date', 'end_date')
            .addSelect('SUM(DATEDIFF(leave.end_date, leave.start_date) + 1)', 'daysTaken')
            .where('employee.id IN (:...employeeIds)', { employeeIds: data.map((e) => e.id) })
            .andWhere('leave.status = :status', { status: leave_entity_1.LeaveStatus.APPROVED })
            .andWhere('leave.leave_type = :type', { type: 'Local_Leave_AMD' })
            .andWhere('YEAR(leave.start_date) = :year', { year })
            .andWhere('leave.start_date <= :today', { today })
            .andWhere('employee.site IN (:...allowedSites)', { allowedSites })
            .groupBy('employee.id')
            .getRawMany();
        const takenPermissions = await this.leaveRepository
            .createQueryBuilder('leave')
            .leftJoin('leave.employee', 'employee')
            .select('employee.id', 'employeeId')
            .addSelect('leave.start_date', 'start_date')
            .addSelect('leave.end_date', 'end_date')
            .addSelect('SUM(DATEDIFF(leave.end_date, leave.start_date) + 1)', 'daysTaken')
            .where('employee.id IN (:...employeeIds)', { employeeIds: data.map((e) => e.id) })
            .andWhere('leave.status = :status', { status: leave_entity_1.LeaveStatus.APPROVED })
            .andWhere('leave.leave_type = :type', { type: 'Permission_AMD' })
            .andWhere('YEAR(leave.start_date) = :year', { year })
            .andWhere('leave.start_date <= :today', { today })
            .andWhere('employee.site IN (:...allowedSites)', { allowedSites })
            .groupBy('employee.id')
            .getRawMany();
        const takenLeavesMap = new Map();
        const takenPermissionsMap = new Map();
        takenLeaves.forEach(async (l) => {
            const holidays = await this.getDaysTakenWithHoliday(l.start_date, l.end_date);
            const daysTaken = Number(l.daysTaken) - holidays;
            takenLeavesMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
        });
        takenPermissions.forEach(async (l) => {
            const holidays = await this.getDaysTakenWithHoliday(l.start_date, l.end_date);
            const daysTaken = Number(l.daysTaken) - holidays;
            takenPermissionsMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
        });
        let soldeCumul = 0;
        if (year < today.getFullYear()) {
            soldeCumul = 2.5 * 12;
        }
        else if (year > today.getFullYear()) {
            soldeCumul = 0;
        }
        else {
            for (let m = 0; m <= today.getMonth(); m++) {
                const daysInMonth = new Date(year, m + 1, 0).getDate();
                if (m === today.getMonth()) {
                    soldeCumul += (2.5 / daysInMonth) * today.getDate();
                }
                else {
                    soldeCumul += 2.5;
                }
            }
        }
        const promises = data.map(async (emp) => {
            const cumulSolde = (await this.getEmployeeSolde(emp.matricule, today)).solde_cumul;
            const pris = takenLeavesMap.get(emp.id) || 0;
            const prisPermission = takenPermissionsMap.get(emp.id) || 0;
            const restant = cumulSolde - pris;
            const doeDate = new Date(emp.DOE);
            let soldeDebut = 0;
            if (year > doeDate.getFullYear() + 1) {
                const dateDebutCompte = new Date(doeDate.getFullYear() + 1, doeDate.getMonth(), doeDate.getDate());
                for (let i = dateDebutCompte.getFullYear(); i <= year; i += 3) {
                    if (year - i < 3) {
                        for (let y = i; y < year; y++) {
                            soldeDebut += (await this.getEmployeeSolde(emp.matricule, new Date(y, 11, 31))).solde_restant;
                        }
                    }
                }
            }
            function estDernierJourDuMois(date) {
                const annee = date.getFullYear();
                const mois = date.getMonth();
                const demain = new Date(date);
                demain.setDate(date.getDate() + 1);
                return demain.getMonth() !== mois;
            }
            let soldeCumulMensuel = 2.5 * today.getMonth();
            if (estDernierJourDuMois(today)) {
                soldeCumulMensuel = 2.5 * (today.getMonth() + 1);
            }
            return {
                ...emp,
                solde_cumul: Number(cumulSolde.toFixed(2)),
                solde_cumul_mensuel: Number(soldeCumulMensuel.toFixed(2)),
                solde_debut: Number(soldeDebut.toFixed(2)),
                solde_pris: Number(pris.toFixed(2)),
                solde_pris_permission: Number(prisPermission.toFixed(2)),
                solde_restant: Number((restant + soldeDebut).toFixed(2)),
                solde_restant_mensuel: Number((soldeCumulMensuel - pris).toFixed(2)),
            };
        });
        const results = await Promise.all(promises);
        return results;
    }
    async search(q, user) {
        const allowedSites = this.getAllowedSites(user.site);
        if (!q)
            return [];
        const year = new Date().getFullYear();
        const queryBuilder = this.employeeRepository
            .createQueryBuilder('e')
            .where('(e.matricule LIKE :q OR e.name LIKE :q OR e.firstname LIKE :q)', { q: `%${q}%` })
            .andWhere('e.is_active = true AND e.is_deleted = false')
            .select(['e.id', 'e.matricule', 'e.name', 'e.firstname', 'e.line', 'e.departement', 'e.section', 'e.site', 'e.section', 'e.DOE'])
            .take(10);
        if (user.role === user_entity_1.UserRole.MANAGER) {
            queryBuilder.andWhere('e.manager = :managerId', { managerId: user.employee.id });
        }
        else {
            queryBuilder.andWhere('e.site IN (:...allowedSites)', { allowedSites });
        }
        const [data] = await queryBuilder.getManyAndCount();
        if (data.length === 0 || !data)
            return [];
        const date = new Date(data[0].DOE);
        date.setFullYear(date.getFullYear() + 1);
        let yearAfter3 = date.getFullYear();
        while (2026 - yearAfter3 > 3) {
            yearAfter3 = yearAfter3 + 3;
        }
        date.setFullYear(yearAfter3);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const takenLeaves = await this.leaveRepository
            .createQueryBuilder('leave')
            .leftJoin('leave.employee', 'employee')
            .select('employee.id', 'employeeId')
            .addSelect('leave.start_date', 'start_date')
            .addSelect('leave.end_date', 'end_date')
            .addSelect('SUM(DATEDIFF(leave.end_date, leave.start_date) + 1)', 'daysTaken')
            .where('employee.id IN (:...employeeIds)', { employeeIds: data.map((e) => e.id) })
            .andWhere('leave.status = :status', { status: leave_entity_1.LeaveStatus.APPROVED })
            .andWhere('leave.leave_type = :type', { type: 'Local_Leave_AMD' })
            .andWhere('YEAR(leave.start_date) = :year', { year })
            .andWhere('leave.start_date <= :today', { today })
            .andWhere('employee.site IN (:...allowedSites)', { allowedSites })
            .groupBy('employee.id')
            .getRawMany();
        const takenPermissions = await this.leaveRepository
            .createQueryBuilder('leave')
            .leftJoin('leave.employee', 'employee')
            .select('employee.id', 'employeeId')
            .addSelect('leave.start_date', 'start_date')
            .addSelect('leave.end_date', 'end_date')
            .addSelect('SUM(DATEDIFF(leave.end_date, leave.start_date) + 1)', 'daysTaken')
            .where('employee.id IN (:...employeeIds)', { employeeIds: data.map((e) => e.id) })
            .andWhere('leave.status = :status', { status: leave_entity_1.LeaveStatus.APPROVED })
            .andWhere('leave.leave_type = :type', { type: 'Permission_AMD' })
            .andWhere('YEAR(leave.start_date) = :year', { year })
            .andWhere('leave.start_date <= :today', { today })
            .andWhere('employee.site IN (:...allowedSites)', { allowedSites })
            .groupBy('employee.id')
            .getRawMany();
        const takenLeavesMap = new Map();
        const takenPermissionsMap = new Map();
        takenLeaves.forEach(async (l) => {
            const holidays = await this.getDaysTakenWithHoliday(l.start_date, l.end_date);
            const daysTaken = Number(l.daysTaken) - holidays;
            takenLeavesMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
        });
        takenPermissions.forEach(async (l) => {
            const holidays = await this.getDaysTakenWithHoliday(l.start_date, l.end_date);
            const daysTaken = Number(l.daysTaken) - holidays;
            takenPermissionsMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
        });
        let soldeCumul = 0;
        if (year < today.getFullYear()) {
            soldeCumul = 2.5 * 12;
        }
        else if (year > today.getFullYear()) {
            soldeCumul = 0;
        }
        else {
            for (let m = 0; m <= today.getMonth(); m++) {
                const daysInMonth = new Date(year, m + 1, 0).getDate();
                if (m === today.getMonth()) {
                    soldeCumul += (2.5 / daysInMonth) * today.getDate();
                }
                else {
                    soldeCumul += 2.5;
                }
            }
        }
        const promises = data.map(async (emp) => {
            const cumulSolde = (await this.getEmployeeSolde(emp.matricule, today)).solde_cumul;
            const pris = takenLeavesMap.get(emp.id) || 0;
            const prisPermission = takenPermissionsMap.get(emp.id) || 0;
            const restant = cumulSolde - pris;
            const doeDate = new Date(emp.DOE);
            let soldeDebut = 0;
            if (year > doeDate.getFullYear() + 1) {
                const dateDebutCompte = new Date(doeDate.getFullYear() + 1, doeDate.getMonth(), doeDate.getDate());
                for (let i = dateDebutCompte.getFullYear(); i <= year; i += 3) {
                    if (year - i < 3) {
                        for (let y = i; y < year; y++) {
                            soldeDebut += (await this.getEmployeeSolde(emp.matricule, new Date(y, 11, 31))).solde_restant;
                        }
                    }
                }
            }
            function estDernierJourDuMois(date) {
                const annee = date.getFullYear();
                const mois = date.getMonth();
                const demain = new Date(date);
                demain.setDate(date.getDate() + 1);
                return demain.getMonth() !== mois;
            }
            let soldeCumulMensuel = 2.5 * today.getMonth();
            if (estDernierJourDuMois(today)) {
                soldeCumulMensuel = 2.5 * (today.getMonth() + 1);
            }
            return {
                ...emp,
                solde_cumul: Number(cumulSolde.toFixed(2)),
                solde_cumul_mensuel: Number(soldeCumulMensuel.toFixed(2)),
                solde_debut: Number(soldeDebut.toFixed(2)),
                solde_pris: Number(pris.toFixed(2)),
                solde_pris_permission: Number(prisPermission.toFixed(2)),
                solde_restant: Number((restant + soldeDebut).toFixed(2)),
                solde_restant_mensuel: Number((soldeCumulMensuel - pris).toFixed(2)),
            };
        });
        const results = await Promise.all(promises);
        return results;
    }
    async getActiveEmployeesNotOnLeave(date) {
        const today = new Date(date).toISOString().split('T')[0];
        return await this.employeeRepository
            .createQueryBuilder('employee')
            .where('employee.is_active = :isActive', { isActive: true })
            .andWhere('employee.is_deleted = :isDeleted', { isDeleted: false })
            .andWhere(qb => {
            const subQuery = qb
                .subQuery()
                .select('1')
                .from(leave_entity_1.Leave, 'leave')
                .where('leave.employee_id = employee.id')
                .andWhere('leave.status = :status')
                .andWhere(':today BETWEEN leave.start_date AND leave.end_date')
                .getQuery();
            return `NOT EXISTS ${subQuery}`;
        })
            .setParameter('status', 'APPROVED')
            .setParameter('today', today)
            .getCount();
    }
    async getEmployeesOnLeave(date) {
        const today = new Date(date).toISOString().split('T')[0];
        return await this.employeeRepository
            .createQueryBuilder('employee')
            .innerJoin('employee.leaves', 'leave', `
      leave.status = :status
      AND :today BETWEEN leave.start_date AND leave.end_date
      `, {
            status: 'APPROVED',
            today,
        })
            .where('employee.is_active = :isActive', { isActive: true })
            .andWhere('employee.is_deleted = :isDeleted', { isDeleted: false })
            .distinct(true)
            .getCount();
    }
    calculateSoldeCumulFromDate(startDate, carriedDays, targetDate) {
        let solde = carriedDays;
        let current = new Date(startDate);
        while (current.getFullYear() < targetDate.getFullYear() ||
            (current.getFullYear() === targetDate.getFullYear() &&
                current.getMonth() < targetDate.getMonth())) {
            solde += 2.5;
            current = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate());
        }
        if (current.getFullYear() === targetDate.getFullYear() &&
            current.getMonth() === targetDate.getMonth()) {
            const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
            solde += (2.5 / daysInMonth) * targetDate.getDate();
        }
        return Number(solde.toFixed(2));
    }
    calculateDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const diff = end.getTime() - start.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    }
    async getDaysTakenWithHoliday(startDate, endDate) {
        const holidays = await this.holidayService.findBetweenDate(startDate, endDate);
        const daysTakenWithHoliday = holidays.length;
        return daysTakenWithHoliday;
    }
    async findOneByMatricule(matricule) {
        return this.employeeRepository.findOneBy({ matricule });
    }
    async findOneByName(name) {
        return this.employeeRepository.findOneBy({ name });
    }
    async findByLine(line) {
        return this.employeeRepository.findBy({ line });
    }
    async findBySection(section) {
        return this.employeeRepository.findBy({ section });
    }
    async findByLineAndSection(line, section) {
        return this.employeeRepository.findBy({ line, section });
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_history_entity_1.EmployeeHistory)),
    __param(2, (0, typeorm_1.InjectRepository)(leave_entity_1.Leave)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(carried_forward_entity_1.CarriedForward)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        crypto_service_1.CryptoService,
        holiday_service_1.HolidayService,
        history_service_1.HistoryService])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map