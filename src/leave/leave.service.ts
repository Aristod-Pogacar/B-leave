import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Leave, LeaveStatus, WithdrawStatus } from './entities/leave.entity';
import { Between, In, IsNull, LessThanOrEqual, Like, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import * as express from 'express';
import * as ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { Site, User, UserRole } from 'src/user/entities/user.entity';
import { EmployeeService } from 'src/employee/employee.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { HistoryReason } from 'src/history/entities/history.entity';
import { HistoryService } from 'src/history/history.service';
import { Permission2h } from 'src/permission2h/entities/permission2h.entity';
import { SmiaOstie } from 'src/smia_ostie/entities/smia_ostie.entity';
import { WithdrawLeaveDto } from '../api/leave/dto/with-draw-leave.dto';
import { CarriedForwardService } from 'src/carried-forward/carried-forward.service';
import { CarriedForward } from 'src/carried-forward/entities/carried-forward.entity';
import { HolidayService } from 'src/holiday/holiday.service';

@Injectable()
export class LeaveService {

  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission2h)
    private readonly permission2hRepository: Repository<Permission2h>,
    @InjectRepository(SmiaOstie)
    private readonly smiaOstieRepository: Repository<SmiaOstie>,
    private readonly employeeService: EmployeeService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly historyService: HistoryService,
    private readonly carriedForwardService: CarriedForwardService,
    @InjectRepository(CarriedForward)
    private readonly carriedForwardRepository: Repository<CarriedForward>,
    private readonly holidayService: HolidayService,
  ) { }

  async withdrawn(id: string) {
    const leave = await this.leaveRepository.findOne({ where: { id } });
    if (!leave) {
      throw new BadRequestException("Leave not found");
    }
    leave.status = LeaveStatus.WITHDRAWN;
    await this.leaveRepository.save(leave);
    return leave;
  }

  async approveWithdrawn(id: string, userId: string) {
    const leave = await this.leaveRepository.findOne({ where: { id }, relations: ['employee'] });
    if (!leave) {
      throw new BadRequestException("Leave not found");
    }
    leave.status = LeaveStatus.WITHDRAWN;
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['employee'] });
    // if (!user) {
    //   throw new BadRequestException("User not found");
    // }
    await this.leaveRepository.save(leave);
    await this.historyService.create({
      reason: HistoryReason.LEAVE,
      message: "Wthdrawn leave " + leave.id + " (" + leave.start_date + " to " + leave.end_date + " of " + leave.leave_type + ") by " + user?.employee?.firstname + " " + user?.employee?.name,
      created_by: "" + user?.employee?.matricule,
    });
    return leave;
  }

  async findLeavesNotDone(limit?: number) {
    return this.leaveRepository.find({ where: { onehr_status: false }, relations: ['employee'], order: { start_date: 'ASC' }, take: limit });
  }

  async doneLeave(leave: Leave) {
    leave.onehr_status = true;
    return this.leaveRepository.save(leave);
  }

  async getNonApprouvedLeaves(
    user: any,
    typeLeaves: string[] = ['Local_Leave_AMD', 'Indisponibilite_AMD']
  ) {
    var leaves: Leave[];

    const today = new Date();

    if (user.role === UserRole.HR_LEAD) {
      leaves = await this.leaveRepository.find({
        where: {
          employee: {
            is_active: true,
            is_deleted: false
          },
          status: LeaveStatus.PENDING,
          leave_type: In(typeLeaves)
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

        const daysBefore = Math.ceil(
          (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        return daysBefore <= 3;
      });
    } else if (user.role === UserRole.SUPERADMIN) {
      leaves = await this.leaveRepository.find({
        where: {
          employee: {
            is_active: true,
            is_deleted: false
          },
          status: LeaveStatus.PENDING,
          leave_type: In(typeLeaves)
        },
        relations: [
          'employee',
          'employee.manager',
          'employee.manager.manager'
        ],
        order: { created_at: 'ASC' }
      });
      return leaves
    } else {
      const employee = await this.employeeRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['manager', 'user']
      });

      if (!employee) return [];

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
          status: LeaveStatus.PENDING,
          leave_type: In(typeLeaves)
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

        const daysBefore = Math.ceil(
          (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Manager direct
        if (leave.employee.manager?.id === employee.id) {
          return true;
        }

        // Manager N+2
        if (leave.employee.manager?.manager?.id === employee.id) {
          return daysBefore <= 5;
        }

        return false;
      });
    }
  }

  async getPermissions(user: any, startDate: Date, endDate: Date, status: string) {
    if (user.role == UserRole.MANAGER) {
      return this.leaveRepository.find({
        where: {
          start_date: Between(
            new Date(startDate),
            new Date(endDate)
          ),
          employee: {
            manager: {
              id: user.employee?.id
            },
            is_active: true,
            is_deleted: false
          },
          status: In([
            LeaveStatus.APPROVED,
            LeaveStatus.PENDING
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
        start_date: Between(
          new Date(startDate),
          new Date(endDate)
        ),
        employee: {
          site: In(allowedSites),
          is_active: true,
          is_deleted: false
        },
        status: In([
          LeaveStatus.APPROVED,
          LeaveStatus.PENDING
        ]),
        leave_type: 'Permission_AMD'
      },
      relations: [
        'employee',
        'approver'
      ]
    });
  }

  async approveLeave(leaveId: string, id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const leave = await this.leaveRepository.findOne({ where: { id: leaveId } });
    if (!leave) {
      throw new NotFoundException('Leave not found');
    }
    leave.approver = user;
    leave.approved_date = new Date();
    leave.status = LeaveStatus.APPROVED;
    return this.leaveRepository.save(leave);
  }

  async rejectLeave(leaveId: string, id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const leave = await this.leaveRepository.findOne({ where: { id: leaveId } });
    if (!leave) {
      throw new NotFoundException('Leave not found');
    }
    leave.approver = user;
    leave.approved_date = new Date();
    leave.status = LeaveStatus.REJECTED;
    return this.leaveRepository.save(leave);
  }

  async getLeavesByRange(year: number, startMonth: number, endMonth: number, line: string, departement: string, section: string, division: string, site: string, user: any, search: string) {
    if (user.role == UserRole.MANAGER) {
      if (search && search.trim() !== "") {
        return this.leaveRepository.find({
          where: {
            start_date: Between(
              new Date(year, startMonth, 0),
              new Date(year, endMonth + 1, 0)
            ),
            employee: [
              { manager: { id: user.employee?.id }, matricule: Like(`%${search}%`), is_active: true, is_deleted: false },
              { manager: { id: user.employee?.id }, name: Like(`%${search}%`), is_active: true, is_deleted: false },
              { manager: { id: user.employee?.id }, firstname: Like(`%${search}%`), is_active: true, is_deleted: false },
              { manager: { id: user.employee?.id }, division: Like(`%${search}%`), is_active: true, is_deleted: false },
              { manager: { id: user.employee?.id }, section: Like(`%${search}%`), is_active: true, is_deleted: false },
            ],
            status: In([
              LeaveStatus.APPROVED,
              LeaveStatus.PENDING
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
          start_date: Between(
            new Date(year, startMonth, 0),
            new Date(year, endMonth + 1, 0)
          ),
          employee: {
            manager: {
              id: user.employee?.id
            },
            is_active: true,
            is_deleted: false
          },
          status: In([
            LeaveStatus.APPROVED,
            LeaveStatus.PENDING
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
          start_date: Between(
            new Date(year, startMonth, 0),
            new Date(year, endMonth + 1, 0)
          ),
          employee: [
            { matricule: Like(`%${search}%`), is_active: true, is_deleted: false },
            { name: Like(`%${search}%`), is_active: true, is_deleted: false },
            { firstname: Like(`%${search}%`), is_active: true, is_deleted: false },
            { division: Like(`%${search}%`), is_active: true, is_deleted: false },
            { section: Like(`%${search}%`), is_active: true, is_deleted: false },
          ],
          status: In([
            LeaveStatus.APPROVED,
            LeaveStatus.PENDING
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
        start_date: Between(
          new Date(year, startMonth, 0),
          new Date(year, endMonth + 1, 0)
        ),
        employee: {
          line,
          section,
          division,
          site,
          is_active: true,
          is_deleted: false
        },
        status: In([
          LeaveStatus.APPROVED,
          LeaveStatus.PENDING
        ])
      },
      relations: [
        'employee',
        'approver'
      ]
    });
  }

  getLeavesByMonthAndLineAndDepartement(year: number, month: number, line: string, departement: string, site: string) {
    return this.leaveRepository.find({
      where: {
        start_date: Between(new Date(year, month, 1), new Date(year, month, 31)),
        employee: { line, departement, site, is_active: true, is_deleted: false },
        status: In([LeaveStatus.APPROVED, LeaveStatus.PENDING])
      },
      relations: ['employee', 'approver']
    });
  }

  async create(createLeaveDto: CreateLeaveDto, res: express.Response, req: any) {
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
      reason: HistoryReason.LEAVE,
      message: "New leave " + leaveSaved.id + " by " + req.session.user.employee.firstname + " " + req.session.user.employee.name,
      created_by: req.session.user.matricule,
    });
    var email: string[] = [];
    const manager = employee.manager;
    if (manager) email.push(manager.user?.email ?? '');
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

  async importLeaves(file: Express.Multer.File, userId: string) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer as any);

      const worksheet = workbook.getWorksheet("Leaves");

      if (!worksheet) {
        const message = 'No sheet found in the Excel file'
        throw new Error(message);
      }
      const headerRow = worksheet.getRow(1);
      const headerMap: Record<string, number> = {};

      headerRow.eachCell((cell, colNumber) => {
        const headerName = cell.value?.toString().trim().toLowerCase();
        if (headerName) {
          headerMap[headerName] = colNumber;
        }
      });


      // 2️⃣ Vérifier que les colonnes obligatoires existent
      const requiredColumns = ['matricule', 'fullname', 'type', 'start date', 'end date', 'reason'];

      for (const column of requiredColumns) {
        if (!headerMap[column]) {
          throw new Error(`Missing column: ${column}`);
        }
      }
      const leaves: Partial<Leave>[] = [];

      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        console.log(row.getCell(headerMap['matricule']).value?.toString());
        const employee = await this.employeeRepository.findOne({ where: { matricule: row.getCell(headerMap['matricule']).value?.toString() } });
        let leave_type = row.getCell(headerMap['type']).value?.toString();
        if (leave_type === "Local Leave") {
          leave_type = "Local_Leave_AMD";
        } else if (leave_type === "Permission") {
          leave_type = "Permission_AMD";
        } else if (leave_type === "Indisponibilite") {
          leave_type = "Indisponibilite_AMD";
        }
        if (!employee) {
          continue;
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
          continue;
        }
        const startDate = row.getCell(headerMap['start date']).value as Date;
        const endDate = row.getCell(headerMap['end date']).value as Date;
        const reason = row.getCell(headerMap['reason']).value as string;
        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
        const data = {
          employee: employee,
          leave_type: leave_type,
          start_date: startDate,
          end_date: endDate,
          duration: duration,
          status: LeaveStatus.APPROVED,
          imported: true,
          reason: reason,
          approver: user,
          approved_date: new Date(),
        }
        leaves.push(data);
      }

      await this.leaveRepository.save(leaves);
      return {
        result: 'success',
        message: 'File readed successfully',
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message,
      };
    }
  }

  async importCarriedForwardLeaves(file: Express.Multer.File, date: Date) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer as any);

      const worksheet = workbook.getWorksheet("Carried");

      if (!worksheet) {
        const message = 'Aucune feuille trouvée dans le fichier Excel'
        throw new Error(message);
      }
      const headerRow = worksheet.getRow(1);
      const headerMap: Record<string, number> = {};

      headerRow.eachCell((cell, colNumber) => {
        const headerName = cell.value?.toString().trim().toLowerCase();
        if (headerName) {
          headerMap[headerName] = colNumber;
        }
      });

      // 2️⃣ Vérifier que les colonnes obligatoires existent
      const requiredColumns = ['matricule', 'fullname', 'carried forward', 'taken', 'current balance'];

      for (const column of requiredColumns) {
        if (!headerMap[column]) {
          throw new Error(`Missing column: ${column}`);
        }
      }
      const carriedForwards: CarriedForward[] = [];

      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        console.log('ROW:', i)
        const employee = await this.employeeRepository.findOne({ where: { matricule: row.getCell(headerMap['matricule']).value?.toString() } });
        if (!employee) {
          continue;
        }
        const carriedForward = new CarriedForward();
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
    } catch (error) {
      return {
        result: 'error',
        message: error.message,
      };
    }
  }

  async getEmployeeCumulativeBalance(employeeId: string = "", date: Date) {
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
          .from(CarriedForward, 'cf2')
          .leftJoin('cf2.employee', 'emp2')
          .where('emp2.id = employee.id')
          .andWhere('YEAR(cf2.date) = :year')
          .getQuery();

        return `cf.date = ${subQuery}`;
      })
      .setParameter('year', year)
      .getRawOne();

    console.log("CARRIED FORWARD:", carriedForwards)

    if (carriedForwards) {

      const carriedForwardMap = new Map(
        [carriedForwards].map(cf => [
          cf.employeeId,
          {
            days: Number(cf.days),
            daysTaken: Number(cf.daysTaken || 0),
            date: new Date(cf.date),
          },
        ]),
      );
    }

    const [data] = await this.employeeRepository
      .createQueryBuilder('e')
      .where(
        'e.id = :id AND e.is_active = true AND e.is_deleted = false',
        { id: employeeId },
      )
      // .andWhere('u.id IS NULL')
      .select(['e.id', 'e.matricule', 'e.name', 'e.firstname', 'e.DOE'])
      .take(10)
      .getManyAndCount();

    const takenLeaves = await this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoin('leave.employee', 'employee')
      .select('employee.id', 'employeeId')
      .addSelect('leave.start_date', 'start_date')
      .addSelect('leave.end_date', 'end_date')
      .addSelect(
        'SUM(DATEDIFF(leave.end_date, leave.start_date) + 1)',
        'daysTaken'
      )
      .where('employee.id IN (:...employeeIds)', { employeeIds: [employeeId] })
      .andWhere('leave.status IN (:...status)', { status: [LeaveStatus.APPROVED, LeaveStatus.PENDING] })
      .andWhere('leave.leave_type = :type', { type: 'Local_Leave_AMD' })
      .andWhere('YEAR(leave.start_date) = :year', { year: date.getFullYear() })
      .andWhere('employee.is_active = true AND employee.is_deleted = false')
      .groupBy('employee.id')
      .getRawMany();
    // // return data;

    const takenMap = new Map<string, number>();

    takenLeaves.forEach(async l => {
      const holidays = await this.employeeService.getDaysTakenWithHoliday(l.start_date, l.end_date);
      const daysTaken = Number(l.daysTaken) - holidays;
      takenMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
      // takenMap.set(l.employeeId, Number(l.daysTaken));
    });

    const promises = data.map(async (emp) => {

      var debut = 0;
      var daysTaken = 0;
      var dateFilter = Between(new Date(year, 0, 1), new Date(year, 11, 31));
      if (carriedForwards) {
        debut = carriedForwards.days;
        daysTaken = carriedForwards.daysTaken;
        // dateFilter = Between(new Date(carriedForward.date), new Date(year, 11, 31));
      }

      const localLeaves = await this.leaveRepository.find({
        where: {
          employee: { id: emp.id },
          leave_type: 'Local_Leave_AMD',
          status: LeaveStatus.APPROVED,
          start_date: dateFilter,
          // end_date: Between(new Date(year, 0, 1), new Date(year, 11, 31))
        },
        relations: ['employee']
      });
      const permissionQuery = this.leaveRepository
        .createQueryBuilder('leave')
        .leftJoin('leave.employee', 'employee')
        .where('employee.id = :id', { id: emp.id })
        .andWhere('leave.status = :status', { status: LeaveStatus.APPROVED })
        .andWhere('leave.leave_type = :type', { type: 'Permission_AMD' })
        .andWhere('YEAR(leave.start_date) = :year', { year })

      if (carriedForwards) {
        permissionQuery.andWhere('leave.start_date >= :cfDate', {
          cfDate: carriedForwards.date,
        });
      }
      const permissions = await permissionQuery.getMany();
      var permissionTaken = 0;
      let localLeaveTaken = 0;

      for (const leave of localLeaves) {
        const holidays = await this.getDaysTakenWithHoliday(
          new Date(leave.start_date).toISOString().split('T')[0],
          new Date(leave.end_date).toISOString().split('T')[0],
        );

        localLeaveTaken +=
          this.calculateDaysBetween(new Date(leave.start_date), new Date(leave.end_date))
          - holidays;
      }
      permissions.forEach(async l => {
        permissionTaken += Number(this.calculateDaysBetween(new Date(l.start_date), new Date(l.end_date)));
      });

      let sld = 0;

      if (carriedForwards) {
        // console.log('CARRIED FORWARD:', carriedForward)

        sld = this.calculateSoldeCumulFromDate(
          carriedForwards.date,
          carriedForwards.days,
          date,
        );

      } else {

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

  async getEmployeeSolde(matricule: string, at: Date) {
    const year = at.getFullYear();
    const employee = await this.employeeRepository.findOne({ where: { matricule, is_active: true, is_deleted: false } });
    if (!employee) return { solde_cumul: 0, solde_pris: 0, solde_restant: 0, solde_cumul_mensuel: 0 };

    const takenLeaves = await this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoin('leave.employee', 'employee')
      .select('employee.id', 'employeeId')
      .addSelect('leave.start_date', 'start_date')
      .addSelect('leave.end_date', 'end_date')
      .addSelect(
        'SUM(DATEDIFF(leave.end_date, leave.start_date) + 1)',
        'daysTaken'
      )
      .where('employee.id = :employeeId', { employeeId: employee.id })
      .andWhere('leave.status IN (:...status)', { status: [LeaveStatus.APPROVED, LeaveStatus.PENDING] })
      .andWhere('leave.leave_type = :type', { type: 'Local_Leave_AMD' })
      .andWhere('YEAR(leave.start_date) = :year', { year })
      .andWhere('leave.start_date <= :at', { at })
      .groupBy('employee.id')
      .getRawMany();


    const takenLeavesMap = new Map<string, number>();

    takenLeaves.forEach(async l => {
      const holidays = await this.employeeService.getDaysTakenWithHoliday(l.start_date, l.end_date);
      const daysTaken = Number(l.daysTaken) - holidays;
      takenLeavesMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
      // takenMap.set(l.employeeId, Number(l.daysTaken));

    });

    function estDernierJourDuMois(date: Date) {
      // 1. On récupère l'année et le mois de la date testée
      const annee = date.getFullYear();
      const mois = date.getMonth();

      // 2. On crée une date pour le jour suivant
      const demain = new Date(date);
      demain.setDate(date.getDate() + 1);

      // 3. Si le mois de "demain" est différent, c'est que "date" était le dernier jour
      return demain.getMonth() !== mois;
    }

    let soldeCumul = 0;
    let soldeCumulMensuel = 2.5 * at.getMonth();

    if (estDernierJourDuMois(at)) {
      soldeCumulMensuel = 2.5 * (at.getMonth() + 1);
    }

    const getCumul = (date: Date) => {
      let cumul = 0;
      for (let m = 0; m <= date.getMonth(); m++) {
        const daysInMonth = new Date(date.getFullYear(), m + 1, 0).getDate();

        if (m === date.getMonth()) {
          cumul += (2.5 / daysInMonth) * date.getDate();
        } else {
          cumul += 2.5;
        }
      }
      return cumul;
    }

    if (year < at.getFullYear()) {
      // année passée → solde plein
      soldeCumul = 2.5 * 12;
    } else if (year > at.getFullYear()) {
      // année future → rien
      soldeCumul = 0;
    } else {
      // année en cours → calcul journalier
      soldeCumul = getCumul(at);
    }

    const yearAfterDOE = new Date(employee.DOE);
    yearAfterDOE.setFullYear(yearAfterDOE.getFullYear() + 1);
    if (at.getFullYear() === yearAfterDOE.getFullYear()) {
      soldeCumul = soldeCumul - getCumul(yearAfterDOE);
    } else if (at.getFullYear() <= yearAfterDOE.getFullYear()) {
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

  calculateCumulBalance(date: Date) {
    let soldeCumul = 0;
    for (let m = 0; m <= date.getMonth(); m++) {
      const daysInMonth = new Date(date.getFullYear(), m + 1, 0).getDate();

      if (m === date.getMonth()) {
        soldeCumul += (2.5 / daysInMonth) * date.getDate();
      } else {
        soldeCumul += 2.5;
      }
    }
    return soldeCumul;
  }


  findAll() {
    return this.leaveRepository.find();
  }

  async findOne(id: string) {
    return await this.leaveRepository.findOne({ where: { id }, relations: ['employee'] });
  }

  async update(id: string, updateLeaveDto: UpdateLeaveDto) {
    const employee = await this.employeeRepository.findOne({
      where: { id: updateLeaveDto.employee },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.leaveRepository.update(id, {
      ...updateLeaveDto,
      employee,
    });
  }

  remove(id: string) {
    return this.leaveRepository.delete(id);
  }

  async getPaginateEmployeeLeaves(employeeId: string, skip: number = 0, take: number = 1000, startDate: Date, endDate: Date, status: string) {
    const [data, count] = await this.leaveRepository.findAndCount({
      where: {
        employee: {
          id: employeeId,
          is_active: true,
          is_deleted: false
        },
        start_date: Between(new Date(startDate), new Date(endDate)),
        status: In(this.getLeavesByStatus(status)),
        leave_type: Not("Permission_AMD")
      },
      order: { start_date: 'DESC' },
      relations: ['approver', 'approver.employee', 'employee'],
    });
    return { data, count };
  }

  async getEmployeeLeaves(employeeId: string) {
    return this.leaveRepository.find({ where: { employee: { id: employeeId, is_active: true, is_deleted: false } }, });
  }

  async getEmployeeLeavesByDate(employeeId: string, date: Date) {
    return this.leaveRepository.find({ where: { employee: { id: employeeId, is_active: true, is_deleted: false }, start_date: date } });
  }

  async getEmployeeLeavesByMonth(employeeId: string, month: number, year: number) {
    return this.leaveRepository.find({ where: { employee: { id: employeeId, is_active: true, is_deleted: false }, start_date: Between(new Date(year, month, 1), new Date(year, month + 1, 1)) } });
  }

  async getEmployeeLeavesByYear(employeeId: string, year: number) {
    return this.leaveRepository.find({ where: { employee: { id: employeeId, is_active: true, is_deleted: false }, start_date: Between(new Date(year, 0, 1), new Date(year + 1, 0, 1)) } });
  }

  async getEmployeeLeavesByRange(employeeId: string, startDate: Date, endDate: Date) {
    return this.leaveRepository.find({ where: { employee: { id: employeeId, is_active: true, is_deleted: false }, start_date: Between(startDate, endDate) } });
  }

  async getLeavesByLine(line: string) {
    return this.leaveRepository.find({ where: { employee: { line, is_active: true, is_deleted: false } } });
  }

  async getLeavesBySection(section: string) {
    return this.leaveRepository.find({ where: { employee: { section, is_active: true, is_deleted: false } } });
  }

  async getLeavesByMonth(month: number, year: number) {
    return this.leaveRepository.find({ where: { start_date: Between(new Date(year, month, 1), new Date(year, month + 1, 1)) } });
  }

  async getLeavesByYear(year: number) {
    return this.leaveRepository.find({ where: { start_date: Between(new Date(year, 0, 1), new Date(year + 1, 0, 1)) } });
  }

  async getLeavesByLineAndSection(line: string, section: string) {
    return this.leaveRepository.find({ where: { employee: { line, section, is_active: true, is_deleted: false } } });
  }

  async getPlanning(
    year: number,
    startMonth: number,
    endMonth: number,
    line?: string,
    section?: string,
    skip = 0,
    take = 30,
  ) {
    const startDate = new Date(year, startMonth - 1, 1);
    const endDate = new Date(year, endMonth, 0); // dernier jour du mois

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
      .where(
        `
      leave.start_date <= :endDate
      AND leave.end_date >= :startDate
      `,
        { startDate, endDate },
      )
      .andWhere('leave.status != :status', { status: LeaveStatus.REJECTED });

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

  getDatesBetween(startDate: Date, endDate: Date) {

    const dates: Date[] = [];

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

  getLeavesByStatus(status: string) {
    switch (status) {
      case "pending":
        return [LeaveStatus.PENDING]
      case "approved":
        return [LeaveStatus.APPROVED]
      case "rejected":
        return [LeaveStatus.REJECTED]
      default:
        return [LeaveStatus.REJECTED, LeaveStatus.PENDING, LeaveStatus.APPROVED]
    }
  }

  async exportLeavePlanning(
    user: any,
    startDate: Date,
    endDate: Date,
    line?: string,
    section?: string,
    division?: string,
    site?: string,
    status: string = "all"
  ) {
    let leaves: Leave[];
    let employees: Employee[];

    const leaveEx = this.getLeavesByStatus(status);
    const dates = this.getDatesBetween(startDate, endDate);

    if (user && user.role === UserRole.MANAGER) {
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
            status: In(leaveEx),
          },
        ],
        relations: ["employee"],
      });
    } else {
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
            status: In(leaveEx),
          },
        ],
        relations: ["employee"],
      });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Leave Planning");

    /*
        HEADER
    */
    const header = [
      "Employee Code",
      "Card No (Optional)",
      "Employee Name (Optional)",
      ...dates.map((d) =>
        d.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })
      ),
    ];

    sheet.addRow(header);

    /*
        Construire une map :
        employeeId_date => leaveType
    */
    const leaveMap = new Map<string, string>();

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

    /*
        Ajouter lignes employé
    */
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

      // coloration des congés
      dates.forEach((_, index) => {
        const cell = row.getCell(index + 4);
        const value = cell.value as string;
      });
    });

    /*
        largeur colonnes
    */
    sheet.getColumn(1).width = 20;
    sheet.getColumn(2).width = 20;
    sheet.getColumn(3).width = 30;

    for (let i = 4; i <= header.length; i++) {
      sheet.getColumn(i).width = 16;
    }

    return workbook;
  }

  private formatDateUTC(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  async exportEmployeeLeaves(employee: Employee, startDate: Date, endDate: Date, status: string) {
    const leaves = await this.leaveRepository.find({
      where: {
        employee: { id: employee.id, is_active: true, is_deleted: false },
        start_date: Between(startDate, endDate),
        status: In(this.getLeavesByStatus(status))
      },
      order: { start_date: 'DESC' },
      relations: ['employee', 'approver']
    })

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
      const approver = leave.approver ? leave.approver.employee?.firstname + " " + leave.approver.employee?.name : ""
      const approvedDate = leave.approved_date ? new Date(leave.approved_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : ""
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

  async getMonthlyAbsenceRate() {
    const now = new Date();

    // Mois courant
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Mois précédent
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // total employés actifs
    const totalEmployees = await this.employeeRepository.count({
      where: {
        is_active: true,
        // is_deleted: false,
      },
    });

    // absences mois courant
    const currentAbsenceDays = await this.getLeaveDaysBetween(
      currentMonthStart,
      currentMonthEnd,
    );

    // absences mois précédent
    const lastAbsenceDays = await this.getLeaveDaysBetween(
      lastMonthStart,
      lastMonthEnd,
    );

    // nombre de jours du mois
    const daysInCurrentMonth = currentMonthEnd.getDate();

    // taux %
    const currentRate =
      (currentAbsenceDays / (totalEmployees * daysInCurrentMonth)) * 100;

    const lastRate =
      (lastAbsenceDays / (totalEmployees * lastMonthEnd.getDate())) * 100;

    const variation = currentRate - lastRate;

    return {
      currentRate: currentRate.toFixed(1),
      lastRate: lastRate.toFixed(1),
      variation: variation.toFixed(1),
    };
  }

  private async getLeaveDaysBetween(
    start: Date,
    end: Date,
    status = [LeaveStatus.APPROVED]
  ): Promise<number> {
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
      } else {
        overlapStart = start;
      }

      if (en < end) {
        overlapEnd = en;
      } else {
        overlapEnd = end;
      }

      const days = this.compterJours(overlapStart, overlapEnd);
      total += days;
    }


    return total;
  }

  private async getLeaveByStatusDaysBetween(
    start: Date,
    end: Date,
    status: string = LeaveStatus.APPROVED,
    type: string = "Local_Leave_AMD",
  ): Promise<number> {
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
      } else {
        overlapStart = start;
      }

      if (en < end) {
        overlapEnd = en;
      } else {
        overlapEnd = end;
      }

      const days = this.compterJours(overlapStart, overlapEnd);
      total += days;
    }


    return total;
  }

  async getLeavesStatsCurrentMonth(date: Date = new Date()) {
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

    // total demandes ce mois
    const totalLeaves = await qb.getCount();

    // leaves approuvés
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

    // leaves en cours aujourd'hui
    const today = new Date().toISOString().split('T')[0];

    const ongoingLeaves = await this.employeeRepository
      .createQueryBuilder('employee')
      .innerJoin(
        'employee.leaves',
        'leave',
        `
      leave.status = :status
      AND :today BETWEEN leave.start_date AND leave.end_date
      `,
        {
          status: 'APPROVED',
          today,
        },
      )
      .andWhere('employee.is_active = :is_active', {
        is_active: true,
      })
      .andWhere('employee.is_deleted = :is_deleted', {
        is_deleted: false,
      })
      .distinct(true)
      .getCount();

    const approvalRate =
      totalLeaves > 0
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
        start_date: Between(
          new Date(now.getFullYear(), now.getMonth(), 1),
          new Date(now.getFullYear(), now.getMonth() + 1, 0)
        ),
        status: LeaveStatus.PENDING,
        employee: {
          is_active: true,
          is_deleted: false,
        },
      },
      relations: [
        'employee',
        'approver'
      ]
    })
    const totalLeaves = leaves.length;
    // demandes en attente
    const pendingLeaves = await this.leaveRepository
      .createQueryBuilder('leave')
      .innerJoinAndSelect('leave.employee', 'employee')
      .where('leave.status = :status', { status: 'PENDING' }) // ou LeaveStatus.PENDING
      .andWhere('employee.is_active = :is_active', {
        is_active: true,
      })
      .andWhere('employee.is_deleted = :is_deleted', {
        is_deleted: false,
      })
      .getCount();

    const pendingRate =
      totalLeaves > 0
        ? ((pendingLeaves / totalLeaves) * 100).toFixed(0)
        : 0;

    return {
      pendingLeaves,
      totalLeaves,
      pendingRate,
    };
  }

  async getAbsenceByMonth(year = 2026): Promise<{ month: number; leaveApproved: number; leavePending: number; permissionApproved: number; permissionPending: number; indispoApproved: number; indispoPending: number }[]> {
    const result: { month: number; leaveApproved: number; leavePending: number; permissionApproved: number; permissionPending: number; indispoApproved: number; indispoPending: number }[] = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      const leaveApproved =
        await this.getLeaveDaysBetween(monthStart, monthEnd, [LeaveStatus.APPROVED]);

      const leavePending =
        await this.getLeaveDaysBetween(monthStart, monthEnd, [LeaveStatus.PENDING]);

      const permissionApproved =
        await this.getPermissionDaysBetween(monthStart, monthEnd, [LeaveStatus.APPROVED]);

      const permissionPending =
        await this.getPermissionDaysBetween(monthStart, monthEnd, [LeaveStatus.PENDING]);

      const indispoApproved =
        await this.getIndisponibilityDaysBetween(monthStart, monthEnd, [LeaveStatus.APPROVED]);

      const indispoPending =
        await this.getIndisponibilityDaysBetween(monthStart, monthEnd, [LeaveStatus.PENDING]);

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
  private async getPermissionDaysBetween(
    start: Date,
    end: Date,
    status = [LeaveStatus.APPROVED]
  ): Promise<number> {
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
      } else {
        overlapStart = start;
      }

      if (en < end) {
        overlapEnd = en;
      } else {
        overlapEnd = end;
      }

      const days = this.compterJours(overlapStart, overlapEnd);
      total += days;
    }

    return total;
  }

  private compterJours(dateDebut, dateFin) {
    // On utilise .getTime() pour obtenir la valeur en millisecondes (type number)
    const msParJour = 1000 * 60 * 60 * 24;

    const debutMs = dateDebut.getTime();
    const finMs = dateFin.getTime();

    // L'opération est maintenant permise car on manipule des 'number'
    const differenceMs = Math.abs(finMs - debutMs);

    return Math.round(differenceMs / msParJour) + 1;
  }
  private async getIndisponibilityDaysBetween(
    start: Date,
    end: Date,
    status = [LeaveStatus.APPROVED],
  ): Promise<number> {

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
      } else {
        overlapStart = start;
      }

      if (en < end) {
        overlapEnd = en;
      } else {
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

    const total =
      localLeave +
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

    const localLeavePast = await this.getLeaveByStatusDaysBetween(new Date(today.getFullYear(), 0, 1), today, LeaveStatus.APPROVED, 'Local_Leave_AMD');
    const permissionPast = await this.getLeaveByStatusDaysBetween(new Date(today.getFullYear(), 0, 1), today, LeaveStatus.APPROVED, 'Permission_AMD');
    const indispoPast = await this.getLeaveByStatusDaysBetween(new Date(today.getFullYear(), 0, 1), today, LeaveStatus.APPROVED, 'Indisponibilite_AMD');

    const totalPast = localLeavePast + permissionPast + indispoPast;

    const localLeaveFuture = await this.getLeaveByStatusDaysBetween(today, new Date(today.getFullYear(), 11, 31), LeaveStatus.APPROVED, 'Local_Leave_AMD');
    const permissionFuture = await this.getLeaveByStatusDaysBetween(today, new Date(today.getFullYear(), 11, 31), LeaveStatus.APPROVED, 'Permission_AMD');
    const indispoFuture = await this.getLeaveByStatusDaysBetween(today, new Date(today.getFullYear(), 11, 31), LeaveStatus.APPROVED, 'Indisponibilite_AMD');

    const localLeavePending = await this.getLeaveByStatusDaysBetween(today, new Date(today.getFullYear(), 11, 31), LeaveStatus.PENDING, 'Local_Leave_AMD');
    const permissionPending = await this.getLeaveByStatusDaysBetween(today, new Date(today.getFullYear(), 11, 31), LeaveStatus.PENDING, 'Permission_AMD');
    const indispoPending = await this.getLeaveByStatusDaysBetween(today, new Date(today.getFullYear(), 11, 31), LeaveStatus.PENDING, 'Indisponibilite_AMD');

    const totalPending = localLeavePending + permissionPending + indispoPending;
    const totalFuture = localLeaveFuture + permissionFuture + indispoFuture + totalPending;

    const localLeaveRejected = await this.getLeaveByStatusDaysBetween(new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear(), 11, 31), LeaveStatus.REJECTED, 'Local_Leave_AMD');
    const permissionRejected = await this.getLeaveByStatusDaysBetween(new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear(), 11, 31), LeaveStatus.REJECTED, 'Permission_AMD');
    const indispoRejected = await this.getLeaveByStatusDaysBetween(new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear(), 11, 31), LeaveStatus.REJECTED, 'Indisponibilite_AMD');

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

    const result: SectionAbsenceStat[] = [];

    for (const s of sections) {
      const absent = await this.leaveRepository
        .createQueryBuilder("leave")
        .innerJoin("leave.employee", "employee")
        .where("employee.section = :section AND employee.is_active = true AND employee.is_deleted = false", {
          section: s.section,
        })
        .andWhere("leave.status = :status", {
          status: LeaveStatus.APPROVED,
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

    return result.sort(
      (a, b) => Number(b.pct) - Number(a.pct)
    );
  }

  async getAbsenceByManager(): Promise<any[]> {

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
        status: LeaveStatus.APPROVED,
        employee: { is_active: true, is_deleted: false }
      },
      relations: {
        employee: true,
      }
    });

    const managerMap = new Map();

    // Initialisation des managers
    employees.forEach(employee => {

      if (!employee.manager) return;

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

    // Détection des absents
    leaves.forEach(leave => {

      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const isAbsentToday =
        today >= start &&
        today <= end;

      if (!isAbsentToday) return;

      managerMap.forEach(entry => {

        if (
          entry.employeeIds.includes(leave.employee?.id)
        ) {
          entry.absent += 1;
        }

      });

    });

    // Calcul du %
    const result = Array.from(managerMap.values()).map(entry => ({

      manager: entry.manager,

      employees: entry.employees,

      absent: entry.absent,

      id: entry.id,

      pct:
        entry.employees > 0
          ? Math.round((entry.absent / entry.employees) * 100)
          : 0

    }));

    // Trier du plus absent au moins absent
    result.sort((a, b) => b.pct - a.pct);

    return result;
  }

  async getMonthlyLeaveDistributionBySection() {

    const today = new Date();

    const monthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );

    const monthEnd = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );

    // Toutes les sections existantes
    const sections = await this.employeeRepository
      .createQueryBuilder('employee')
      .select('employee.section', 'section')
      .where('employee.is_deleted = false')
      .andWhere('employee.is_active = true')
      .groupBy('employee.section')
      .orderBy('employee.section', 'ASC')
      .getRawMany();

    // Tous les congés du mois (même chevauchants)
    const leaves = await this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .where('leave.status = :status', {
        status: LeaveStatus.APPROVED,
      })
      .andWhere(
        'leave.start_date <= :monthEnd',
        { monthEnd },
      )
      .andWhere(
        'leave.end_date >= :monthStart',
        { monthStart },
      )
      .getMany();

    const sectionDays = new Map<string, number>();

    let totalDays = 0;

    for (const leave of leaves) {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      const effectiveStart =
        start > monthStart
          ? start
          : monthStart;

      const effectiveEnd =
        end < monthEnd
          ? end
          : monthEnd;

      const days =
        this.compterJours(effectiveStart, effectiveEnd);

      const section =
        leave.employee?.section || 'Unknown';

      sectionDays.set(
        section,
        (sectionDays.get(section) || 0) + days,
      );

      totalDays += days;
    }

    return sections
      .map(({ section }) => {

        const days =
          sectionDays.get(section) || 0;

        const rate =
          totalDays > 0
            ? Number(
              (
                (days / totalDays) *
                100
              ).toFixed(1)
            )
            : 0;

        return {
          section,
          days,
          rate,
        };
      })
      .sort((a, b) => b.days - a.days);
  }

  async getManagerAbsences(managerId: string) {
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
          id: In(employeeIds)
        },
        start_date: LessThanOrEqual(today),
        end_date: MoreThanOrEqual(today),
        status: LeaveStatus.APPROVED
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

  private async calculateAbsenceRateForMonth(
    year: number,
    month: number,
  ): Promise<number> {

    const monthStart = new Date(year, month, 1);

    const monthEnd = new Date(
      year,
      month + 1,
      0,
    );

    const daysInMonth = monthEnd.getDate();

    const totalEmployees =
      await this.employeeRepository.count({
        where: {
          is_active: true,
          is_deleted: false,
        },
      });

    const leaves = await this.leaveRepository
      .createQueryBuilder('leave')
      .where('leave.status = :status', {
        status: LeaveStatus.APPROVED,
      })
      .andWhere(
        'leave.start_date <= :monthEnd',
        { monthEnd },
      )
      .andWhere(
        'leave.end_date >= :monthStart',
        { monthStart },
      )
      .getMany();

    let totalAbsenceDays = 0;

    for (const leave of leaves) {

      const startDate =
        new Date(leave.start_date);

      const endDate =
        new Date(leave.end_date);

      const effectiveStart =
        startDate > monthStart
          ? startDate
          : monthStart;

      const effectiveEnd =
        endDate < monthEnd
          ? endDate
          : monthEnd;

      const absenceDays =
        Math.floor(
          (
            effectiveEnd.getTime() -
            effectiveStart.getTime()
          ) /
          (1000 * 60 * 60 * 24)
        ) + 1;

      totalAbsenceDays += absenceDays;
    }

    const totalAvailableDays =
      totalEmployees * daysInMonth;

    return totalAvailableDays > 0
      ? Number(
        (
          (totalAbsenceDays /
            totalAvailableDays) *
          100
        ).toFixed(2),
      )
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
      .addSelect(
        'COUNT(DISTINCT employee.id)',
        'ongoingEmployees',
      )
      .where('leave.status = :status', {
        status: LeaveStatus.APPROVED,
      })
      .andWhere(':today BETWEEN leave.start_date AND leave.end_date', {
        today,
      })
      .groupBy('employee.section')
      .getRawMany();

    const ongoingMap = new Map(
      ongoingLeaves.map(item => [
        item.section,
        Number(item.ongoingEmployees),
      ]),
    );

    const totalOngoingEmployees =
      ongoingLeaves.reduce(
        (sum, item) =>
          sum + Number(item.ongoingEmployees),
        0,
      );

    return sections.map(section => {

      const ongoingEmployees =
        ongoingMap.get(section.section) || 0;

      const rate =
        totalOngoingEmployees > 0
          ? Number(
            (
              (ongoingEmployees /
                totalOngoingEmployees) *
              100
            ).toFixed(1)
          )
          : 0;

      return {
        section: section.section,
        totalEmployees: Number(
          section.totalEmployees,
        ),
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
        status: LeaveStatus.PENDING,
      })
      .groupBy('employee.section')
      .getRawMany();

    const pendingMap = new Map(
      pendingLeaves.map(item => [
        item.section,
        Number(item.pendingCount),
      ]),
    );

    const totalPending = pendingLeaves.reduce(
      (sum, item) => sum + Number(item.pendingCount),
      0,
    );

    return sections.map(section => {

      const pendingCount =
        pendingMap.get(section.section) || 0;

      const rate =
        totalPending > 0
          ? Number(
            (
              (pendingCount / totalPending) *
              100
            ).toFixed(1)
          )
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

    const currentRate =
      await this.calculateAbsenceRateForMonth(
        today.getFullYear(),
        today.getMonth(),
      );

    const previousMonthDate =
      new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1,
      );

    const previousRate =
      await this.calculateAbsenceRateForMonth(
        previousMonthDate.getFullYear(),
        previousMonthDate.getMonth(),
      );

    const variation = Number(
      (currentRate - previousRate).toFixed(2),
    );

    return {
      currentRate,
      previousRate,
      variation,
    };
  }

  async getDaysTakenWithHoliday(startDate: string, endDate: string) {

    const holidays = await this.holidayService.findBetweenDate(startDate, endDate);

    const daysTakenWithHoliday = holidays.length;

    return daysTakenWithHoliday;
  }

  private calculateDaysBetween(startDate: Date | string, endDate: Date | string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // On ignore les heures
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diff = end.getTime() - start.getTime();

    // +1 car les deux dates sont incluses
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  private calculateSoldeCumulFromDate(
    startDate: Date,
    carriedDays: number,
    targetDate: Date,
  ): number {

    let solde = carriedDays;

    let current = new Date(startDate);

    while (
      current.getFullYear() < targetDate.getFullYear() ||
      (
        current.getFullYear() === targetDate.getFullYear() &&
        current.getMonth() < targetDate.getMonth()
      )
    ) {
      solde += 2.5;

      current = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        current.getDate(),
      );
    }

    if (
      current.getFullYear() === targetDate.getFullYear() &&
      current.getMonth() === targetDate.getMonth()
    ) {
      const daysInMonth = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        0,
      ).getDate();

      solde += (2.5 / daysInMonth) * targetDate.getDate();
    }

    return Number(solde.toFixed(2));
  }

}

export interface MonthlyAbsenceStat {
  month: number;
  leave: number;
  permission: number;
  indispo: number;
}

export interface SectionAbsenceStat {
  section: string;
  employees: number;
  absent: number;
  pct: string;
}