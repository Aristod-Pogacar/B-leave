import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdraw, WithdrawStatus } from './entities/withdraw.entity';
import { Repository } from 'typeorm';
import { LeaveService } from 'src/leave/leave.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WithdrawRequestEvent } from 'src/notification/events/withdraw-request.event';
import { Site } from 'src/user/entities/user.entity';
import { ApproveWithDrawDto } from './dto/approve-withdraw.dto';
import { LeaveStatus } from 'src/leave/entities/leave.entity';

@Injectable()
export class WithdrawService {

  constructor(
    @InjectRepository(Withdraw)
    private readonly withdrawRepository: Repository<Withdraw>,
    private readonly leaveService: LeaveService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async done(id: string, userId: string) {
    const withdraw = await this.withdrawRepository.findOne({ where: { id }, relations: ['leave'] });
    if (!withdraw) {
      throw new BadRequestException("Withdraw not found");
    }
    withdraw.onehr_status = true;
    await this.withdrawRepository.save(withdraw);
    await this.leaveService.approveWithdrawn(withdraw.leave.id, userId);
    return withdraw;
  }

  async markDone(id: string) {
    const withdraw = await this.withdrawRepository.findOne({ where: { id }, relations: ['leave', 'approver'] });
    if (!withdraw) {
      throw new BadRequestException("Withdraw not found");
    }
    withdraw.onehr_status = true;
    await this.withdrawRepository.save(withdraw);
    return withdraw;
  }

  async approve(id: string, user: any) {
    const withdraw = await this.withdrawRepository.findOne({ where: { id }, relations: ['leave', 'approver'] });
    if (!withdraw) {
      throw new BadRequestException("Withdraw not found");
    }

    await this.withdrawRepository.update(id, { status: WithdrawStatus.WITHDRAW_APPROVED, approver: user, approved_date: new Date() });
    await this.leaveService.withdrawn(withdraw.leave.id);
    return withdraw;
  }

  async reject(id: string, user: any) {
    const withdraw = await this.withdrawRepository.findOne({ where: { id }, relations: ['leave', 'approver'] });
    if (!withdraw) {
      throw new BadRequestException("Withdraw not found");
    }
    await this.withdrawRepository.update(id, { status: WithdrawStatus.WITHDRAW_REJECTED, approver: user, approved_date: new Date() });
    return withdraw;
  }

  async create(createWithdrawDto: CreateWithdrawDto) {
    const leave = await this.leaveService.findOne(createWithdrawDto.leave_id);
    if (!leave) {
      throw new BadRequestException("Leave not found");
    }
    this.eventEmitter.emit(
      'withdraw.request.created',
      new WithdrawRequestEvent(leave.id),
    );
    return this.withdrawRepository.save({ leave: leave });
  }

  private getAllowedSites(userSite: string): string[] {

    if (userSite === Site.MADA) {
      return [Site.ABE1, Site.ABE2, Site.TANA];
    } else if (userSite === Site.ANTSIRABE) {
      return [Site.ABE1, Site.ABE2];
    } else if (userSite === Site.TANA) {
      return [Site.TANA];
    } else if (userSite === Site.ABE1) {
      return [Site.ABE1];
    } else if (userSite === Site.ABE2) {
      return [Site.ABE2];
    } else {
      return [];
    }
  }


  async findBySite(site: Site, status: WithdrawStatus = WithdrawStatus.WITHDRAW_PENDING, onehr_status: boolean = false) {
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

  async findOne(id: string) {
    return await this.withdrawRepository.findOne({ where: { id }, relations: ['leave', 'approver', 'leave.employee'] });
  }

  async update(id: string, updateWithdrawDto: UpdateWithdrawDto) {
    // return await this.withdrawRepository.update(id, updateWithdrawDto);
  }

  async remove(id: string) {
    return await this.withdrawRepository.delete(id);
  }
}
