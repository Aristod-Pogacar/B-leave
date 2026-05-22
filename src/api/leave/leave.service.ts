import { Injectable } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Between, In, Repository } from 'typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import { Leave, LeaveStatus } from 'src/leave/entities/leave.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmployeeService } from 'src/employee/employee.service';

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
  ) { }

  async create(createLeaveDto: CreateLeaveDto, res: any) {
    console.log("DTO:", createLeaveDto);

    const employee = await this.employeeRepository.findOne({
      where: { matricule: createLeaveDto.employee },
    });

    // const

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
    console.log("DATE 1", date1);
    console.log("DATE 2", date2);
    // const overlappingLeave = await this.leaveRepository
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
    console.log("OVERLAPPING LEAVE:", overlappingLeave.length);
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
      console.log("EMPLOYEE SOLDE:", employeeSolde.solde_restant);
      console.log("DURATION:", duration);
      console.log("EMPLOYEE SOLDE - DURATION:", employeeSolde.solde_restant - duration);
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
    if (manager) email.push(manager.email);
    const emailAdress = this.configService.get<string>('EMAIL_ADRESS')
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD')
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
