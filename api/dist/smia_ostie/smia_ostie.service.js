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
exports.SmiaOstieService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const employee_entity_1 = require("../employee/entities/employee.entity");
const typeorm_2 = require("typeorm");
const smia_ostie_entity_1 = require("./entities/smia_ostie.entity");
const user_entity_1 = require("../user/entities/user.entity");
const mailer_1 = require("@nestjs-modules/mailer");
const history_entity_1 = require("../history/entities/history.entity");
const history_service_1 = require("../history/history.service");
const ExcelJS = require('exceljs');
let SmiaOstieService = class SmiaOstieService {
    config;
    SmiaOstieRepo;
    employeeRepo;
    configService;
    mailerService;
    historyService;
    constructor(config, SmiaOstieRepo, employeeRepo, configService, mailerService, historyService) {
        this.config = config;
        this.SmiaOstieRepo = SmiaOstieRepo;
        this.employeeRepo = employeeRepo;
        this.configService = configService;
        this.mailerService = mailerService;
        this.historyService = historyService;
    }
    async getManagerConsultations(managerId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.SmiaOstieRepo.find({
            where: { employee: { manager: { id: managerId } }, date: today },
            relations: ['employee'],
        });
    }
    getWeekRange() {
        const now = new Date();
        const day = now.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const monday = new Date(now);
        monday.setDate(now.getDate() + diffToMonday);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        return { monday, sunday };
    }
    getAllowedSites(userSite) {
        if (userSite === user_entity_1.Site.MADA) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2, user_entity_1.Site.TANA];
        }
        if (userSite === user_entity_1.Site.ANTSIRABE) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2];
        }
        return [userSite];
    }
    async toExport(search, user, startDate, endDate) {
        const allowedSites = this.getAllowedSites(user.site);
        const query = this.SmiaOstieRepo.createQueryBuilder('ms')
            .leftJoinAndSelect('ms.employee', 'employee')
            .andWhere('employee.site IN (:...sites)', { sites: allowedSites });
        if (search && search.trim() !== '') {
            query.andWhere('(employee.matricule LIKE :s OR employee.fullname LIKE :s)', { s: `%${search}%` });
        }
        if (startDate && startDate.trim() !== '') {
            query.andWhere('ms.date >= :startDate', { startDate });
        }
        if (endDate && endDate.trim() !== '') {
            query.andWhere('ms.date <= :endDate', { endDate });
        }
        const data = await query.getMany();
        return data;
    }
    async paginateMedicalService(search, page, limit, user, startDate, endDate) {
        const allowedSites = this.getAllowedSites(user.site);
        const query = this.SmiaOstieRepo.createQueryBuilder('ms')
            .leftJoinAndSelect('ms.employee', 'employee')
            .andWhere('employee.site IN (:...sites)', { sites: allowedSites });
        if (search && search.trim() !== '') {
            query.andWhere('(employee.matricule LIKE :s OR employee.fullname LIKE :s)', { s: `%${search}%` });
        }
        if (startDate && startDate.trim() !== '') {
            query.andWhere('ms.date >= :startDate', { startDate });
        }
        if (endDate && endDate.trim() !== '') {
            query.andWhere('ms.date <= :endDate', { endDate });
        }
        const total = await query.getCount();
        const data = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return { data, total, totalPages: Math.ceil(total / limit) };
    }
    async countByDayForCurrentWeek(site) {
        const { monday, sunday } = this.getWeekRange();
        const raw = await this.SmiaOstieRepo
            .createQueryBuilder('s')
            .leftJoin('s.employee', 'e')
            .select('DAYOFWEEK(s.date_at)', 'day')
            .addSelect('COUNT(*)', 'count')
            .where('s.date_at BETWEEN :monday AND :sunday', { monday, sunday })
            .andWhere('e.site = :site', { site })
            .groupBy('day')
            .getRawMany();
        const result = [0, 0, 0, 0, 0, 0, 0];
        raw.forEach(r => {
            const mysqlDay = Number(r.day);
            const index = mysqlDay === 1 ? 6 : mysqlDay - 2;
            result[index] = Number(r.count);
        });
        return result;
    }
    async create(createSmiaOstieDto) {
        const employee = await this.employeeRepo.findOne({ where: { matricule: createSmiaOstieDto.employee }, relations: ['manager'] });
        if (!employee) {
            return {
                "status": "error",
                "message": "Matricule introuvable"
            };
        }
        const date = createSmiaOstieDto.date
            ? new Date(createSmiaOstieDto.date)
            : new Date();
        date.setHours(0, 0, 0, 0);
        const existingSmiaOstie = await this.SmiaOstieRepo.findOne({
            where: {
                employee: { matricule: createSmiaOstieDto.employee },
                date: date,
            },
        });
        if (existingSmiaOstie) {
            return {
                "status": "error",
                "message": "L'employé est déjà inscrit pour cette date."
            };
        }
        const smia = await this.SmiaOstieRepo.create({
            ...createSmiaOstieDto,
            employee,
        });
        const consultation = await this.SmiaOstieRepo.save(smia);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.CONSULTATION_MEDICAL,
            message: "New consultation " + consultation.reason + " of " + consultation.employee.name + " " + consultation.employee.firstname + " requested by QUIOSQUE",
            created_by: consultation.employee.matricule,
        });
        var email = [];
        const manager = employee.manager;
        if (manager)
            email.push(manager.user?.email ?? '');
        const emailAdress = this.configService.get('EMAIL_ADRESS');
        const emailPassword = this.configService.get('EMAIL_PASSWORD');
        if (email.length > 0) {
            if (emailAdress && emailPassword) {
                await this.mailerService.sendMail({
                    to: email,
                    subject: 'Consultation médicale',
                    text: 'Consultation médicale',
                    html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
        <p>
          Bonjour Monsieur/Madame,
        </p>
        <p>
          Un membre de votre équipe ayant la matricule <strong>${employee.matricule} (${employee.name} ${employee.firstname})</strong> a envoyé une demande de consultation médicale sur <a href="http://localhost:4000/smia-ostie/list" target="_blank">B-Leave</a>.
        </p>
        <p>
          <strong>
            Date de consultation: ${consultation.date}<br>
            Raison: ${consultation.reason}<br>
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
          A member of your team with matricule <strong>${employee.matricule} (${employee.name} ${employee.firstname})</strong> has taken a medical consultation on <a href="http://localhost:4000/smia-ostie/list" target="_blank">B-Leave</a>.
        </p>
        <p>
          <strong>
            Consultation date: ${consultation.date}<br>
            Reason: ${consultation.reason}<br>
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
        return consultation;
    }
    async findAll() {
        return await this.SmiaOstieRepo.find();
    }
    async findOne(id) {
        return await this.SmiaOstieRepo.findOne({ relations: ['employee', 'employee.user'], where: { id } });
    }
    async update(id, updateSmiaOstieDto) {
        let employeeEntity;
        if (updateSmiaOstieDto.employee) {
            employeeEntity = await this.employeeRepo.findOne({
                where: { matricule: updateSmiaOstieDto.employee },
            });
            if (!employeeEntity) {
                throw new common_1.NotFoundException("Matricule introuvable");
            }
        }
        const updatePayload = {
            ...updateSmiaOstieDto,
        };
        if (employeeEntity) {
            updatePayload.employee = employeeEntity;
        }
        return this.SmiaOstieRepo.update(id, updatePayload);
    }
    async remove(id) {
        return await this.SmiaOstieRepo.delete(id);
    }
    async findByDateDoingToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return this.SmiaOstieRepo.find({
            where: {
                date: (0, typeorm_2.Between)(today, tomorrow),
            },
        });
    }
    async paginateToday(page, limit) {
        const skip = (page - 1) * limit;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const [data, total] = await this.SmiaOstieRepo.findAndCount({
            where: {
                date_at: (0, typeorm_2.Between)(todayStart, todayEnd),
            },
            relations: ['employee'],
            skip,
            take: limit,
            order: { id: 'DESC' },
        });
        return {
            data,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
    async paginateHistory(date, search, page, limit) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.SmiaOstieRepo
            .createQueryBuilder('m')
            .leftJoinAndSelect('m.employee', 'e')
            .where('(e.matricule LIKE :search OR e.fullname LIKE :search OR e.departement LIKE :search OR m.reason LIKE :search)', { search: `%${search}%` })
            .andWhere(date ? 'DATE(m.date_at) = :date' : '1=1', { date })
            .orderBy('m.date_at', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findByDate(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return this.SmiaOstieRepo.find({
            where: {
                date: (0, typeorm_2.Between)(startOfDay, endOfDay),
            },
        });
    }
    async countToday() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        return this.SmiaOstieRepo.count({
            where: {
                date: (0, typeorm_2.Between)(startOfDay, endOfDay),
            },
        });
    }
    async getSmiaOstie(startDate, endDate, site) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return this.SmiaOstieRepo
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.employee', 'e')
            .where('p.date BETWEEN :start AND :end', { start, end })
            .andWhere('e.site = :site', { site })
            .getMany();
    }
    async exportSmiaOstieToExcel(data, res, startDate, endDate) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('MEDICAL SERVICE');
        worksheet.mergeCells('A1:H1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `MEDICAL SERVICE - from ${startDate} to ${endDate}`;
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
            'Status',
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
                p.employee.fullname,
                p.employee.site,
                p.reason,
                p.date,
                p.status,
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
        res.setHeader('Content-Disposition', `attachment; filename=medical_services_${startDate}_to_${endDate}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    }
    async getMedicalRateBySectionToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const sections = await this.employeeRepo
            .createQueryBuilder("employee")
            .leftJoin("employee.smia_ostie", "smia", `
      smia.status = :status
      AND smia.date >= :today
      AND smia.date < :tomorrow
      `, {
            status: "approved",
            today,
            tomorrow
        })
            .select("employee.section", "section")
            .addSelect("COUNT(DISTINCT employee.id)", "employees")
            .addSelect("COUNT(DISTINCT smia.employee_matricule)", "consultation")
            .where("employee.is_active = true")
            .groupBy("employee.section")
            .getRawMany();
        return sections
            .map(s => ({
            section: s.section,
            employees: Number(s.employees),
            consultation: Number(s.consultation),
            pct: Number(((Number(s.consultation) /
                Number(s.employees)) * 100).toFixed(0))
        }))
            .sort((a, b) => b.pct - a.pct);
    }
    async getMedicalConsultationByManager() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const employees = await this.employeeRepo.find({
            relations: {
                manager: true,
            }
        });
        const consultations = await this.SmiaOstieRepo.find({
            relations: {
                employee: true,
            },
            where: {
                date: (0, typeorm_2.Between)(today, tomorrow),
            }
        });
        const managerMap = new Map();
        employees.forEach(employee => {
            if (!employee.manager)
                return;
            const managerId = employee.manager.id;
            if (!managerMap.has(managerId)) {
                managerMap.set(managerId, {
                    id: managerId,
                    manager: employee.manager.name + ' ' + employee.manager.firstname,
                    consultation: 0,
                    employees: 0,
                    employeeIds: [],
                });
            }
            const entry = managerMap.get(managerId);
            entry.employeeIds.push(employee.id);
            entry.employees += 1;
        });
        consultations.forEach(consultation => {
            managerMap.forEach(entry => {
                if (entry.employeeIds.includes(consultation.employee?.id)) {
                    entry.consultation += 1;
                }
            });
        });
        const result = Array.from(managerMap.values()).map(entry => ({
            id: entry.id,
            manager: entry.manager,
            employees: entry.employees,
            consultation: entry.consultation,
            pct: entry.employees > 0
                ? Math.round((entry.consultation / entry.employees) * 100)
                : 0
        }));
        result.sort((a, b) => b.consultation - a.consultation);
        return result;
    }
};
exports.SmiaOstieService = SmiaOstieService;
exports.SmiaOstieService = SmiaOstieService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(smia_ostie_entity_1.SmiaOstie)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        mailer_1.MailerService,
        history_service_1.HistoryService])
], SmiaOstieService);
//# sourceMappingURL=smia_ostie.service.js.map