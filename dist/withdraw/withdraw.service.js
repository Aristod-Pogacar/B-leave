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
exports.WithdrawService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const withdraw_entity_1 = require("./entities/withdraw.entity");
const typeorm_2 = require("typeorm");
const leave_service_1 = require("../leave/leave.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const withdraw_request_event_1 = require("../notification/events/withdraw-request.event");
const user_entity_1 = require("../user/entities/user.entity");
let WithdrawService = class WithdrawService {
    withdrawRepository;
    leaveService;
    eventEmitter;
    constructor(withdrawRepository, leaveService, eventEmitter) {
        this.withdrawRepository = withdrawRepository;
        this.leaveService = leaveService;
        this.eventEmitter = eventEmitter;
    }
    async done(id, userId) {
        const withdraw = await this.withdrawRepository.findOne({ where: { id }, relations: ['leave'] });
        if (!withdraw) {
            throw new common_1.BadRequestException("Withdraw not found");
        }
        withdraw.onehr_status = true;
        await this.withdrawRepository.save(withdraw);
        await this.leaveService.approveWithdrawn(withdraw.leave.id, userId);
        return withdraw;
    }
    async markDone(id) {
        const withdraw = await this.withdrawRepository.findOne({ where: { id }, relations: ['leave', 'approver'] });
        if (!withdraw) {
            throw new common_1.BadRequestException("Withdraw not found");
        }
        withdraw.onehr_status = true;
        await this.withdrawRepository.save(withdraw);
        return withdraw;
    }
    async approve(id, user) {
        const withdraw = await this.withdrawRepository.findOne({ where: { id }, relations: ['leave', 'approver'] });
        if (!withdraw) {
            throw new common_1.BadRequestException("Withdraw not found");
        }
        await this.withdrawRepository.update(id, { status: withdraw_entity_1.WithdrawStatus.WITHDRAW_APPROVED, approver: user, approved_date: new Date() });
        await this.leaveService.withdrawn(withdraw.leave.id);
        return withdraw;
    }
    async reject(id, user) {
        const withdraw = await this.withdrawRepository.findOne({ where: { id }, relations: ['leave', 'approver'] });
        if (!withdraw) {
            throw new common_1.BadRequestException("Withdraw not found");
        }
        await this.withdrawRepository.update(id, { status: withdraw_entity_1.WithdrawStatus.WITHDRAW_REJECTED, approver: user, approved_date: new Date() });
        return withdraw;
    }
    async create(createWithdrawDto) {
        const leave = await this.leaveService.findOne(createWithdrawDto.leave_id);
        if (!leave) {
            throw new common_1.BadRequestException("Leave not found");
        }
        this.eventEmitter.emit('withdraw.request.created', new withdraw_request_event_1.WithdrawRequestEvent(leave.id));
        return this.withdrawRepository.save({ leave: leave });
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
    async findBySite(site, status = withdraw_entity_1.WithdrawStatus.WITHDRAW_PENDING, onehr_status = false) {
        const allowedSites = this.getAllowedSites(site);
        const withdraws = await this.withdrawRepository
            .createQueryBuilder('withdraw')
            .leftJoinAndSelect('withdraw.leave', 'leave')
            .leftJoinAndSelect('leave.employee', 'employee')
            .where('employee.site IN (:...sites)', { sites: allowedSites })
            .andWhere('withdraw.status = :status', { status })
            .andWhere('withdraw.onehr_status = :onehr_status', { onehr_status })
            .getMany();
        return withdraws;
    }
    async findAll() {
        return await this.withdrawRepository.find({ relations: ['leave', 'approver'] });
    }
    async findOne(id) {
        return await this.withdrawRepository.findOne({ where: { id }, relations: ['leave', 'approver', 'leave.employee'] });
    }
    async update(id, updateWithdrawDto) {
    }
    async remove(id) {
        return await this.withdrawRepository.delete(id);
    }
};
exports.WithdrawService = WithdrawService;
exports.WithdrawService = WithdrawService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(withdraw_entity_1.Withdraw)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        leave_service_1.LeaveService,
        event_emitter_1.EventEmitter2])
], WithdrawService);
//# sourceMappingURL=withdraw.service.js.map