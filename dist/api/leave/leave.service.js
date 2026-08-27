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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("../../employee/entities/employee.entity");
const leave_entity_1 = require("../../leave/entities/leave.entity");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
const employee_service_1 = require("../../employee/employee.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const leave_created_event_1 = require("../../notification/events/leave-created.event");
let LeaveService = class LeaveService {
    leaveRepository;
    employeeRepository;
    mailerService;
    configService;
    employeeService;
    eventEmitter;
    constructor(leaveRepository, employeeRepository, mailerService, configService, employeeService, eventEmitter) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.mailerService = mailerService;
        this.configService = configService;
        this.employeeService = employeeService;
        this.eventEmitter = eventEmitter;
    }
    async findAllHistory(matricule) {
        const employee = await this.employeeRepository.findOne({
            where: { matricule, is_active: true },
        });
        if (!employee) {
            return null;
        }
        const leaves = await this.leaveRepository.find({
            where: {
                employee,
                status: (0, typeorm_2.In)([leave_entity_1.LeaveStatus.APPROVED, leave_entity_1.LeaveStatus.PENDING]),
            },
            order: { created_at: 'DESC' },
            relations: ['employee']
        });
        return leaves;
    }
    async create(createLeaveDto, res) {
        const employee = await this.employeeRepository.findOne({
            where: { matricule: createLeaveDto.employee, is_active: true },
        });
        if (!employee) {
            return res.status(400).json({ message: 'Employee not found' });
        }
        if (createLeaveDto.leave_type == 'Permission_AMD') {
            const d1 = new Date(createLeaveDto.start_date.getFullYear(), 11, 31);
            const d2 = new Date(createLeaveDto.start_date.getFullYear(), 11, 31);
            const permissionList = await this.leaveRepository.find({
                where: { employee, status: leave_entity_1.LeaveStatus.APPROVED, start_date: (0, typeorm_2.Between)(d1, d2) }
            });
            var permissionCount = 0;
            permissionList.forEach(permission => {
                permissionCount += permission.duration;
            });
            const nbDate = createLeaveDto.end_date.getTime() - createLeaveDto.start_date.getTime();
            const days_taken = (nbDate / (1000 * 60 * 60 * 24)) + 1;
            if ((permissionCount + days_taken) > 10) {
                return res.status(400).json({ message: 'Permission solde not enough', solde_left: (10 - permissionCount) });
            }
        }
        const date1 = createLeaveDto.start_date.toISOString().split('T')[0];
        const date2 = createLeaveDto.end_date.toISOString().split('T')[0];
        const overlappingLeave = await this.leaveRepository
            .createQueryBuilder('leave')
            .where('DATE(leave.start_date) <= :date2 AND DATE(leave.end_date) >= :date1', { date1, date2 })
            .andWhere('leave.employee = :employeeId', {
            employeeId: employee.id,
        })
            .andWhere('leave.status IN (:...status)', {
            status: [leave_entity_1.LeaveStatus.APPROVED, leave_entity_1.LeaveStatus.PENDING],
        })
            .getMany();
        if (overlappingLeave.length > 0) {
            return res.status(400).json({ message: 'Leave dates overlap with existing leave' });
        }
        const startDate = new Date(createLeaveDto.start_date);
        const endDate = new Date(createLeaveDto.end_date);
        if (startDate > endDate) {
            return res.status(400).json({ message: 'Start date is after end date' });
        }
        const nbDate = endDate.getTime() - startDate.getTime();
        const duration = (nbDate / (1000 * 60 * 60 * 24)) + 1;
        if (createLeaveDto.leave_type == 'Local_Leave_AMD') {
            const employeeSolde = await this.employeeService.getEmployeeSolde(employee.matricule, createLeaveDto.start_date);
            if ((employeeSolde.solde_restant - duration) < 0) {
                return res.status(400).json({ message: 'Local leave solde not enough', solde_left: employeeSolde.solde_restant });
            }
        }
        const leave = await this.leaveRepository.create({
            ...createLeaveDto,
            employee,
            duration,
        });
        const leaveSaved = await this.leaveRepository.save(leave);
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
                    subject: 'Demande de congé / Leave request',
                    text: 'Demande de congé / Leave request',
                    html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
        <p>
          Bonjour Monsieur/Madame,
        </p>
        <p>
          Un membre de votre équipe ayant la matricule <strong>${employee.matricule} (${employee.name + " " + employee.firstname})</strong> a envoyé une demande de congé et a besoin de votre approbation sur <a href="http://localhost:3000/leave/approuve-leaves" target="_blank">B-Leave</a>.
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
          A member of your team with matricule <strong>${employee.matricule} (${employee.name + " " + employee.firstname})</strong> has taken a leave and need your approval on <a href="http://localhost:3000/leave/approuve-leaves" target="_blank">B-Leave</a>.
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
        this.eventEmitter.emit('leave.created', new leave_created_event_1.LeaveCreatedEvent(leave.id));
        return res.status(200).json(leaveSaved);
    }
    findAll() {
        return `This action returns all leave`;
    }
    findOne(id) {
        return `This action returns a #${id} leave`;
    }
    update(id, updateLeaveDto) {
        return `This action updates a #${id} leave`;
    }
    remove(id) {
        return `This action removes a #${id} leave`;
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leave_entity_1.Leave)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        mailer_1.MailerService,
        config_1.ConfigService,
        employee_service_1.EmployeeService,
        event_emitter_1.EventEmitter2])
], LeaveService);
//# sourceMappingURL=leave.service.js.map