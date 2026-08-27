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
exports.Permission2hService = void 0;
const common_1 = require("@nestjs/common");
const permission2h_entity_1 = require("./entities/permission2h.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("../employee/entities/employee.entity");
const user_service_1 = require("../user/user.service");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../user/entities/user.entity");
const leave_entity_1 = require("../leave/entities/leave.entity");
const mailer_1 = require("@nestjs-modules/mailer");
const history_service_1 = require("../history/history.service");
const history_entity_1 = require("../history/entities/history.entity");
const ExcelJS = require('exceljs');
let Permission2hService = class Permission2hService {
    userService;
    employeeRepository;
    permission2hRepository;
    configService;
    mailerService;
    historyService;
    constructor(userService, employeeRepository, permission2hRepository, configService, mailerService, historyService) {
        this.userService = userService;
        this.employeeRepository = employeeRepository;
        this.permission2hRepository = permission2hRepository;
        this.configService = configService;
        this.mailerService = mailerService;
        this.historyService = historyService;
    }
    async rejectLeave(permissionId, userId) {
        const permission = await this.permission2hRepository.findOne({ where: { id: permissionId } });
        if (!permission) {
            throw new Error('Permission not found');
        }
        const user = await this.userService.findOne(userId);
        if (!user) {
            throw new Error('User not found');
        }
        permission.status = leave_entity_1.LeaveStatus.REJECTED;
        permission.approver = user;
        permission.approved_date = new Date();
        return this.permission2hRepository.save(permission);
    }
    async approveLeave(permissionId, userId) {
        const permission = await this.permission2hRepository.findOne({ where: { id: permissionId } });
        if (!permission) {
            throw new Error('Permission not found');
        }
        const user = await this.userService.findOne(userId);
        if (!user) {
            throw new Error('User not found');
        }
        permission.status = leave_entity_1.LeaveStatus.APPROVED;
        permission.approver = user;
        permission.approved_date = new Date();
        return this.permission2hRepository.save(permission);
    }
    async getNonApprouvedLeaves(id) {
        return this.permission2hRepository.find({ where: { employee: { manager: { id } }, status: leave_entity_1.LeaveStatus.PENDING }, relations: ['employee'], order: { date: 'ASC' } });
    }
    async paginatePermission2h(search, page, limit, startDate, endDate, site, user) {
        const skip = (page - 1) * limit;
        const query = this.permission2hRepository
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.employee', 'employee');
        if (user.role === user_entity_1.UserRole.MANAGER) {
            query.andWhere('employee.manager = :manager', { manager: user.employee.id });
        }
        if (search) {
            query.andWhere(`(
        employee.matricule LIKE :search
        OR employee.name LIKE :search
        OR employee.firstname LIKE :search
        OR p.id LIKE :search
        OR p.reason LIKE :search
        OR p.expectedStartTime LIKE :search
        OR p.expectedEndTime LIKE :search
        OR DATE(p.date) LIKE :search
      )`, { search: `%${search}%` });
        }
        if (site && site !== 'all') {
            query.andWhere('employee.site = :site', { site });
        }
        if (startDate) {
            query.andWhere('DATE(p.date) >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('DATE(p.date) <= :endDate', { endDate });
        }
        const [data, total] = await query
            .orderBy('p.date', 'DESC')
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
    async getToExport(search, startDate, endDate, site, user) {
        const query = this.permission2hRepository
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.employee', 'employee');
        if (user.role === user_entity_1.UserRole.MANAGER) {
            query.andWhere('employee.manager = :manager', { manager: user.id });
        }
        if (search) {
            query.andWhere(`(
        employee.matricule LIKE :search
        OR employee.name LIKE :search
        OR employee.firstname LIKE :search
        OR p.id LIKE :search
        OR p.reason LIKE :search
        OR p.expectedStartTime LIKE :search
        OR p.expectedEndTime LIKE :search
        OR DATE(p.date) LIKE :search
      )`, { search: `%${search}%` });
        }
        if (site && site !== 'all') {
            query.andWhere('employee.site = :site', { site });
        }
        if (startDate) {
            query.andWhere('DATE(p.date) >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('DATE(p.date) <= :endDate', { endDate });
        }
        const [data, total] = await query
            .orderBy('p.date', 'DESC')
            .getManyAndCount();
        return { data, total };
    }
    async paginatePermission2hById(id, search, page, limit, date) {
        console.log("ID:", id);
        const skip = (page - 1) * limit;
        const query = this.permission2hRepository
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.employee', 'employee')
            .where('p.id = :id', { id });
        if (date) {
            query.where('DATE(p.date) = :date', { date });
        }
        const [data, total] = await query
            .orderBy('p.date', 'DESC')
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
    async create(dto) {
        const employee = await this.employeeRepository.findOne({
            where: { matricule: dto.employee },
            relations: ['manager']
        });
        if (!employee) {
            throw new Error(`Employee with matricule ${dto.employee} not found`);
        }
        const entity = this.permission2hRepository.create({
            ...dto,
            employee,
        });
        const permission = await this.permission2hRepository.save(entity);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.PERMISSION_2H,
            message: "Permission 2h " + permission.date + " of " + permission.employee.name + " " + permission.employee.firstname + " requested by QUIOSQUE",
            created_by: dto.employee,
        });
        var email = [];
        const manager = employee.manager;
        if (manager) {
            const managerUser = await this.userService.findOneByMatricule(manager.matricule);
            if (managerUser)
                email.push(managerUser.email);
        }
        const emailAdress = this.configService.get('EMAIL_ADRESS');
        const emailPassword = this.configService.get('EMAIL_PASSWORD');
        if (email.length > 0) {
            if (emailAdress && emailPassword) {
                await this.mailerService.sendMail({
                    to: email,
                    subject: 'Permission 2h',
                    text: 'Permission 2h',
                    html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
        <p>
          Bonjour Monsieur/Madame,
        </p>
        <p>
          Nous souhaitons vous informer que l'employé(e) avec la matricule <strong>${employee.matricule} (${employee.name} ${employee.firstname})</strong> a pris une permission de deux heures.
        </p>
        <p>
          <strong>
            Raison: ${permission.reason}<br>
            Heure de départ: ${permission.expectedStartTime}<br>
            Heure d'arrivé: ${permission.expectedEndTime}<br>
          </strong>
        </p>
        <p>
          Cordialement,<br>
          L'équipe RH
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p>
          Hello Mister/Misses,
        </p>
        <p>
          We would like to inform you that the employee with matricule <strong>${employee.matricule} (${employee.name} ${employee.firstname})</strong> has taken a two-hour leave.
        </p>
        <p>
          <strong>
            Reason: ${permission.reason}<br>
            Start time: ${permission.expectedStartTime}<br>
            End time: ${permission.expectedEndTime}<br>
          </strong>
        </p>
        <p>
          Best regards,<br>
          HR Team
        </p>
      </div>
    `
                });
            }
        }
        return permission;
    }
    findAll() {
        return this.permission2hRepository.find();
    }
    findOne(id) {
        return this.permission2hRepository.findOne({
            where: { id },
            relations: [
                'employee',
                'employee.manager',
                'employee.manager.user'
            ]
        });
    }
    async getPermission2h(date, site) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        return this.permission2hRepository
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.employee', 'e')
            .where('p.date BETWEEN :start AND :end', { start, end })
            .andWhere('e.site = :site', { site })
            .getMany();
    }
    async exportPermission2hToExcel(data, res, date) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Permission 2h');
        worksheet.mergeCells('A1:H1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `PERMISSION 2H - ${date}`;
        titleCell.font = {
            size: 16,
            bold: true,
        };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.addRow([]);
        const headerRow = worksheet.addRow([
            'Matricule',
            'Full name',
            'Site',
            'Reason',
            'Date',
            'Quitted time',
            'Return time',
        ]);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFEEEEEE' },
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
        data.forEach((p) => {
            worksheet.addRow([
                p.employee.matricule,
                p.employee.name + " " + p.employee.firstname,
                p.employee.site,
                p.reason,
                p.date,
                p.expectedStartTime,
                p.expectedEndTime,
            ]);
        });
        worksheet.columns = [
            { width: 15 },
            { width: 30 },
            { width: 15 },
            { width: 30 },
            { width: 15 },
            { width: 20 },
            { width: 20 },
        ];
        worksheet.addRow([]);
        worksheet.addRow([`Exported on ${new Date().toLocaleString()}`]);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=permission2h_${date}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    }
    async update(id, dto) {
        const permission = await this.permission2hRepository.findOne({
            where: { id },
        });
        if (!permission) {
            throw new Error(`Permission with id ${id} not found`);
        }
        if (!dto.employee) {
            throw new Error(`Employee with id ${dto.employee} not found`);
        }
        let employee = await this.employeeRepository.findOne({
            where: { matricule: dto.employee },
        });
        if (!employee) {
            throw new Error(`Employee with matricule '${dto.employee}' not found`);
        }
        const updated = this.permission2hRepository.merge(permission, {
            ...dto,
            employee,
        });
        return await this.permission2hRepository.save(updated);
    }
    remove(id) {
        return this.permission2hRepository.delete(id);
    }
    async countToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return await this.permission2hRepository.count({
            where: {
                date: today,
            },
        });
    }
};
exports.Permission2hService = Permission2hService;
exports.Permission2hService = Permission2hService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(2, (0, typeorm_1.InjectRepository)(permission2h_entity_1.Permission2h)),
    __metadata("design:paramtypes", [user_service_1.UserService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        mailer_1.MailerService,
        history_service_1.HistoryService])
], Permission2hService);
//# sourceMappingURL=permission2h.service.js.map