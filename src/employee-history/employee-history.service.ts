import { Injectable } from '@nestjs/common';
import { CreateEmployeeHistoryDto } from './dto/create-employee-history.dto';
import { UpdateEmployeeHistoryDto } from './dto/update-employee-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeHistory } from './entities/employee-history.entity';
import { Repository } from 'typeorm';
import { Employee } from '../employee/entities/employee.entity';

@Injectable()
export class EmployeeHistoryService {
  constructor(
    @InjectRepository(EmployeeHistory)
    private readonly employeeHistoryRepository: Repository<EmployeeHistory>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>
  ) { }

  async rehire(id: string, body: any) {
    const archive = await this.employeeHistoryRepository.findOne({ where: { id }, relations: ['employee'] });
    const employee = archive?.employee;
    if (employee) {
      const doe = new Date(body.DOE)
      var dor = new Date(body.DOR)
      doe.setUTCHours(12, 0, 0, 0);
      dor.setUTCHours(12, 0, 0, 0);

      employee.DOE = doe;
      if (body.DOR == null || body.DOR == '') {
        employee.DOR = null;
      } else {
        employee.DOR = dor;
      }
      employee.matricule = body.matricule;
      employee.is_active = true;
      employee.is_deleted = false;
      employee.manager = null;
      return this.employeeRepository.save(employee);
    }
    return `Employee not found`;
  }

  async paginateArchives(search: string, page: number, limit: number, user: any) {
    const queryBuilder = this.employeeHistoryRepository.createQueryBuilder('employeeHistory');
    queryBuilder
      .where(qb => {
        const subQuery = qb
          .subQuery()
          .select('MAX(eh.createdAt)')
          .from(EmployeeHistory, 'eh')
          .where('eh.employee_id = employeeHistory.employee_id')
          .getQuery();

        return `employeeHistory.createdAt = ${subQuery}`;
      })
      .leftJoinAndSelect('employeeHistory.employee', 'employee')
      .orderBy('employeeHistory.createdAt', 'DESC');
    if (search) {
      queryBuilder.andWhere('employeeHistory.name LIKE :search OR employeeHistory.firstname LIKE :search OR employeeHistory.matricule LIKE :search OR employeeHistory.designation LIKE :search OR employeeHistory.section LIKE :search OR employeeHistory.manager LIKE :search', { search: `%${search}%` });
    }
    // queryBuilder.orderBy(`employeeHistory.createdAt`, 'ASC');
    // queryBuilder.leftJoinAndSelect('employeeHistory.employee', 'employee');
    // queryBuilder.groupBy('employeeHistory.employee_id');

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const data = await queryBuilder.skip(skip).take(limit).getMany();

    return { data, total, totalPages };
  }

  async employeeHistory(employeeId: string) {
    const employeeHistory = await this.employeeHistoryRepository.find({
      where: { employee: { id: employeeId } },
      relations: ['employee'],
      order: { createdAt: 'DESC' }
    });
    return employeeHistory;
  }

  create(createEmployeeHistoryDto: CreateEmployeeHistoryDto) {
    return 'This action adds a new employeeHistory';
  }

  findAll() {
    return `This action returns all employeeHistory`;
  }

  async findOne(id: string) {
    return await this.employeeHistoryRepository.findOne({ where: { id } });
  }

  async update(id: string, updateEmployeeHistoryDto: UpdateEmployeeHistoryDto) {
    return await this.employeeHistoryRepository.update(id, updateEmployeeHistoryDto);
  }

  async remove(id: string) {
    const employee = await this.employeeHistoryRepository.findOne({ where: { id } });
    if (employee) {
      return await this.employeeHistoryRepository.remove(employee);
    }
    return `Employee not found`;
  }
}
