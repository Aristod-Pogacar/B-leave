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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const leave_entity_1 = require("./entities/leave.entity");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("../employee/entities/employee.entity");
const ExcelJS = __importStar(require("exceljs"));
const user_entity_1 = require("../user/entities/user.entity");
const employee_service_1 = require("../employee/employee.service");
const config_1 = require("@nestjs/config");
const mailer_1 = require("@nestjs-modules/mailer");
const history_entity_1 = require("../history/entities/history.entity");
const history_service_1 = require("../history/history.service");
const permission2h_entity_1 = require("../permission2h/entities/permission2h.entity");
const smia_ostie_entity_1 = require("../smia_ostie/entities/smia_ostie.entity");
const carried_forward_service_1 = require("../carried-forward/carried-forward.service");
const carried_forward_entity_1 = require("../carried-forward/entities/carried-forward.entity");
const holiday_service_1 = require("../holiday/holiday.service");
let LeaveService = class LeaveService {
    leaveRepository;
    employeeRepository;
    userRepository;
    permission2hRepository;
    smiaOstieRepository;
    employeeService;
    configService;
    mailerService;
    historyService;
    carriedForwardService;
    carriedForwardRepository;
    holidayService;
    constructor(leaveRepository, employeeRepository, userRepository, permission2hRepository, smiaOstieRepository, employeeService, configService, mailerService, historyService, carriedForwardService, carriedForwardRepository, holidayService) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.permission2hRepository = permission2hRepository;
        this.smiaOstieRepository = smiaOstieRepository;
        this.employeeService = employeeService;
        this.configService = configService;
        this.mailerService = mailerService;
        this.historyService = historyService;
        this.carriedForwardService = carriedForwardService;
        this.carriedForwardRepository = carriedForwardRepository;
        this.holidayService = holidayService;
    }
    async getLeavesOverlap(matricule, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        start.setHours(0, 0, 0, 0);
        const leaves = await this.leaveRepository.find({
            where: {
                employee: { matricule: matricule },
                start_date: (0, typeorm_2.LessThanOrEqual)(end),
                end_date: (0, typeorm_2.MoreThanOrEqual)(start),
                status: (0, typeorm_2.In)([leave_entity_1.LeaveStatus.APPROVED, leave_entity_1.LeaveStatus.PENDING])
            },
            relations: ['employee']
        });
        return leaves;
    }
    async withdrawn(id) {
        const leave = await this.leaveRepository.findOne({ where: { id } });
        if (!leave) {
            throw new common_1.BadRequestException("Leave not found");
        }
        leave.status = leave_entity_1.LeaveStatus.WITHDRAWN;
        await this.leaveRepository.save(leave);
        return leave;
    }
    async approveWithdrawn(id, userId) {
        const leave = await this.leaveRepository.findOne({ where: { id }, relations: ['employee'] });
        if (!leave) {
            throw new common_1.BadRequestException("Leave not found");
        }
        leave.status = leave_entity_1.LeaveStatus.WITHDRAWN;
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['employee'] });
        await this.leaveRepository.save(leave);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.LEAVE,
            message: "Wthdrawn leave " + leave.id + " (" + leave.start_date + " to " + leave.end_date + " of " + leave.leave_type + ") by " + user?.employee?.firstname + " " + user?.employee?.name,
            created_by: "" + user?.employee?.matricule,
        });
        return leave;
    }
    async findLeavesNotDone(limit) {
        return this.leaveRepository.find({ where: { onehr_status: false }, relations: ['employee'], order: { start_date: 'ASC' }, take: limit });
    }
    async doneLeave(leave) {
        leave.onehr_status = true;
        return this.leaveRepository.save(leave);
    }
    async getNonApprouvedLeaves(user, typeLeaves = ['Local_Leave_AMD', 'Indisponibilite_AMD']) {
        var leaves;
        const today = new Date();
        if (user.role === user_entity_1.UserRole.HR_LEAD) {
            leaves = await this.leaveRepository.find({
                where: {
                    employee: {
                        is_active: true,
                        is_deleted: false
                    },
                    status: leave_entity_1.LeaveStatus.PENDING,
                    leave_type: (0, typeorm_2.In)(typeLeaves)
                },
                relations: [
                    'employee',
                    'employee.manager',
                    'employee.manager.manager'
                ],
                order: { created_at: 'ASC' }
            });
            return leaves.filter(leave => {
                const start = new Date(leave.start_date);
                const daysBefore = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return daysBefore <= 3;
            });
        }
        else if (user.role === user_entity_1.UserRole.SUPERADMIN) {
            leaves = await this.leaveRepository.find({
                where: {
                    employee: {
                        is_active: true,
                        is_deleted: false
                    },
                    status: leave_entity_1.LeaveStatus.PENDING,
                    leave_type: (0, typeorm_2.In)(typeLeaves)
                },
                relations: [
                    'employee',
                    'employee.manager',
                    'employee.manager.manager'
                ],
                order: { created_at: 'ASC' }
            });
            return leaves;
        }
        else {
            const employee = await this.employeeRepository.findOne({
                where: { user: { id: user.id } },
                relations: ['manager', 'user']
            });
            if (!employee)
                return [];
            leaves = await this.leaveRepository.find({
                where: {
                    employee: {
                        manager: [
                            { id: employee.id },
                            { manager: { id: employee.id } }
                        ],
                        is_active: true,
                        is_deleted: false
                    },
                    status: leave_entity_1.LeaveStatus.PENDING,
                    leave_type: (0, typeorm_2.In)(typeLeaves)
                },
                relations: [
                    'employee',
                    'employee.manager',
                    'employee.manager.manager'
                ],
                order: { created_at: 'ASC' }
            });
            return leaves.filter(leave => {
                const start = new Date(leave.start_date);
                const daysBefore = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (leave.employee.manager?.id === employee.id) {
                    return true;
                }
                if (leave.employee.manager?.manager?.id === employee.id) {
                    return daysBefore <= 5;
                }
                return false;
            });
        }
    }
    async getPermissions(user, startDate, endDate, status) {
        if (user.role == user_entity_1.UserRole.MANAGER) {
            return this.leaveRepository.find({
                where: {
                    start_date: (0, typeorm_2.Between)(new Date(startDate), new Date(endDate)),
                    employee: {
                        manager: {
                            id: user.employee?.id
                        },
                        is_active: true,
                        is_deleted: false
                    },
                    status: (0, typeorm_2.In)([
                        leave_entity_1.LeaveStatus.APPROVED,
                        leave_entity_1.LeaveStatus.PENDING
                    ]),
                    leave_type: "Permission_AMD"
                },
                relations: [
                    'employee',
                    'approver'
                ]
            });
        }
        const allowedSites = this.getAllowedSites(user.site);
        return this.leaveRepository.find({
            where: {
                start_date: (0, typeorm_2.Between)(new Date(startDate), new Date(endDate)),
                employee: {
                    site: (0, typeorm_2.In)(allowedSites),
                    is_active: true,
                    is_deleted: false
                },
                status: (0, typeorm_2.In)([
                    leave_entity_1.LeaveStatus.APPROVED,
                    leave_entity_1.LeaveStatus.PENDING
                ]),
                leave_type: 'Permission_AMD'
            },
            relations: [
                'employee',
                'approver'
            ]
        });
    }
    async approveLeave(leaveId, id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const leave = await this.leaveRepository.findOne({ where: { id: leaveId } });
        if (!leave) {
            throw new common_1.NotFoundException('Leave not found');
        }
        leave.approver = user;
        leave.approved_date = new Date();
        leave.status = leave_entity_1.LeaveStatus.APPROVED;
        return this.leaveRepository.save(leave);
    }
    async rejectLeave(leaveId, id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const leave = await this.leaveRepository.findOne({ where: { id: leaveId } });
        if (!leave) {
            throw new common_1.NotFoundException('Leave not found');
        }
        leave.approver = user;
        leave.approved_date = new Date();
        leave.status = leave_entity_1.LeaveStatus.REJECTED;
        return this.leaveRepository.save(leave);
    }
    async getLeavesByRange(year, startMonth, endMonth, line, departement, section, division, site, user, search) {
        if (user.role == user_entity_1.UserRole.MANAGER) {
            if (search && search.trim() !== "") {
                return this.leaveRepository.find({
                    where: {
                        start_date: (0, typeorm_2.Between)(new Date(year, startMonth, 0), new Date(year, endMonth + 1, 0)),
                        employee: [
                            { manager: { id: user.employee?.id }, matricule: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                            { manager: { id: user.employee?.id }, name: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                            { manager: { id: user.employee?.id }, firstname: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                            { manager: { id: user.employee?.id }, division: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                            { manager: { id: user.employee?.id }, section: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        ],
                        status: (0, typeorm_2.In)([
                            leave_entity_1.LeaveStatus.APPROVED,
                            leave_entity_1.LeaveStatus.PENDING
                        ])
                    },
                    relations: [
                        'employee',
                        'approver'
                    ]
                });
            }
            return this.leaveRepository.find({
                where: {
                    start_date: (0, typeorm_2.Between)(new Date(year, startMonth, 0), new Date(year, endMonth + 1, 0)),
                    employee: {
                        manager: {
                            id: user.employee?.id
                        },
                        is_active: true,
                        is_deleted: false
                    },
                    status: (0, typeorm_2.In)([
                        leave_entity_1.LeaveStatus.APPROVED,
                        leave_entity_1.LeaveStatus.PENDING
                    ])
                },
                relations: [
                    'employee',
                    'approver'
                ]
            });
        }
        if (search && search.trim() !== "") {
            return this.leaveRepository.find({
                where: {
                    start_date: (0, typeorm_2.Between)(new Date(year, startMonth, 0), new Date(year, endMonth + 1, 0)),
                    employee: [
                        { matricule: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        { name: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        { firstname: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        { division: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                        { section: (0, typeorm_2.Like)(`%${search}%`), is_active: true, is_deleted: false },
                    ],
                    status: (0, typeorm_2.In)([
                        leave_entity_1.LeaveStatus.APPROVED,
                        leave_entity_1.LeaveStatus.PENDING
                    ])
                },
                relations: [
                    'employee',
                    'approver'
                ]
            });
        }
        return this.leaveRepository.find({
            where: {
                start_date: (0, typeorm_2.Between)(new Date(year, startMonth, 0), new Date(year, endMonth + 1, 0)),
                employee: {
                    line,
                    section,
                    division,
                    site,
                    is_active: true,
                    is_deleted: false
                },
                status: (0, typeorm_2.In)([
                    leave_entity_1.LeaveStatus.APPROVED,
                    leave_entity_1.LeaveStatus.PENDING
                ])
            },
            relations: [
                'employee',
                'approver'
            ]
        });
    }
    getLeavesByMonthAndLineAndDepartement(year, month, line, departement, site) {
        return this.leaveRepository.find({
            where: {
                start_date: (0, typeorm_2.Between)(new Date(year, month, 1), new Date(year, month, 31)),
                employee: { line, departement, site, is_active: true, is_deleted: false },
                status: (0, typeorm_2.In)([leave_entity_1.LeaveStatus.APPROVED, leave_entity_1.LeaveStatus.PENDING])
            },
            relations: ['employee', 'approver']
        });
    }
    async create(createLeaveDto, res, req) {
        const employee = await this.employeeRepository.findOne({
            where: { id: createLeaveDto.employee, is_active: true, is_deleted: false },
            relations: ['manager']
        });
        if (!employee) {
            return res.status(500).redirect('/leave/new-leave?error=employeeNotFound');
        }
        const leave = await this.leaveRepository.create({
            ...createLeaveDto,
            employee,
        });
        const startDate = new Date(createLeaveDto.start_date);
        const endDate = new Date(createLeaveDto.end_date);
        if (startDate > endDate) {
            return res.status(500).redirect('/leave/new-leave?error=startDateAfterEndDate');
        }
        const nbDate = endDate.getTime() - startDate.getTime();
        leave.duration = (nbDate / (1000 * 60 * 60 * 24)) + 1;
        const leaveSaved = await this.leaveRepository.save(leave);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.LEAVE,
            message: "New leave " + leaveSaved.id + " by " + req.session.user.employee.firstname + " " + req.session.user.employee.name,
            created_by: req.session.user.matricule,
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
          Un membre de votre équipe ayant la matricule <strong>${employee.matricule} (${employee.name} ${employee.firstname})</strong> a envoyé une demande de congé et a besoin de votre approbation sur <a href="http://localhost:3000/leave/approuve-leaves" target="_blank">B-Leave</a>.
        </p>
        <p>
          <strong>
            Date de debut: ${leaveSaved.start_date}<br>
            Date de fin: ${leaveSaved.end_date}<br>
            Raison: ${leaveSaved.reason}<br>
            Type de conge: ${leaveSaved.leave_type}<br>
            Durée: ${leaveSaved.duration}<br>
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
          A member of your team with matricule <strong>${employee.matricule} (${employee.name} ${employee.firstname})</strong> has taken a leave and need your approval on <a href="http://localhost:3000/leave/approuve-leaves" target="_blank">B-Leave</a>.
        </p>
        <p>
          <strong>
            Starting date: ${leaveSaved.start_date}<br>
            Ending date: ${leaveSaved.end_date}<br>
            Reason: ${leaveSaved.reason}<br>
            Leave type: ${leaveSaved.leave_type}<br>
            Duration: ${leaveSaved.duration}<br>
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
        return res.status(200).redirect('/leave/planning-view?line=' + employee.line + '&departement=' + employee.departement);
    }
    async importLeaves(file, userId) {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer);
            const worksheet = workbook.getWorksheet("Leaves");
            if (!worksheet) {
                const message = 'No sheet found in the Excel file';
                throw new Error(message);
            }
            const headerRow = worksheet.getRow(1);
            const headerMap = {};
            headerRow.eachCell((cell, colNumber) => {
                const headerName = cell.value?.toString().trim().toLowerCase();
                if (headerName) {
                    headerMap[headerName] = colNumber;
                }
            });
            const requiredColumns = ['matricule', 'fullname', 'type', 'start date', 'end date', 'reason'];
            for (const column of requiredColumns) {
                if (!headerMap[column]) {
                    throw new Error(`Missing column: ${column}`);
                }
            }
            const leaves = [];
            for (let i = 2; i <= worksheet.rowCount; i++) {
                const row = worksheet.getRow(i);
                console.log(row.getCell(headerMap['matricule']).value?.toString());
                const employee = await this.employeeRepository.findOne({ where: { matricule: row.getCell(headerMap['matricule']).value?.toString() } });
                let leave_type = row.getCell(headerMap['type']).value?.toString();
                if (leave_type === "Local Leave") {
                    leave_type = "Local_Leave_AMD";
                }
                else if (leave_type === "Permission") {
                    leave_type = "Permission_AMD";
                }
                else if (leave_type === "Indisponibilite") {
                    leave_type = "Indisponibilite_AMD";
                }
                if (!employee) {
                    continue;
                }
                const user = await this.userRepository.findOne({ where: { id: userId } });
                if (!user) {
                    continue;
                }
                const startDate = row.getCell(headerMap['start date']).value;
                const endDate = row.getCell(headerMap['end date']).value;
                const reason = row.getCell(headerMap['reason']).value;
                const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
                const data = {
                    employee: employee,
                    leave_type: leave_type,
                    start_date: startDate,
                    end_date: endDate,
                    duration: duration,
                    status: leave_entity_1.LeaveStatus.APPROVED,
                    imported: true,
                    reason: reason,
                    approver: user,
                    approved_date: new Date(),
                };
                leaves.push(data);
            }
            await this.leaveRepository.save(leaves);
            return {
                result: 'success',
                message: 'File readed successfully',
            };
        }
        catch (error) {
            return {
                result: 'error',
                message: error.message,
            };
        }
    }
    async importCarriedForwardLeaves(file, date) {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer);
            const worksheet = workbook.getWorksheet("Carried");
            if (!worksheet) {
                const message = 'Aucune feuille trouvée dans le fichier Excel';
                throw new Error(message);
            }
            const headerRow = worksheet.getRow(1);
            const headerMap = {};
            headerRow.eachCell((cell, colNumber) => {
                const headerName = cell.value?.toString().trim().toLowerCase();
                if (headerName) {
                    headerMap[headerName] = colNumber;
                }
            });
            const requiredColumns = ['matricule', 'fullname', 'carried forward', 'taken', 'current balance'];
            for (const column of requiredColumns) {
                if (!headerMap[column]) {
                    throw new Error(`Missing column: ${column}`);
                }
            }
            const carriedForwards = [];
            for (let i = 2; i <= worksheet.rowCount; i++) {
                const row = worksheet.getRow(i);
                console.log('ROW:', i);
                const employee = await this.employeeRepository.findOne({ where: { matricule: row.getCell(headerMap['matricule']).value?.toString() } });
                if (!employee) {
                    continue;
                }
                const carriedForward = new carried_forward_entity_1.CarriedForward();
                carriedForward.employee = employee;
                carriedForward.days = Number(row.getCell(headerMap['carried forward']).value);
                carriedForward.daysTaken = Number(row.getCell(headerMap['taken']).value);
                carriedForward.date = new Date(date);
                carriedForwards.push(carriedForward);
            }
            await this.carriedForwardService.addAll(carriedForwards);
            return {
                result: 'success',
                message: 'File readed successfully',
            };
        }
        catch (error) {
            return {
                result: 'error',
                message: error.message,
            };
        }
    }
    async getEmployeeCumulativeBalance(employeeId = "", date) {
        if (!employeeId) {
            return null;
        }
        const year = date.getFullYear();
        const carriedForwards = await this.carriedForwardRepository
            .createQueryBuilder('cf')
            .leftJoin('cf.employee', 'employee')
            .select('employee.id', 'employeeId')
            .addSelect('cf.days', 'days')
            .addSelect('cf.daysTaken', 'daysTaken')
            .addSelect('cf.date', 'date')
            .where('employee.id = :employeeId', { employeeId })
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
            .getRawOne();
        console.log("CARRIED FORWARD:", carriedForwards);
        if (carriedForwards) {
            const carriedForwardMap = new Map([carriedForwards].map(cf => [
                cf.employeeId,
                {
                    days: Number(cf.days),
                    daysTaken: Number(cf.daysTaken || 0),
                    date: new Date(cf.date),
                },
            ]));
        }
        const [data] = await this.employeeRepository
            .createQueryBuilder('e')
            .where('e.id = :id AND e.is_active = true AND e.is_deleted = false', { id: employeeId })
            .select(['e.id', 'e.matricule', 'e.name', 'e.firstname', 'e.DOE'])
            .take(10)
            .getManyAndCount();
        const takenLeaves = await this.leaveRepository
            .createQueryBuilder('leave')
            .leftJoin('leave.employee', 'employee')
            .select('employee.id', 'employeeId')
            .addSelect('leave.start_date', 'start_date')
            .addSelect('leave.end_date', 'end_date')
            .addSelect('SUM(DATEDIFF(leave.end_date, leave.start_date) + 1)', 'daysTaken')
            .where('employee.id IN (:...employeeIds)', { employeeIds: [employeeId] })
            .andWhere('leave.status IN (:...status)', { status: [leave_entity_1.LeaveStatus.APPROVED, leave_entity_1.LeaveStatus.PENDING] })
            .andWhere('leave.leave_type = :type', { type: 'Local_Leave_AMD' })
            .andWhere('YEAR(leave.start_date) = :year', { year: date.getFullYear() })
            .andWhere('employee.is_active = true AND employee.is_deleted = false')
            .groupBy('employee.id')
            .getRawMany();
        const takenMap = new Map();
        takenLeaves.forEach(async (l) => {
            const holidays = await this.employeeService.getDaysTakenWithHoliday(l.start_date, l.end_date);
            const daysTaken = Number(l.daysTaken) - holidays;
            takenMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
        });
        const promises = data.map(async (emp) => {
            var debut = 0;
            var daysTaken = 0;
            var dateFilter = (0, typeorm_2.Between)(new Date(year, 0, 1), new Date(year, 11, 31));
            if (carriedForwards) {
                debut = carriedForwards.days;
                daysTaken = carriedForwards.daysTaken;
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
            if (carriedForwards) {
                permissionQuery.andWhere('leave.start_date >= :cfDate', {
                    cfDate: carriedForwards.date,
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
            permissions.forEach(async (l) => {
                permissionTaken += Number(this.calculateDaysBetween(new Date(l.start_date), new Date(l.end_date)));
            });
            let sld = 0;
            if (carriedForwards) {
                sld = this.calculateSoldeCumulFromDate(carriedForwards.date, carriedForwards.days, date);
            }
            else {
                sld =
                    (await this.getEmployeeSolde(emp.matricule, date))
                        .solde_cumul;
            }
            const cumulSolde = sld;
            const cumulSoldeMensuel = sld;
            const pris = takenMap.get(emp.id) || 0;
            const restant = cumulSolde - pris;
            const doeDate = new Date(emp.DOE);
            let soldeDebut = 0;
            if (date.getFullYear() > doeDate.getFullYear() + 1) {
                const dateDebutCompte = new Date(doeDate.getFullYear() + 1, doeDate.getMonth(), doeDate.getDate());
                for (let i = dateDebutCompte.getFullYear(); i <= date.getFullYear(); i += 3) {
                    if (date.getFullYear() - i < 3) {
                        for (let y = i; y < date.getFullYear(); y++) {
                            soldeDebut += (await this.getEmployeeSolde(emp.matricule, new Date(y, 11, 31))).solde_restant;
                        }
                    }
                }
            }
            console.log('soldeDebut', soldeDebut);
            console.log('restant', restant);
            console.log('cumulSolde', cumulSolde);
            return {
                ...emp,
                solde_cumul: Number(cumulSolde.toFixed(2)),
                solde_cumul_mensuel: Number(cumulSoldeMensuel.toFixed(2)),
                solde_debut: Number(soldeDebut.toFixed(2)),
                solde_pris: Number(pris.toFixed(2)),
                solde_restant: Number((restant + soldeDebut).toFixed(2)),
                solde_restant_mensuel: Number((cumulSoldeMensuel - pris + soldeDebut).toFixed(2)),
            };
        });
        const results = await Promise.all(promises);
        return results[0];
    }
    async getEmployeeSolde(matricule, at) {
        const year = at.getFullYear();
        const employee = await this.employeeRepository.findOne({ where: { matricule, is_active: true, is_deleted: false } });
        if (!employee)
            return { solde_cumul: 0, solde_pris: 0, solde_restant: 0, solde_cumul_mensuel: 0 };
        const takenLeaves = await this.leaveRepository
            .createQueryBuilder('leave')
            .leftJoin('leave.employee', 'employee')
            .select('employee.id', 'employeeId')
            .addSelect('leave.start_date', 'start_date')
            .addSelect('leave.end_date', 'end_date')
            .addSelect('SUM(DATEDIFF(leave.end_date, leave.start_date) + 1)', 'daysTaken')
            .where('employee.id = :employeeId', { employeeId: employee.id })
            .andWhere('leave.status IN (:...status)', { status: [leave_entity_1.LeaveStatus.APPROVED, leave_entity_1.LeaveStatus.PENDING] })
            .andWhere('leave.leave_type = :type', { type: 'Local_Leave_AMD' })
            .andWhere('YEAR(leave.start_date) = :year', { year })
            .andWhere('leave.start_date <= :at', { at })
            .groupBy('employee.id')
            .getRawMany();
        const takenLeavesMap = new Map();
        takenLeaves.forEach(async (l) => {
            const holidays = await this.employeeService.getDaysTakenWithHoliday(l.start_date, l.end_date);
            const daysTaken = Number(l.daysTaken) - holidays;
            takenLeavesMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
        });
        function estDernierJourDuMois(date) {
            const annee = date.getFullYear();
            const mois = date.getMonth();
            const demain = new Date(date);
            demain.setDate(date.getDate() + 1);
            return demain.getMonth() !== mois;
        }
        let soldeCumul = 0;
        let soldeCumulMensuel = 2.5 * at.getMonth();
        if (estDernierJourDuMois(at)) {
            soldeCumulMensuel = 2.5 * (at.getMonth() + 1);
        }
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
        const pris = takenLeavesMap.get(employee.id) || 0;
        const restant = soldeCumul - pris;
        const result = {
            ...employee,
            solde_cumul: Number(soldeCumul.toFixed(2)),
            solde_cumul_mensuel: Number(soldeCumulMensuel.toFixed(2)),
            solde_pris: Number(pris.toFixed(2)),
            solde_restant: Number(restant.toFixed(2)),
        };
        return result;
    }
    calculateCumulBalance(date) {
        let soldeCumul = 0;
        for (let m = 0; m <= date.getMonth(); m++) {
            const daysInMonth = new Date(date.getFullYear(), m + 1, 0).getDate();
            if (m === date.getMonth()) {
                soldeCumul += (2.5 / daysInMonth) * date.getDate();
            }
            else {
                soldeCumul += 2.5;
            }
        }
        return soldeCumul;
    }
    findAll() {
        return this.leaveRepository.find();
    }
    async findOne(id) {
        return await this.leaveRepository.findOne({ where: { id }, relations: ['employee'] });
    }
    async update(id, updateLeaveDto) {
        const employee = await this.employeeRepository.findOne({
            where: { id: updateLeaveDto.employee },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        return this.leaveRepository.update(id, {
            ...updateLeaveDto,
            employee,
        });
    }
    remove(id) {
        return this.leaveRepository.delete(id);
    }
    async getPaginateEmployeeLeaves(employeeId, skip = 0, take = 1000, startDate, endDate, status) {
        const [data, count] = await this.leaveRepository.findAndCount({
            where: {
                employee: {
                    id: employeeId,
                    is_active: true,
                    is_deleted: false
                },
                start_date: (0, typeorm_2.Between)(new Date(startDate), new Date(endDate)),
                status: (0, typeorm_2.In)(this.getLeavesByStatus(status)),
                leave_type: (0, typeorm_2.Not)("Permission_AMD")
            },
            order: { start_date: 'DESC' },
            relations: ['approver', 'approver.employee', 'employee'],
        });
        return { data, count };
    }
    async getEmployeeLeaves(employeeId) {
        return this.leaveRepository.find({ where: { employee: { id: employeeId, is_active: true, is_deleted: false } }, });
    }
    async getEmployeeLeavesByDate(employeeId, date) {
        return this.leaveRepository.find({ where: { employee: { id: employeeId, is_active: true, is_deleted: false }, start_date: date } });
    }
    async getEmployeeLeavesByMonth(employeeId, month, year) {
        return this.leaveRepository.find({ where: { employee: { id: employeeId, is_active: true, is_deleted: false }, start_date: (0, typeorm_2.Between)(new Date(year, month, 1), new Date(year, month + 1, 1)) } });
    }
    async getEmployeeLeavesByYear(employeeId, year) {
        return this.leaveRepository.find({ where: { employee: { id: employeeId, is_active: true, is_deleted: false }, start_date: (0, typeorm_2.Between)(new Date(year, 0, 1), new Date(year + 1, 0, 1)) } });
    }
    async getEmployeeLeavesByRange(employeeId, startDate, endDate) {
        return this.leaveRepository.find({ where: { employee: { id: employeeId, is_active: true, is_deleted: false }, start_date: (0, typeorm_2.Between)(startDate, endDate) } });
    }
    async getLeavesByLine(line) {
        return this.leaveRepository.find({ where: { employee: { line, is_active: true, is_deleted: false } } });
    }
    async getLeavesBySection(section) {
        return this.leaveRepository.find({ where: { employee: { section, is_active: true, is_deleted: false } } });
    }
    async getLeavesByMonth(month, year) {
        return this.leaveRepository.find({ where: { start_date: (0, typeorm_2.Between)(new Date(year, month, 1), new Date(year, month + 1, 1)) } });
    }
    async getLeavesByYear(year) {
        return this.leaveRepository.find({ where: { start_date: (0, typeorm_2.Between)(new Date(year, 0, 1), new Date(year + 1, 0, 1)) } });
    }
    async getLeavesByLineAndSection(line, section) {
        return this.leaveRepository.find({ where: { employee: { line, section, is_active: true, is_deleted: false } } });
    }
    async getPlanning(year, startMonth, endMonth, line, section, skip = 0, take = 30) {
        const startDate = new Date(year, startMonth - 1, 1);
        const endDate = new Date(year, endMonth, 0);
        const query = this.leaveRepository
            .createQueryBuilder('leave')
            .leftJoin('leave.employee', 'employee')
            .select([
            'leave.id',
            'leave.start_date',
            'leave.end_date',
            'leave.leave_type',
            'employee.id',
            'employee.name', 'e.firstname',
            'employee.line',
        ])
            .where(`
      leave.start_date <= :endDate
      AND leave.end_date >= :startDate
      `, { startDate, endDate })
            .andWhere('leave.status != :status', { status: leave_entity_1.LeaveStatus.REJECTED });
        if (line) {
            query.andWhere('employee.line = :line  AND employee.is_active = true AND employee.is_deleted = false', { line });
        }
        if (section) {
            query.andWhere('employee.section = :section AND employee.is_active = true AND employee.is_deleted = false', { section });
        }
        query
            .orderBy('employee.id', 'ASC')
            .skip(skip)
            .take(take);
        return query.getMany();
    }
    getDatesBetween(startDate, endDate) {
        const dates = [];
        const sy = Number(startDate.getFullYear());
        const sm = Number(startDate.getMonth());
        const sd = Number(startDate.getDate());
        const ey = Number(endDate.getFullYear());
        const em = Number(endDate.getMonth());
        const ed = Number(endDate.getDate());
        let current = new Date(sy, sm, sd);
        const end = new Date(ey, em, ed);
        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }
    getLeavesByStatus(status) {
        switch (status) {
            case "pending":
                return [leave_entity_1.LeaveStatus.PENDING];
            case "approved":
                return [leave_entity_1.LeaveStatus.APPROVED];
            case "rejected":
                return [leave_entity_1.LeaveStatus.REJECTED];
            default:
                return [leave_entity_1.LeaveStatus.REJECTED, leave_entity_1.LeaveStatus.PENDING, leave_entity_1.LeaveStatus.APPROVED];
        }
    }
    async exportLeavePlanning(user, startDate, endDate, line, section, division, site, status = "all") {
        let leaves;
        let employees;
        const leaveEx = this.getLeavesByStatus(status);
        const dates = this.getDatesBetween(startDate, endDate);
        if (user && user.role === user_entity_1.UserRole.MANAGER) {
            employees = await this.employeeRepository.find({
                where: {
                    line,
                    section,
                    division,
                    site,
                    manager: { id: user.employee?.id },
                    is_active: true,
                    is_deleted: false
                },
                order: { matricule: "ASC" },
            });
            leaves = await this.leaveRepository.find({
                where: [
                    {
                        employee: {
                            line,
                            section,
                            division,
                            site,
                            manager: { id: user.employee?.id },
                        },
                        status: (0, typeorm_2.In)(leaveEx),
                    },
                ],
                relations: ["employee"],
            });
        }
        else {
            employees = await this.employeeRepository.find({
                where: {
                    line,
                    section,
                    division,
                    site,
                    is_active: true,
                    is_deleted: false
                },
                order: { matricule: "ASC" },
            });
            leaves = await this.leaveRepository.find({
                where: [
                    {
                        employee: {
                            line,
                            section,
                            division,
                            site,
                            is_active: true,
                            is_deleted: false
                        },
                        status: (0, typeorm_2.In)(leaveEx),
                    },
                ],
                relations: ["employee"],
            });
        }
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Leave Planning");
        const header = [
            "Employee Code",
            "Card No (Optional)",
            "Employee Name (Optional)",
            ...dates.map((d) => d.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "2-digit",
            })),
        ];
        sheet.addRow(header);
        const leaveMap = new Map();
        leaves.forEach((leave) => {
            let current = new Date(leave.start_date);
            const end = new Date(leave.end_date);
            current.setDate(current.getDate() - 1);
            end.setDate(end.getDate() - 1);
            while (current <= end) {
                const key = `${leave.employee.id}_${this.formatDateUTC(current)}`;
                leaveMap.set(key, leave.leave_type);
                current.setDate(current.getDate() + 1);
            }
        });
        employees.forEach((emp) => {
            const rowData = [
                emp.matricule,
                "",
                `${emp.name} ${emp.firstname}`,
            ];
            dates.forEach((date) => {
                const key = `${emp.id}_${this.formatDateUTC(date)}`;
                rowData.push(leaveMap.get(key) || "");
            });
            const row = sheet.addRow(rowData);
            dates.forEach((_, index) => {
                const cell = row.getCell(index + 4);
                const value = cell.value;
            });
        });
        sheet.getColumn(1).width = 20;
        sheet.getColumn(2).width = 20;
        sheet.getColumn(3).width = 30;
        for (let i = 4; i <= header.length; i++) {
            sheet.getColumn(i).width = 16;
        }
        return workbook;
    }
    formatDateUTC(date) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    async exportEmployeeLeaves(employee, startDate, endDate, status) {
        const leaves = await this.leaveRepository.find({
            where: {
                employee: { id: employee.id, is_active: true, is_deleted: false },
                start_date: (0, typeorm_2.Between)(startDate, endDate),
                status: (0, typeorm_2.In)(this.getLeavesByStatus(status))
            },
            order: { start_date: 'DESC' },
            relations: ['employee', 'approver']
        });
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("" + employee.name + " " + employee.firstname);
        const header = [
            "Matricule",
            "Fullname",
            "Departement",
            "Section",
            "Line",
            "Start Date",
            "End Date",
            "Leave Type",
            "Duration",
            "Status",
            "Reason",
            "Approved/Rejected Date",
            "Approved/Rejected By"
        ];
        sheet.addRow(header);
        const headerRow = sheet.getRow(1);
        headerRow.eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFf7ff18" }
            };
        });
        leaves.forEach(leave => {
            const approver = leave.approver ? leave.approver.employee?.firstname + " " + leave.approver.employee?.name : "";
            const approvedDate = leave.approved_date ? new Date(leave.approved_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "";
            const rowData = [
                leave.employee.matricule,
                leave.employee.name + " " + leave.employee.firstname,
                leave.employee.departement,
                leave.employee.section,
                leave.employee.line,
                leave.start_date,
                leave.end_date,
                leave.leave_type,
                leave.duration,
                leave.status,
                leave.reason,
                approvedDate,
                approver
            ];
            sheet.addRow(rowData);
        });
        sheet.columns.forEach(col => {
            col.width = 12;
        });
        return workbook;
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
    async getMonthlyAbsenceRate() {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const totalEmployees = await this.employeeRepository.count({
            where: {
                is_active: true,
            },
        });
        const currentAbsenceDays = await this.getLeaveDaysBetween(currentMonthStart, currentMonthEnd);
        const lastAbsenceDays = await this.getLeaveDaysBetween(lastMonthStart, lastMonthEnd);
        const daysInCurrentMonth = currentMonthEnd.getDate();
        const currentRate = (currentAbsenceDays / (totalEmployees * daysInCurrentMonth)) * 100;
        const lastRate = (lastAbsenceDays / (totalEmployees * lastMonthEnd.getDate())) * 100;
        const variation = currentRate - lastRate;
        return {
            currentRate: currentRate.toFixed(1),
            lastRate: lastRate.toFixed(1),
            variation: variation.toFixed(1),
        };
    }
    async getLeaveDaysBetween(start, end, status = [leave_entity_1.LeaveStatus.APPROVED]) {
        const leaves = await this.leaveRepository
            .createQueryBuilder('leave')
            .innerJoinAndSelect('leave.employee', 'employee')
            .where('leave.status IN (:...status)', {
            status: status,
        })
            .andWhere('leave.leave_type = :type', {
            type: 'Local_Leave_AMD',
        })
            .andWhere('employee.is_active = :is_active', {
            is_active: true,
        })
            .andWhere('employee.is_deleted = :is_deleted', {
            is_deleted: false,
        })
            .andWhere('leave.start_date <= :end', { end })
            .andWhere('leave.end_date >= :start', { start })
            .getMany();
        let total = 0;
        for (const leave of leaves) {
            const st = new Date(leave.start_date);
            const en = new Date(leave.end_date);
            let overlapStart;
            let overlapEnd;
            if (st > start) {
                overlapStart = st;
            }
            else {
                overlapStart = start;
            }
            if (en < end) {
                overlapEnd = en;
            }
            else {
                overlapEnd = end;
            }
            const days = this.compterJours(overlapStart, overlapEnd);
            total += days;
        }
        return total;
    }
    async getLeaveByStatusDaysBetween(start, end, status = leave_entity_1.LeaveStatus.APPROVED, type = "Local_Leave_AMD") {
        const leaves = await this.leaveRepository
            .createQueryBuilder('leave')
            .innerJoinAndSelect('leave.employee', 'employee')
            .where('leave.status = :status', {
            status,
        })
            .andWhere('leave.leave_type = :type', {
            type,
        })
            .andWhere('employee.is_active = :is_active', {
            is_active: true,
        })
            .andWhere('employee.is_deleted = :is_deleted', {
            is_deleted: false,
        })
            .andWhere('leave.start_date <= :end', { end })
            .andWhere('leave.end_date >= :start', { start })
            .getMany();
        let total = 0;
        for (const leave of leaves) {
            const st = new Date(leave.start_date);
            const en = new Date(leave.end_date);
            let overlapStart;
            let overlapEnd;
            if (st > start) {
                overlapStart = st;
            }
            else {
                overlapStart = start;
            }
            if (en < end) {
                overlapEnd = en;
            }
            else {
                overlapEnd = end;
            }
            const days = this.compterJours(overlapStart, overlapEnd);
            total += days;
        }
        return total;
    }
    async getLeavesStatsCurrentMonth(date = new Date()) {
        const now = new Date(date);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const qb = this.leaveRepository.createQueryBuilder('leave')
            .innerJoinAndSelect('leave.employee', 'employee')
            .where('leave.start_date <= :monthEnd', { monthEnd })
            .andWhere('leave.end_date >= :monthStart', { monthStart })
            .andWhere('employee.is_active = :is_active', {
            is_active: true,
        })
            .andWhere('employee.is_deleted = :is_deleted', {
            is_deleted: false,
        });
        const totalLeaves = await qb.getCount();
        const approvedLeaves = await this.leaveRepository
            .createQueryBuilder('leave')
            .innerJoinAndSelect('leave.employee', 'employee')
            .where('leave.status = :status', { status: 'APPROVED' })
            .andWhere('leave.start_date <= :monthEnd', { monthEnd })
            .andWhere('leave.end_date >= :monthStart', { monthStart })
            .andWhere('employee.is_active = :is_active', {
            is_active: true,
        })
            .andWhere('employee.is_deleted = :is_deleted', {
            is_deleted: false,
        })
            .getCount();
        const today = new Date().toISOString().split('T')[0];
        const ongoingLeaves = await this.employeeRepository
            .createQueryBuilder('employee')
            .innerJoin('employee.leaves', 'leave', `
      leave.status = :status
      AND :today BETWEEN leave.start_date AND leave.end_date
      `, {
            status: 'APPROVED',
            today,
        })
            .andWhere('employee.is_active = :is_active', {
            is_active: true,
        })
            .andWhere('employee.is_deleted = :is_deleted', {
            is_deleted: false,
        })
            .distinct(true)
            .getCount();
        const approvalRate = totalLeaves > 0
            ? ((approvedLeaves / totalLeaves) * 100).toFixed(0)
            : 0;
        return {
            ongoingLeaves,
            approvedLeaves,
            totalLeaves,
            approvalRate,
        };
    }
    async getPendingLeavesStats() {
        const now = new Date();
        const leaves = await this.leaveRepository.find({
            where: {
                start_date: (0, typeorm_2.Between)(new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)),
                status: leave_entity_1.LeaveStatus.PENDING,
                employee: {
                    is_active: true,
                    is_deleted: false,
                },
            },
            relations: [
                'employee',
                'approver'
            ]
        });
        const totalLeaves = leaves.length;
        const pendingLeaves = await this.leaveRepository
            .createQueryBuilder('leave')
            .innerJoinAndSelect('leave.employee', 'employee')
            .where('leave.status = :status', { status: 'PENDING' })
            .andWhere('employee.is_active = :is_active', {
            is_active: true,
        })
            .andWhere('employee.is_deleted = :is_deleted', {
            is_deleted: false,
        })
            .getCount();
        const pendingRate = totalLeaves > 0
            ? ((pendingLeaves / totalLeaves) * 100).toFixed(0)
            : 0;
        return {
            pendingLeaves,
            totalLeaves,
            pendingRate,
        };
    }
    async getAbsenceByMonth(year = 2026) {
        const result = [];
        for (let month = 0; month < 12; month++) {
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);
            const leaveApproved = await this.getLeaveDaysBetween(monthStart, monthEnd, [leave_entity_1.LeaveStatus.APPROVED]);
            const leavePending = await this.getLeaveDaysBetween(monthStart, monthEnd, [leave_entity_1.LeaveStatus.PENDING]);
            const permissionApproved = await this.getPermissionDaysBetween(monthStart, monthEnd, [leave_entity_1.LeaveStatus.APPROVED]);
            const permissionPending = await this.getPermissionDaysBetween(monthStart, monthEnd, [leave_entity_1.LeaveStatus.PENDING]);
            const indispoApproved = await this.getIndisponibilityDaysBetween(monthStart, monthEnd, [leave_entity_1.LeaveStatus.APPROVED]);
            const indispoPending = await this.getIndisponibilityDaysBetween(monthStart, monthEnd, [leave_entity_1.LeaveStatus.PENDING]);
            result.push({
                month: month + 1,
                leaveApproved,
                leavePending,
                permissionApproved,
                permissionPending,
                indispoApproved,
                indispoPending
            });
        }
        return result;
    }
    async getPermissionDaysBetween(start, end, status = [leave_entity_1.LeaveStatus.APPROVED]) {
        const permissions = await this.leaveRepository
            .createQueryBuilder('leave')
            .innerJoinAndSelect('leave.employee', 'employee')
            .where('leave.start_date <= :end', { end })
            .andWhere('leave.end_date >= :start', { start })
            .andWhere('leave.leave_type = :type', {
            type: 'Permission_AMD',
        })
            .andWhere('employee.is_active = :is_active', {
            is_active: true,
        })
            .andWhere('employee.is_deleted = :is_deleted', {
            is_deleted: false,
        })
            .andWhere('leave.status IN (:...status)', { status })
            .getMany();
        let total = 0;
        for (const leave of permissions) {
            const st = new Date(leave.start_date);
            const en = new Date(leave.end_date);
            let overlapStart;
            let overlapEnd;
            if (st > start) {
                overlapStart = st;
            }
            else {
                overlapStart = start;
            }
            if (en < end) {
                overlapEnd = en;
            }
            else {
                overlapEnd = end;
            }
            const days = this.compterJours(overlapStart, overlapEnd);
            total += days;
        }
        return total;
    }
    compterJours(dateDebut, dateFin) {
        const msParJour = 1000 * 60 * 60 * 24;
        const debutMs = dateDebut.getTime();
        const finMs = dateFin.getTime();
        const differenceMs = Math.abs(finMs - debutMs);
        return Math.round(differenceMs / msParJour) + 1;
    }
    async getIndisponibilityDaysBetween(start, end, status = [leave_entity_1.LeaveStatus.APPROVED]) {
        const indisponibilities = await this.leaveRepository
            .createQueryBuilder('leave')
            .innerJoinAndSelect('leave.employee', 'employee')
            .where('leave.start_date <= :end', { end })
            .andWhere('leave.end_date >= :start', { start })
            .andWhere('leave.leave_type = :type', {
            type: 'Indisponibilite_AMD',
        })
            .andWhere('employee.is_active = :is_active', {
            is_active: true,
        })
            .andWhere('employee.is_deleted = :is_deleted', {
            is_deleted: false,
        })
            .andWhere('leave.status IN (:...status)', { status })
            .getMany();
        let total = 0;
        for (const r of indisponibilities) {
            const st = new Date(r.start_date);
            const en = new Date(r.end_date);
            let overlapStart;
            let overlapEnd;
            if (st > start) {
                overlapStart = st;
            }
            else {
                overlapStart = start;
            }
            if (en < end) {
                overlapEnd = en;
            }
            else {
                overlapEnd = end;
            }
            const days = this.compterJours(overlapStart, overlapEnd);
            total += days;
        }
        return total;
    }
    async getLeaveTypesDistribution() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        const localLeave = await this.getLeaveDaysBetween(start, end);
        const permissionAMD = await this.getPermissionDaysBetween(start, end);
        const indispo = await this.getIndisponibilityDaysBetween(start, end);
        const total = localLeave +
            permissionAMD +
            indispo;
        return {
            total,
            localLeave,
            permissionAMD,
            indispo,
            localPct: total ? ((localLeave / total) * 100).toFixed(0) : 0,
            permissionPct: total ? ((permissionAMD / total) * 100).toFixed(0) : 0,
            indispoPct: total ? ((indispo / total) * 100).toFixed(0) : 0,
        };
    }
    async getLeaveStatusStats() {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const localLeavePast = await this.getLeaveByStatusDaysBetween(new Date(today.getFullYear(), 0, 1), today, leave_entity_1.LeaveStatus.APPROVED, 'Local_Leave_AMD');
        const permissionPast = await this.getLeaveByStatusDaysBetween(new Date(today.getFullYear(), 0, 1), today, leave_entity_1.LeaveStatus.APPROVED, 'Permission_AMD');
        const indispoPast = await this.getLeaveByStatusDaysBetween(new Date(today.getFullYear(), 0, 1), today, leave_entity_1.LeaveStatus.APPROVED, 'Indisponibilite_AMD');
        const totalPast = localLeavePast + permissionPast + indispoPast;
        const localLeaveFuture = await this.getLeaveByStatusDaysBetween(today, new Date(today.getFullYear(), 11, 31), leave_entity_1.LeaveStatus.APPROVED, 'Local_Leave_AMD');
        const permissionFuture = await this.getLeaveByStatusDaysBetween(today, new Date(today.getFullYear(), 11, 31), leave_entity_1.LeaveStatus.APPROVED, 'Permission_AMD');
        const indispoFuture = await this.getLeaveByStatusDaysBetween(today, new Date(today.getFullYear(), 11, 31), leave_entity_1.LeaveStatus.APPROVED, 'Indisponibilite_AMD');
        const localLeavePending = await this.getLeaveByStatusDaysBetween(today, new Date(today.getFullYear(), 11, 31), leave_entity_1.LeaveStatus.PENDING, 'Local_Leave_AMD');
        const permissionPending = await this.getLeaveByStatusDaysBetween(today, new Date(today.getFullYear(), 11, 31), leave_entity_1.LeaveStatus.PENDING, 'Permission_AMD');
        const indispoPending = await this.getLeaveByStatusDaysBetween(today, new Date(today.getFullYear(), 11, 31), leave_entity_1.LeaveStatus.PENDING, 'Indisponibilite_AMD');
        const totalPending = localLeavePending + permissionPending + indispoPending;
        const totalFuture = localLeaveFuture + permissionFuture + indispoFuture + totalPending;
        const localLeaveRejected = await this.getLeaveByStatusDaysBetween(new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear(), 11, 31), leave_entity_1.LeaveStatus.REJECTED, 'Local_Leave_AMD');
        const permissionRejected = await this.getLeaveByStatusDaysBetween(new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear(), 11, 31), leave_entity_1.LeaveStatus.REJECTED, 'Permission_AMD');
        const indispoRejected = await this.getLeaveByStatusDaysBetween(new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear(), 11, 31), leave_entity_1.LeaveStatus.REJECTED, 'Indisponibilite_AMD');
        const totalRejected = localLeaveRejected + permissionRejected + indispoRejected;
        const total = totalPast + totalFuture;
        return {
            totalPast,
            totalFuture,
            totalRejected,
            total,
            totalPastPct: total ? ((totalPast / total) * 100).toFixed(0) : 0,
            totalFuturePct: total ? ((totalFuture / total) * 100).toFixed(0) : 0,
            totalRejectedPct: total ? ((totalRejected / total) * 100).toFixed(0) : 0,
        };
    }
    async getAbsenceBySection() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sections = await this.employeeRepository
            .createQueryBuilder("employee")
            .select("employee.section", "section")
            .addSelect("COUNT(employee.id)", "total")
            .where("employee.is_active = true AND employee.is_deleted = false")
            .groupBy("employee.section")
            .getRawMany();
        const result = [];
        for (const s of sections) {
            const absent = await this.leaveRepository
                .createQueryBuilder("leave")
                .innerJoin("leave.employee", "employee")
                .where("employee.section = :section AND employee.is_active = true AND employee.is_deleted = false", {
                section: s.section,
            })
                .andWhere("leave.status = :status", {
                status: leave_entity_1.LeaveStatus.APPROVED,
            })
                .andWhere(":today BETWEEN leave.start_date AND leave.end_date", {
                today,
            })
                .getCount();
            const total = Number(s.total);
            result.push({
                section: s.section,
                employees: total,
                absent,
                pct: ((absent / total) * 100).toFixed(0),
            });
        }
        return result.sort((a, b) => Number(b.pct) - Number(a.pct));
    }
    async getAbsenceByManager() {
        const today = new Date();
        const employees = await this.employeeRepository.find({
            where: {
                is_active: true,
                is_deleted: false
            },
            relations: {
                manager: true,
            }
        });
        const leaves = await this.leaveRepository.find({
            where: {
                status: leave_entity_1.LeaveStatus.APPROVED,
                employee: { is_active: true, is_deleted: false }
            },
            relations: {
                employee: true,
            }
        });
        const managerMap = new Map();
        employees.forEach(employee => {
            if (!employee.manager)
                return;
            const managerId = employee.manager.id;
            if (!managerMap.has(managerId)) {
                managerMap.set(managerId, {
                    manager: employee.manager.name + ' ' + employee.manager.firstname,
                    id: employee.manager.id,
                    employees: 0,
                    absent: 0,
                    employeeIds: [],
                });
            }
            const entry = managerMap.get(managerId);
            entry.employees += 1;
            entry.employeeIds.push(employee.id);
        });
        leaves.forEach(leave => {
            const start = new Date(leave.start_date);
            const end = new Date(leave.end_date);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            const isAbsentToday = today >= start &&
                today <= end;
            if (!isAbsentToday)
                return;
            managerMap.forEach(entry => {
                if (entry.employeeIds.includes(leave.employee?.id)) {
                    entry.absent += 1;
                }
            });
        });
        const result = Array.from(managerMap.values()).map(entry => ({
            manager: entry.manager,
            employees: entry.employees,
            absent: entry.absent,
            id: entry.id,
            pct: entry.employees > 0
                ? Math.round((entry.absent / entry.employees) * 100)
                : 0
        }));
        result.sort((a, b) => b.pct - a.pct);
        return result;
    }
    async getMonthlyLeaveDistributionBySection() {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const sections = await this.employeeRepository
            .createQueryBuilder('employee')
            .select('employee.section', 'section')
            .where('employee.is_deleted = false')
            .andWhere('employee.is_active = true')
            .groupBy('employee.section')
            .orderBy('employee.section', 'ASC')
            .getRawMany();
        const leaves = await this.leaveRepository
            .createQueryBuilder('leave')
            .leftJoinAndSelect('leave.employee', 'employee')
            .where('leave.status = :status', {
            status: leave_entity_1.LeaveStatus.APPROVED,
        })
            .andWhere('leave.start_date <= :monthEnd', { monthEnd })
            .andWhere('leave.end_date >= :monthStart', { monthStart })
            .getMany();
        const sectionDays = new Map();
        let totalDays = 0;
        for (const leave of leaves) {
            const start = new Date(leave.start_date);
            const end = new Date(leave.end_date);
            const effectiveStart = start > monthStart
                ? start
                : monthStart;
            const effectiveEnd = end < monthEnd
                ? end
                : monthEnd;
            const days = this.compterJours(effectiveStart, effectiveEnd);
            const section = leave.employee?.section || 'Unknown';
            sectionDays.set(section, (sectionDays.get(section) || 0) + days);
            totalDays += days;
        }
        return sections
            .map(({ section }) => {
            const days = sectionDays.get(section) || 0;
            const rate = totalDays > 0
                ? Number(((days / totalDays) *
                    100).toFixed(1))
                : 0;
            return {
                section,
                days,
                rate,
            };
        })
            .sort((a, b) => b.days - a.days);
    }
    async getManagerAbsences(managerId) {
        const employees = await this.employeeRepository.find({
            where: {
                manager: {
                    id: managerId
                },
                is_active: true,
                is_deleted: false
            },
            relations: {
                manager: true
            }
        });
        const employeeIds = employees.map(e => e.id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const leaves = await this.leaveRepository.find({
            where: {
                employee: {
                    id: (0, typeorm_2.In)(employeeIds)
                },
                start_date: (0, typeorm_2.LessThanOrEqual)(today),
                end_date: (0, typeorm_2.MoreThanOrEqual)(today),
                status: leave_entity_1.LeaveStatus.APPROVED
            },
            relations: {
                employee: true
            },
            order: {
                start_date: 'DESC'
            }
        });
        return leaves;
    }
    async calculateAbsenceRateForMonth(year, month) {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const daysInMonth = monthEnd.getDate();
        const totalEmployees = await this.employeeRepository.count({
            where: {
                is_active: true,
                is_deleted: false,
            },
        });
        const leaves = await this.leaveRepository
            .createQueryBuilder('leave')
            .where('leave.status = :status', {
            status: leave_entity_1.LeaveStatus.APPROVED,
        })
            .andWhere('leave.start_date <= :monthEnd', { monthEnd })
            .andWhere('leave.end_date >= :monthStart', { monthStart })
            .getMany();
        let totalAbsenceDays = 0;
        for (const leave of leaves) {
            const startDate = new Date(leave.start_date);
            const endDate = new Date(leave.end_date);
            const effectiveStart = startDate > monthStart
                ? startDate
                : monthStart;
            const effectiveEnd = endDate < monthEnd
                ? endDate
                : monthEnd;
            const absenceDays = Math.floor((effectiveEnd.getTime() -
                effectiveStart.getTime()) /
                (1000 * 60 * 60 * 24)) + 1;
            totalAbsenceDays += absenceDays;
        }
        const totalAvailableDays = totalEmployees * daysInMonth;
        return totalAvailableDays > 0
            ? Number(((totalAbsenceDays /
                totalAvailableDays) *
                100).toFixed(2))
            : 0;
    }
    async getOngoingLeavesBySection() {
        const today = new Date();
        const sections = await this.employeeRepository
            .createQueryBuilder('employee')
            .select('employee.section', 'section')
            .addSelect('COUNT(employee.id)', 'totalEmployees')
            .where('employee.is_active = true')
            .andWhere('employee.is_deleted = false')
            .groupBy('employee.section')
            .orderBy('employee.section', 'ASC')
            .getRawMany();
        const ongoingLeaves = await this.leaveRepository
            .createQueryBuilder('leave')
            .innerJoin('leave.employee', 'employee')
            .select('employee.section', 'section')
            .addSelect('COUNT(DISTINCT employee.id)', 'ongoingEmployees')
            .where('leave.status = :status', {
            status: leave_entity_1.LeaveStatus.APPROVED,
        })
            .andWhere(':today BETWEEN leave.start_date AND leave.end_date', {
            today,
        })
            .groupBy('employee.section')
            .getRawMany();
        const ongoingMap = new Map(ongoingLeaves.map(item => [
            item.section,
            Number(item.ongoingEmployees),
        ]));
        const totalOngoingEmployees = ongoingLeaves.reduce((sum, item) => sum + Number(item.ongoingEmployees), 0);
        return sections.map(section => {
            const ongoingEmployees = ongoingMap.get(section.section) || 0;
            const rate = totalOngoingEmployees > 0
                ? Number(((ongoingEmployees /
                    totalOngoingEmployees) *
                    100).toFixed(1))
                : 0;
            return {
                section: section.section,
                totalEmployees: Number(section.totalEmployees),
                ongoingEmployees,
                rate,
            };
        });
    }
    async getPendingLeavesBySection() {
        const sections = await this.employeeRepository
            .createQueryBuilder('employee')
            .select('employee.section', 'section')
            .where('employee.is_active = true')
            .andWhere('employee.is_deleted = false')
            .groupBy('employee.section')
            .orderBy('employee.section', 'ASC')
            .getRawMany();
        const pendingLeaves = await this.leaveRepository
            .createQueryBuilder('leave')
            .innerJoin('leave.employee', 'employee')
            .select('employee.section', 'section')
            .addSelect('COUNT(leave.id)', 'pendingCount')
            .where('leave.status = :status', {
            status: leave_entity_1.LeaveStatus.PENDING,
        })
            .groupBy('employee.section')
            .getRawMany();
        const pendingMap = new Map(pendingLeaves.map(item => [
            item.section,
            Number(item.pendingCount),
        ]));
        const totalPending = pendingLeaves.reduce((sum, item) => sum + Number(item.pendingCount), 0);
        return sections.map(section => {
            const pendingCount = pendingMap.get(section.section) || 0;
            const rate = totalPending > 0
                ? Number(((pendingCount / totalPending) *
                    100).toFixed(1))
                : 0;
            return {
                section: section.section,
                pendingCount,
                rate,
            };
        })
            .sort((a, b) => b.pendingCount - a.pendingCount);
    }
    async getMonthlyGlobalAbsenceRate() {
        const today = new Date();
        const currentRate = await this.calculateAbsenceRateForMonth(today.getFullYear(), today.getMonth());
        const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const previousRate = await this.calculateAbsenceRateForMonth(previousMonthDate.getFullYear(), previousMonthDate.getMonth());
        const variation = Number((currentRate - previousRate).toFixed(2));
        return {
            currentRate,
            previousRate,
            variation,
        };
    }
    async getDaysTakenWithHoliday(startDate, endDate) {
        const holidays = await this.holidayService.findBetweenDate(startDate, endDate);
        const daysTakenWithHoliday = holidays.length;
        return daysTakenWithHoliday;
    }
    calculateDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const diff = end.getTime() - start.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
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
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leave_entity_1.Leave)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(permission2h_entity_1.Permission2h)),
    __param(4, (0, typeorm_1.InjectRepository)(smia_ostie_entity_1.SmiaOstie)),
    __param(10, (0, typeorm_1.InjectRepository)(carried_forward_entity_1.CarriedForward)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        employee_service_1.EmployeeService,
        config_1.ConfigService,
        mailer_1.MailerService,
        history_service_1.HistoryService,
        carried_forward_service_1.CarriedForwardService,
        typeorm_2.Repository,
        holiday_service_1.HolidayService])
], LeaveService);
//# sourceMappingURL=leave.service.js.map