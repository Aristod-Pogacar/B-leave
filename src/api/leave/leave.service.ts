import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Between, In, Repository } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';
import { Leave, LeaveStatus, WithdrawStatus } from '../../leave/entities/leave.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmployeeService } from '../../employee/employee.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeaveCreatedEvent } from '../../notification/events/leave-created.event';
import { UserService } from '../../user/user.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly employeeService: EmployeeService,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
  ) { }

  async findAllHistory(matricule: string) {
    const employee = await this.employeeRepository.findOne({
      where: { matricule, is_active: true },
    });

    if (!employee) {
      return null;
    }

    const leaves = await this.leaveRepository.find({
      where: {
        employee,
        status: In([LeaveStatus.APPROVED, LeaveStatus.PENDING]),
      },
      order: { created_at: 'DESC' },
      relations: ['employee']
    });

    return leaves;
  }

  async create(createLeaveDto: CreateLeaveDto, res: any) {

    const employee = await this.employeeRepository.findOne({
      where: { matricule: createLeaveDto.employee, is_active: true },
      relations: ['manager']
    });

    if (!employee) {
      return res.status(400).json({ message: 'Employee not found' });
    }

    if (createLeaveDto.leave_type == 'Permission_AMD') {

      const d1 = new Date(createLeaveDto.start_date.getFullYear(), 11, 31);
      const d2 = new Date(createLeaveDto.start_date.getFullYear(), 11, 31);

      const permissionList = await this.leaveRepository.find({
        where: { employee, status: LeaveStatus.APPROVED, start_date: Between(d1, d2) }
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
      .where(
        'DATE(leave.start_date) <= :date2 AND DATE(leave.end_date) >= :date1',
        { date1, date2 }
      )
      .andWhere('leave.employee = :employeeId', {
        employeeId: employee.id,
      })
      .andWhere('leave.status IN (:...status)', {
        status: [LeaveStatus.APPROVED, LeaveStatus.PENDING],
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
    var email: string[] = [];
    const manager = employee.manager;
    if (manager) {
      const managerUser = await this.userService.findOneByMatricule(manager.matricule);
      if (managerUser) email.push(managerUser.email);
    }
    const emailAdress = this.configService.get<string>('EMAIL_ADRESS')
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD')
    console.log("EMAIL:", email);
    if (email.length > 0) {
      if (emailAdress && emailPassword) {
        await this.mailerService.sendMail({
          to: email,
          subject: 'Leave request',
          text: 'Leave request',
          html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
        <p>
          Dear <strong>${manager?.name + " " + manager?.firstname}</strong>,
        </p>
        <p>
          <strong>${employee.name + " " + employee.firstname + " (Emp Code - " + employee.matricule + ")"}</strong> has submitted a leave request.
        </p>
        <p>
          <strong>Leave details are:</strong>
        </p>
        <p>
        <table>
          <tr>
            <td>Leave type</td>
            <td>${leaveSaved.leave_type}</td>
          </tr>
          <tr>
            <td>No. of days taken</td>
            <td>${leaveSaved.duration}</td>
          </tr>
          <tr>
            <td>Leave duration</td>
            <td>${new Date(leaveSaved.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + " to " + new Date(leaveSaved.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td>Leave reason</td>
            <td>${leaveSaved.reason}</td>
          </tr>
        </table>
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
    this.eventEmitter.emit(
      'leave.created',
      new LeaveCreatedEvent(leave.id),
    );

    return res.status(200).json(leaveSaved);
  }

  findAll() {
    return `This action returns all leave`;
  }

  findOne(id: number) {
    return `This action returns a #${id} leave`;
  }

  update(id: number, updateLeaveDto: UpdateLeaveDto) {
    return `This action updates a #${id} leave`;
  }

  remove(id: number) {
    return `This action removes a #${id} leave`;
  }
}
