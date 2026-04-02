import { Injectable } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import { Leave } from 'src/leave/entities/leave.entity';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
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
