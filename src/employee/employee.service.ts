import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { In, IsNull, Like, Not, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { Leave, LeaveStatus } from 'src/leave/entities/leave.entity';
import { Site, User, UserRole } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CryptoService } from 'src/crypto/crypto.service';
import { CompareAdminDto } from './dto/compare-admin.dto';
import { HistoryService } from 'src/history/history.service';
import { HistoryReason } from 'src/history/entities/history.entity';
import { EmployeeHistory } from 'src/employee-history/entities/employee-history.entity';
import { HolidayService } from 'src/holiday/holiday.service';

@Injectable()
export class EmployeeService {

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeHistory)
    private readonly employeeHistoryRepository: Repository<EmployeeHistory>,
    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
    private readonly holidayService: HolidayService,
    private readonly historyService: HistoryService
  ) { }

  async archiveEmployee(id: string, dor: any) {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) {
      throw new BadRequestException("Employee not found");
    }
    const date = new Date(dor);
    date.setHours(12, 0, 0, 0);
    await this.employeeHistoryRepository.save({
      employee: employee,
      matricule: employee.matricule,
      name: employee.name,
      firstname: employee.firstname,
      section: employee.section,
      site: employee.site,
      job_level: employee.job_level,
      line: employee.line,
      departement: employee.departement,
      designation: employee.designation,
      DOR: date,
      DOE: employee.DOE,
      division: employee.division,
      type: employee.type,
      job_post: employee.job_post,
    });
    employee.is_deleted = true;
    employee.is_active = false;
    employee.DOR = date;
    await this.employeeRepository.save(employee);
    return employee;
  }

  async getEmployeeCountBySection() {
    return this.employeeRepository
      .createQueryBuilder('employee')
      .select('employee.section', 'section')
      .addSelect('COUNT(employee.id)', 'count')
      .where('employee.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('employee.is_active = :isActive', { isActive: true })
      .groupBy('employee.section')
      .orderBy('employee.section', 'ASC')
      .getRawMany();
  }

  async paginateEmployee(search: string, page: number, limit: number, user: any) {
    const query = this.employeeRepository.createQueryBuilder('e');
    query.leftJoinAndSelect('e.manager', 'manager');
    query.orderBy('e.matricule', 'ASC');

    const role = this.getAllowedSites(user.site);

    if (search && search.trim() !== '') {
      query.andWhere(
        'e.matricule LIKE :s OR e.name LIKE :s OR e.firstname LIKE :s',
        { s: `%${search}%` }
      );
    }
    query.andWhere({ site: In(role) });
    query.andWhere({ is_deleted: false, is_active: true });

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, totalPages: Math.ceil(total / limit) };
  }

  async getMyTeam(user: any, search: string) {
    const query = this.employeeRepository.createQueryBuilder('e');
    query.leftJoinAndSelect('e.manager', 'manager');
    query.orderBy('e.matricule', 'ASC');
    query.where({ manager: { id: user.id }, is_active: true, is_deleted: false });

    if (search && search.trim() !== '') {
      query.andWhere(
        '(e.matricule LIKE :s OR e.name LIKE :s OR e.firstname LIKE :s OR e.section LIKE :s OR e.designation LIKE :s) AND e.is_deleted = false AND e.is_active = true',
        { s: `%${search}%` }
      );
    }

    const data = await query.getMany();

    return data;
  }

  async updateManager(data: { matricule: any; manager: any; }) {
    const employee = await this.employeeRepository.findOne({ where: { matricule: data.matricule, is_active: true, is_deleted: false } });
    if (employee) {
      const manager = await this.userRepository.findOne({ where: { matricule: data.manager, role: UserRole.MANAGER } });
      if (manager) {
        employee.manager = manager;
        await this.employeeRepository.save(employee);
      }
    }
  }

  async getAssignedEmployees(managerId: string) {
    return this.employeeRepository.find({
      where: { manager: { id: managerId }, is_active: true, is_deleted: false },
      select: ['name', 'firstname', 'matricule', 'id', 'section', 'line']
    });
  }

  async compare(compareAdminDto: CompareAdminDto) {
    const employee = await this.employeeRepository.findOne({ where: { matricule: compareAdminDto.matricule, is_active: true, is_deleted: false } })
    if (!employee) {
      throw new BadRequestException("Employee not found");
    }
    const compare = await bcrypt.compare(compareAdminDto.password, employee.app_password);
    return { "isEmployee": compare }
  }

  async create(createEmployeeDto: CreateEmployeeDto, res: any, req: any) {
    try {
      await this.employeeRepository.save(createEmployeeDto);
      await this.historyService.create({
        reason: HistoryReason.EMPLOYEE,
        message: "New employee " + createEmployeeDto.matricule + " by " + req.session.user.firstName + " " + req.session.user.name,
        created_by: req.session.user.matricule,
      });
      return res.redirect('/');
    } catch (error) {
      return res.redirect('/employee/new-employee?error=' + error.message);
    }
  }

  findAllByLineAndDepartement(line: string | undefined, departement: string | undefined, skip: number, take: number, year: number) {
    return this.employeeRepository.find({ where: { line, departement, is_active: true, is_deleted: false }, skip, take, order: { matricule: 'ASC' } });
  }

  async updatePassword(data: { matricule: any; app_password: any; onehr_password: any; }) {
    const salt = await bcrypt.genSalt(10);
    const employee = await this.employeeRepository.findOne({ where: { matricule: data.matricule } });
    if (employee) {
      employee.app_password = bcrypt.hashSync(data.app_password, salt);
      employee.onehr_password = this.cryptoService.encrypt(data.onehr_password);
      await this.employeeRepository.save(employee);
    }
  }

  async assignManager(managerId: string, employeeIds: string[]) {
    const manager = await this.userRepository.findOne({
      where: { id: managerId },
    });

    if (!manager) {
      throw new Error('Manager introuvable');
    }

    // ⚡ Bulk update
    await this.employeeRepository.update(
      { id: In(employeeIds) },
      { manager: manager, is_active: true, is_deleted: false },
    );

    return {
      message: `${employeeIds.length} employees assignés`,
    };
  }

  async getNoManager(site: string, search: string = "") {
    if (!site) {
      throw new BadRequestException("Site is required");
    }
    const allowedSites = this.getAllowedSites(site);
    const employees = await this.employeeRepository.find({
      where: [
        { site: In(allowedSites), matricule: Like(`%${search}%`), is_active: true, is_deleted: false },
        { site: In(allowedSites), firstname: Like(`%${search}%`), is_active: true, is_deleted: false },
        { site: In(allowedSites), name: Like(`%${search}%`), is_active: true, is_deleted: false }
      ],
      select: [
        'name',
        'firstname',
        'matricule',
        'id',
        'section',
        'line'
      ]
    });
    return employees;
  }

  private calculateAccruedLeave(year: number): number {
    const today = new Date();

    let total = 0;

    for (let month = 0; month <= today.getMonth(); month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      if (month === today.getMonth()) {
        total += (2.5 / daysInMonth) * today.getDate();
      } else {
        total += 2.5;
      }
    }

    return parseFloat(total.toFixed(2));
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

  async getEmployeesWithBalances(
    line: string, departement: string, section: string, division: string, site: string, skip: number, take: number, year: number, user: any, search: string = '') {

    let employees: Employee[];
    let total: number;

    if (user.role === UserRole.MANAGER) {
      if (search && search.trim() !== "") {
        [employees, total] = await this.employeeRepository.findAndCount({
          where: [
            { manager: { id: user.id }, matricule: Like(`%${search}%`), is_active: true, is_deleted: false },
            { manager: { id: user.id }, name: Like(`%${search}%`), is_active: true, is_deleted: false },
            { manager: { id: user.id }, firstname: Like(`%${search}%`), is_active: true, is_deleted: false },
            { manager: { id: user.id }, division: Like(`%${search}%`), is_active: true, is_deleted: false },
            { manager: { id: user.id }, section: Like(`%${search}%`), is_active: true, is_deleted: false },
          ],
          order: { matricule: 'ASC' },
          skip,
          take,
        });
      } else {
        [employees, total] = await this.employeeRepository.findAndCount({
          where: { manager: { id: user.id }, is_active: true, is_deleted: false },
          order: { matricule: 'ASC' },
          skip,
          take,
        });

      }
    } else {
      if (search && search.trim() !== "") {
        [employees, total] = await this.employeeRepository.findAndCount({
          where: [
            { matricule: Like(`%${search}%`), is_active: true, is_deleted: false },
            { name: Like(`%${search}%`), is_active: true, is_deleted: false },
            { firstname: Like(`%${search}%`), is_active: true, is_deleted: false },
            { division: Like(`%${search}%`), is_active: true, is_deleted: false },
            { section: Like(`%${search}%`), is_active: true, is_deleted: false },
          ],
          order: { matricule: 'ASC' },
          skip,
          take,
        });
      } else {
        // 1️⃣ Récupérer les employés
        [employees, total] = await this.employeeRepository.findAndCount({
          where: { line, section, division, site, is_active: true, is_deleted: false },
          order: { matricule: 'ASC' },
          skip,
          take,
        });
      }
    }

    if (employees.length === 0) {
      return { data: [], total };
    }

    const employeeIds = employees.map(e => e.id);
    // console.log("employeeIds:", employeeIds);

    const today = new Date();
    // console.log("today:", today);

    // 2️⃣ Calcul jours pris (Local_Leave_AMD uniquement)
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
      .where('employee.id IN (:...employeeIds)', { employeeIds })
      .andWhere('leave.status = :status', { status: LeaveStatus.APPROVED })
      .andWhere('leave.leave_type = :type', { type: 'Local_Leave_AMD' })
      .andWhere('YEAR(leave.start_date) = :year', { year })
      // .andWhere('leave.start_date <= :today', { today })
      .andWhere('employee.site = :site', { site })
      .groupBy('employee.id')
      .getRawMany();

    // console.log("takenLeaves:", takenLeaves);

    const takenPermissions = await this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoin('leave.employee', 'employee')
      .select('employee.id', 'employeeId')
      .addSelect('leave.start_date', 'start_date')
      .addSelect('leave.end_date', 'end_date')
      .addSelect(
        'SUM(DATEDIFF(leave.end_date, leave.start_date) + 1)',
        'daysTaken'
      )
      .where('employee.id IN (:...employeeIds)', { employeeIds })
      .andWhere('leave.status = :status', { status: LeaveStatus.APPROVED })
      .andWhere('leave.leave_type = :type', { type: 'Permission_AMD' })
      .andWhere('YEAR(leave.start_date) = :year', { year })
      // .andWhere('leave.start_date <= :today', { today })
      .andWhere('employee.site = :site', { site })
      .groupBy('employee.id')
      .getRawMany();

    const takenLeaveMap = new Map<string, number>();

    takenLeaves.forEach(async l => {
      // console.log(l);
      const holidays = await this.getDaysTakenWithHoliday(l.start_date, l.end_date);
      const daysTaken = Number(l.daysTaken) - holidays;
      takenLeaveMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
      // takenLeaveMap.set(l.employeeId, Number(l.daysTaken));
    });

    const takenPermissionMap = new Map<string, number>();

    takenPermissions.forEach(async l => {
      const holidays = await this.getDaysTakenWithHoliday(l.start_date, l.end_date);
      const daysTaken = Number(l.daysTaken) - holidays;
      takenPermissionMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
      // takenPermissionMap.set(l.employeeId, Number(l.daysTaken));
    });

    let soldeCumul = 0;

    if (year < today.getFullYear()) {
      // année passée → solde plein
      soldeCumul = 2.5 * 12;
    } else if (year > today.getFullYear()) {
      // année future → rien
      soldeCumul = 0;
    } else {
      // année en cours → calcul journalier
      for (let m = 0; m <= today.getMonth(); m++) {
        const daysInMonth = new Date(year, m + 1, 0).getDate();

        if (m === today.getMonth()) {
          soldeCumul += (2.5 / daysInMonth) * today.getDate();
        } else {
          soldeCumul += 2.5;
        }
      }
    }

    const promises = employees.map(async (emp) => {
      const cumulSolde = (await this.getEmployeeSolde(emp.matricule, today)).solde_cumul;
      const pris = takenLeaveMap.get(emp.id) || 0;
      const prisPermission = takenPermissionMap.get(emp.id) || 0;
      const restant = cumulSolde - pris;

      const doeDate = new Date(emp.DOE);


      let soldeDebut = 0;
      if (year > doeDate.getFullYear() + 1) {
        const dateDebutCompte = new Date(doeDate.getFullYear() + 1, doeDate.getMonth(), doeDate.getDate());
        for (let i = dateDebutCompte.getFullYear(); i <= year; i += 3) {
          if (year - i < 3) {
            for (let y = i; y < year; y++) {
              soldeDebut += (await this.getEmployeeSolde(emp.matricule, new Date(y, 11, 31))).solde_restant;
            }
          }
        }
      }

      return {
        ...emp,
        solde_cumul: Number(cumulSolde.toFixed(2)),
        solde_debut: Number(soldeDebut.toFixed(2)),
        solde_pris: Number(pris.toFixed(2)),
        solde_pris_permission: Number(prisPermission.toFixed(2)),
        solde_restant: Number((restant + soldeDebut).toFixed(2)),
      };
    });

    // 2. Attends que TOUTES les promesses soient résolues
    const results = await Promise.all(promises);

    return { data: results, total };
  }

  async getEmployees(
    line: string,
    departement: string,
  ) {
    const [employees, total] = await this.employeeRepository.findAndCount({
      where: { line, departement, is_active: true, is_deleted: false },
      order: { matricule: 'ASC' },
    });

    if (employees.length === 0) {
      return { data: [], total };
    } else {
      return { data: employees, total };
    }
  }

  async findDepartement() {
    const results = await this.employeeRepository
      .createQueryBuilder('empoyee')
      .select('DISTINCT empoyee.departement', 'departement')
      .where('empoyee.is_active = true AND empoyee.is_deleted = false')
      .getRawMany();

    // this.employeeRepository.find({
    //   select: ['departement'],
    //   where: {}
    // })

    return results.map(res => res.value);
  }

  async findAllDivisions(): Promise<string[]> {
    const results = await this.employeeRepository
      .createQueryBuilder('employee')
      .select('DISTINCT employee.division', 'division')
      .where('employee.is_active = true AND employee.is_deleted = false')
      .orderBy('employee.division', 'ASC')
      .getRawMany();

    return results.map((res) => res.division);
  }

  async findAllSections(): Promise<string[]> {
    const results = await this.employeeRepository
      .createQueryBuilder('employee')
      .select('DISTINCT employee.section', 'section')
      .where('employee.is_active = true AND employee.is_deleted = false')
      .orderBy('employee.section', 'ASC')
      .getRawMany();

    return results.map((res) => res.section);
  }

  async findAllDepartments(): Promise<string[]> {
    const results = await this.employeeRepository
      .createQueryBuilder('employee')
      .select('DISTINCT employee.departement', 'departement')
      .where('employee.departement IS NOT NULL')
      .andWhere('employee.is_active = true AND employee.is_deleted = false')
      .orderBy('employee.departement', 'ASC')
      .getRawMany();

    return results.map((res) => res.departement);
  }

  async findAllLines(): Promise<string[]> {
    const results = await this.employeeRepository
      .createQueryBuilder('employee')
      .select('DISTINCT employee.line', 'line')
      .where('employee.line IS NOT NULL')
      .andWhere('employee.is_active = true AND employee.is_deleted = false')
      .orderBy('employee.line', 'ASC')
      .getRawMany();

    return results.map((res) => res.line);
  }


  findAll() {
    return this.employeeRepository.find({ order: { matricule: 'ASC' } });
  }

  findOne(id: string) {
    return this.employeeRepository.findOne({ where: { id }, relations: ['manager'] });
  }

  update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeRepository.update(id, updateEmployeeDto);
  }

  async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto, res: any, managerId: string) {
    try {

      const employee = await this.employeeRepository.findOne({ where: { id } });
      if (!employee) {
        return res.status(404).redirect('/employee/edit/' + id + '?error=Employee not found');
      }
      const manager = await this.userRepository.findOne({ where: { id: managerId } });
      if (!manager && managerId !== '') {
        return res.status(404).redirect('/employee/edit/' + id + '?error=Manager not found');
      } else if (managerId === '' || manager == null) {
        await this.employeeRepository.update(id, { ...updateEmployeeDto });
      } else {
        await this.employeeRepository.update(id, { ...updateEmployeeDto, manager: manager });
      }
      return res.redirect('/employee/details/' + id);
    } catch (error) {
      return res.status(500).redirect('/employee/edit/' + id + '?error=' + error.message);
    }
    // return res.status(200).redirect('/employee/list?message=Employee updated successfully');
  }

  remove(id: string) {
    return this.employeeRepository.delete(id);
  }

  async processExcelBuffer(file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    if (file.originalname.endsWith('.xls')) {
      const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows: any[] = XLSX.utils.sheet_to_json(worksheet);
      // const salt = await bcrypt.genSalt(10);
      // console.log("rows:", rows);

      // 🎯 Sélectionner uniquement certains champs
      const filtered = rows.map(row => ({
        type: row['Type'],
        departement: row['Dept'],
        section: row['Sect'],
        line: row['Line'],
        matricule: row['Emp No'],
        gender: row['Gender'],
        DOE: row['D.O.E'],
        division: row['Division'],
        name: row['Name'],
        firstname: row['Firstname'],
        job_level: row['Job Level'],
        designation: row['Designation'],
        site: row['Sit'],
      }));

      // ❗ ignorer lignes vides
      const cleanData = filtered.filter(x => x.matricule);

      // 📌 Insérer dans MySQL
      try {
        await this.employeeRepository
          .createQueryBuilder()
          .insert()
          .into(Employee)
          .values(cleanData)
          .orUpdate(
            [
              'type',
              'departement',
              'section',
              'line',
              'gender',
              'DOE',
              'division',
              'name',
              'firstname',
              'job_level',
              'designation',
            ],
            ['matricule']
          )
          .execute();
      } catch (e) {
        console.log(e);
      }
      return {
        result: 'success',
        message: 'Master file imported successfully',
      };

    }
    await workbook.xlsx.load(file.buffer as any);
    // await workbook.xlsx.readFile(file.path);await workbook.xlsx.load(file.buffer as any);

    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error('Aucune feuille trouvée dans le fichier Excel');
    }
    const headerRow = worksheet.getRow(1);

    const headerMap: Record<string, number> = {};

    headerRow.eachCell((cell, colNumber) => {
      const headerName = cell.value?.toString().trim().toLowerCase();
      console.log("COLUMN NAME:", headerName);
      if (headerName) {
        headerMap[headerName] = colNumber;
      }
    });

    // 2️⃣ Vérifier que les colonnes obligatoires existent
    const requiredColumns = ['emp no', 'type', 'division'];

    for (const column of requiredColumns) {
      if (!headerMap[column]) {
        throw new Error(`Missing column: ${column}`);
      }
    }
    console.log("HEADER MAP:", headerMap);
    const employees: Partial<Employee>[] = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      employees.push({
        type: row.getCell(headerMap['type']).value?.toString(),
        departement: row.getCell(headerMap['dept']).value?.toString(),
        section: row.getCell(headerMap['sect']).value?.toString(),
        line: row.getCell(headerMap['line']).value?.toString(),
        matricule: row.getCell(headerMap['emp no']).value?.toString(),
        gender: row.getCell(headerMap['gender']).value?.toString(),
        DOE: row.getCell(headerMap['d.o.e']).value as Date,
        division: row.getCell(headerMap['division']).value?.toString(),
        name: row.getCell(headerMap['name']).value?.toString(),
        firstname: row.getCell(headerMap['firstname']).value?.toString(),
        job_level: row.getCell(headerMap['job level']).value?.toString(),
        job_post: row.getCell(headerMap['job post']).value?.toString(),
        designation: row.getCell(headerMap['designation']).value?.toString(),
        site: row.getCell(headerMap['sit']).value?.toString(),
      });
    }

    await this.employeeRepository
      .createQueryBuilder()
      .insert()
      .into(Employee)
      .values(employees)
      .orUpdate(
        [
          'type',
          'departement',
          'section',
          'line',
          'gender',
          'DOE',
          'division',
          'name',
          'firstname',
          'job_level',
          'designation',
          'site',
        ],
        ['matricule']
      )
      .execute();
    return {
      result: 'success',
      message: 'Master file imported successfully',
    };
  }

  async getEmployeeSolde(matricule: string, at: Date) {
    const year = at.getFullYear();
    const employee = await this.employeeRepository.findOne({ where: { matricule } });
    if (!employee) return { solde_cumul: 0, solde_pris: 0, solde_restant: 0 };

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
      .andWhere('employee.is_active = true AND employee.is_deleted = false')
      .andWhere('leave.status = :status', { status: LeaveStatus.APPROVED })
      .andWhere('leave.leave_type = :type', { type: 'Local_Leave_AMD' })
      .andWhere('YEAR(leave.start_date) = :year', { year })
      .andWhere('leave.start_date <= :at', { at })
      .groupBy('employee.id')
      .getRawMany();


    const takenLeavesMap = new Map<string, number>();

    takenLeaves.forEach(async l => {
      const holidays = await this.getDaysTakenWithHoliday(l.start_date, l.end_date);
      const daysTaken = Number(l.daysTaken) - holidays;
      takenLeavesMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
      // takenLeavesMap.set(l.employeeId, Number(l.daysTaken));
    });
    // 3️⃣ Calcul solde cumulatif dynamique
    let soldeCumul = 0;

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
      solde_pris: Number(pris.toFixed(2)),
      solde_restant: Number(restant.toFixed(2)),
    };

    return result;
  }

  async search(q: string, user: any) {
    const allowedSites = this.getAllowedSites(user.site);
    if (!q) return [];
    const year = new Date().getFullYear();
    const queryBuilder = this.employeeRepository
      .createQueryBuilder('e')
      .where(
        '(e.matricule LIKE :q OR e.name LIKE :q OR e.firstname LIKE :q)',
        { q: `%${q}%` },
      )
      .andWhere('e.is_active = true AND e.is_deleted = false')
      .select(['e.id', 'e.matricule', 'e.name', 'e.firstname', 'e.line', 'e.departement', 'e.section', 'e.site', 'e.section', 'e.DOE'])
      .take(10);

    if (user.role === UserRole.MANAGER) {
      queryBuilder.andWhere('e.manager = :managerId', { managerId: user.id });
    } else {
      queryBuilder.andWhere('e.site IN (:...allowedSites)', { allowedSites });
    }

    const [data] = await queryBuilder.getManyAndCount();

    if (data.length === 0 || !data) return [];
    const date = new Date(data[0].DOE);
    date.setFullYear(date.getFullYear() + 1);
    let yearAfter3 = date.getFullYear();
    while (2026 - yearAfter3 > 3) {
      yearAfter3 = yearAfter3 + 3;
    }
    date.setFullYear(yearAfter3);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
      .where('employee.id IN (:...employeeIds)', { employeeIds: data.map((e) => e.id) })
      .andWhere('leave.status = :status', { status: LeaveStatus.APPROVED })
      .andWhere('leave.leave_type = :type', { type: 'Local_Leave_AMD' })
      .andWhere('YEAR(leave.start_date) = :year', { year })
      .andWhere('leave.start_date <= :today', { today })
      .andWhere('employee.site IN (:...allowedSites)', { allowedSites })
      .groupBy('employee.id')
      .getRawMany();

    const takenPermissions = await this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoin('leave.employee', 'employee')
      .select('employee.id', 'employeeId')
      .addSelect('leave.start_date', 'start_date')
      .addSelect('leave.end_date', 'end_date')
      .addSelect(
        'SUM(DATEDIFF(leave.end_date, leave.start_date) + 1)',
        'daysTaken'
      )
      .where('employee.id IN (:...employeeIds)', { employeeIds: data.map((e) => e.id) })
      .andWhere('leave.status = :status', { status: LeaveStatus.APPROVED })
      .andWhere('leave.leave_type = :type', { type: 'Permission_AMD' })
      .andWhere('YEAR(leave.start_date) = :year', { year })
      .andWhere('leave.start_date <= :today', { today })
      .andWhere('employee.site IN (:...allowedSites)', { allowedSites })
      .groupBy('employee.id')
      .getRawMany();
    // console.log("Data:", takenLeaves);
    // // return data;

    // console.log("takenLeaves:", takenLeaves);

    const takenLeavesMap = new Map<string, number>();
    const takenPermissionsMap = new Map<string, number>();

    takenLeaves.forEach(async l => {
      const holidays = await this.getDaysTakenWithHoliday(l.start_date, l.end_date);
      const daysTaken = Number(l.daysTaken) - holidays;
      takenLeavesMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
      // takenLeavesMap.set(l.employeeId, Number(l.daysTaken));
    });

    takenPermissions.forEach(async l => {
      const holidays = await this.getDaysTakenWithHoliday(l.start_date, l.end_date);
      const daysTaken = Number(l.daysTaken) - holidays;
      takenPermissionsMap.set(l.employeeId, Number(daysTaken.toFixed(2)));
      // takenLeavesMap.set(l.employeeId, Number(l.daysTaken));
    });

    // 3️⃣ Calcul solde cumulatif dynamique
    let soldeCumul = 0;

    if (year < today.getFullYear()) {
      // année passée → solde plein
      soldeCumul = 2.5 * 12;
    } else if (year > today.getFullYear()) {
      // année future → rien
      soldeCumul = 0;
    } else {
      // année en cours → calcul journalier
      for (let m = 0; m <= today.getMonth(); m++) {
        const daysInMonth = new Date(year, m + 1, 0).getDate();

        if (m === today.getMonth()) {
          soldeCumul += (2.5 / daysInMonth) * today.getDate();
        } else {
          soldeCumul += 2.5;
        }
      }
    }

    // 4️⃣ Fusion finale
    const promises = data.map(async (emp) => {
      const cumulSolde = (await this.getEmployeeSolde(emp.matricule, today)).solde_cumul;
      const pris = takenLeavesMap.get(emp.id) || 0;
      const prisPermission = takenPermissionsMap.get(emp.id) || 0;
      const restant = cumulSolde - pris;

      const doeDate = new Date(emp.DOE);

      let soldeDebut = 0;
      if (year > doeDate.getFullYear() + 1) {
        const dateDebutCompte = new Date(doeDate.getFullYear() + 1, doeDate.getMonth(), doeDate.getDate());
        for (let i = dateDebutCompte.getFullYear(); i <= year; i += 3) {
          if (year - i < 3) {
            for (let y = i; y < year; y++) {
              soldeDebut += (await this.getEmployeeSolde(emp.matricule, new Date(y, 11, 31))).solde_restant;
            }
          }
        }
      }
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
      let soldeCumulMensuel = 2.5 * today.getMonth();

      if (estDernierJourDuMois(today)) {
        soldeCumulMensuel = 2.5 * (today.getMonth() + 1);
      }

      return {
        ...emp,
        solde_cumul: Number(cumulSolde.toFixed(2)),
        solde_cumul_mensuel: Number(soldeCumulMensuel.toFixed(2)),
        solde_debut: Number(soldeDebut.toFixed(2)),
        solde_pris: Number(pris.toFixed(2)),
        solde_pris_permission: Number(prisPermission.toFixed(2)),
        solde_restant: Number((restant + soldeDebut).toFixed(2)),
        solde_restant_mensuel: Number((soldeCumulMensuel - pris).toFixed(2)),
      };
    });

    // 2. Attends que TOUTES les promesses soient résolues
    const results = await Promise.all(promises);

    return results;
  }

  async getActiveEmployeesNotOnLeave(date: Date): Promise<number> {
    const today = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD

    return await this.employeeRepository
      .createQueryBuilder('employee')
      .where('employee.is_active = :isActive', { isActive: true })
      .andWhere('employee.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere(qb => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(Leave, 'leave')
          .where('leave.employee_id = employee.id')
          .andWhere('leave.status = :status')
          .andWhere(':today BETWEEN leave.start_date AND leave.end_date')
          .getQuery();

        return `NOT EXISTS ${subQuery}`;
      })
      .setParameter('status', 'APPROVED') // ou LeaveStatus.APPROVED
      .setParameter('today', today)
      .getCount();
  }

  async getEmployeesOnLeave(date: Date): Promise<number> {
    const today = new Date(date).toISOString().split('T')[0];

    return await this.employeeRepository
      .createQueryBuilder('employee')
      .innerJoin(
        'employee.leaves',
        'leave',
        `
      leave.status = :status
      AND :today BETWEEN leave.start_date AND leave.end_date
      `,
        {
          status: 'APPROVED', // ou LeaveStatus.APPROVED
          today,
        },
      )
      .where('employee.is_active = :isActive', { isActive: true })
      .andWhere('employee.is_deleted = :isDeleted', { isDeleted: false })
      .distinct(true) // évite les doublons si un employé a plusieurs leaves
      .getCount();
  }

  async getDaysTakenWithHoliday(startDate: string, endDate: string) {

    const holidays = await this.holidayService.findBetweenDate(startDate, endDate);

    const daysTakenWithHoliday = holidays.length;

    return daysTakenWithHoliday;
  }

  async findOneByMatricule(matricule: string) {
    return this.employeeRepository.findOneBy({ matricule });
  }

  async findOneByName(name: string) {
    return this.employeeRepository.findOneBy({ name });
  }

  async findByLine(line: string) {
    return this.employeeRepository.findBy({ line });
  }

  async findBySection(section: string) {
    return this.employeeRepository.findBy({ section });
  }

  async findByLineAndSection(line: string, section: string) {
    return this.employeeRepository.findBy({ line, section });
  }

}
