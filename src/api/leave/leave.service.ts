import { Injectable } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import { Leave, LeaveStatus } from 'src/leave/entities/leave.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) { }

  async create(createLeaveDto: CreateLeaveDto, res: any) {
    console.log("EMPLOYEE MATRICULE:", createLeaveDto.employee);

    const employee = await this.employeeRepository.findOne({
      where: { matricule: createLeaveDto.employee },
    });

    if (!employee) {
      return res.status(500).json({ message: 'Employee not found' });
    }

    const date1 = createLeaveDto.start_date.toISOString().split('T')[0];
    const date2 = createLeaveDto.end_date.toISOString().split('T')[0];
    // console.log("DATE 1", date1);
    // console.log("DATE 2", date2);
    // const overlappingLeave = await this.leaveRepository
    const overlappingLeave = await this.leaveRepository
      .createQueryBuilder('leave')
      .where(
        '(leave.start_date BETWEEN :date1 AND :date2 OR leave.end_date BETWEEN :date1 AND :date2 OR (leave.start_date <= :date1 AND leave.end_date >= :date2))',
        { date1, date2 },
      )
      .andWhere('leave.employee = :employeeId', { employeeId: employee.id })
      .andWhere('leave.status = :status', { status: LeaveStatus.APPROVED })
      .getMany();
    console.log("OVERLAPPING LEAVE:", overlappingLeave);

    if (overlappingLeave.length > 0) {
      return res.status(500).json({ message: 'Ce congé chevauche un congé existant' });
    }

    const leave = await this.leaveRepository.create({
      ...createLeaveDto,
      employee,
    });

    const startDate = new Date(createLeaveDto.start_date);
    const endDate = new Date(createLeaveDto.end_date);

    if (startDate > endDate) {
      return res.status(500).json({ message: 'Start date is after end date' });
    }

    const nbDate = endDate.getTime() - startDate.getTime();

    leave.duration = (nbDate / (1000 * 60 * 60 * 24)) + 1;
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
          subject: 'Consultation médicale',
          text: 'Consultation médicale',
          html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
        <p>
          Bonjour Monsieur/Madame,
        </p>
        <p>
          Un membre de votre équipe ayant la matricule <strong>${employee.matricule} (${employee.fullname})</strong> a envoyé une demande de congé et a besoin de votre approbation sur <a href="http://localhost:3000/leave/approuve-leaves" target="_blank">B-Leave</a>.
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
          A member of your team with matricule <strong>${employee.matricule} (${employee.fullname})</strong> has taken a leave and need your approval on <a href="http://localhost:3000/leave/approuve-leaves" target="_blank">B-Leave</a>.
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
