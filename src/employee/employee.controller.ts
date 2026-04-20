import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, Render, UseInterceptors, Res, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import express from 'express'; // ✅ SEULE VERSION CORRECTE
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { memoryStorage } from 'multer';
import { RolesGuard } from 'src/user/role.guard';
import { Roles } from 'src/user/role.decorator';
import { Site, UserRole } from 'src/user/entities/user.entity';
import * as XLSX from 'xlsx';
import { UserService } from 'src/user/user.service';
import { HistoryService } from 'src/history/history.service';
import { HistoryReason } from 'src/history/entities/history.entity';

@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly userService: UserService,
    private readonly historyService: HistoryService,
  ) { }

  private getAllowedSites(userSite: string): string[] {

    if (userSite === Site.MADA) {
      return [Site.ABE1, Site.ABE2, Site.TANA]; // pas de filtre
    }

    if (userSite === Site.ANTSIRABE) {
      return [Site.ABE1, Site.ABE2];
    }

    return [userSite];
  }

  @Get('details/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN, UserRole.MANAGER, UserRole.PAYROLL)
  @Render('employee')
  async getEmployee(@Param('id') id: string, @Req() req: any) {
    const employee = await this.employeeService.findOne(id);
    return { title: "Employee details", employee };
  }

  @Get('edit/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN, UserRole.MANAGER, UserRole.PAYROLL)
  @Render('edit-employee')
  async getEmployeeEdit(@Param('id') id: string, @Req() req: any, @Query('error') error: string = '') {
    const allowedSites = this.getAllowedSites(req.session.user.site);
    const employee = await this.employeeService.findOne(id);
    const KEYS = allowedSites.map(val => {
      // On cherche la clé dans l'objet Site qui possède cette valeur
      const key = (Object.keys(Site) as (keyof typeof Site)[]).find(
        k => Site[k] === val
      );
      return key;
    });
    return { title: "Edit employee", employee, allowedSites, KEYS, error };
  }

  @Post('edit/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN, UserRole.MANAGER, UserRole.PAYROLL)
  async postEmployeeEdit(@Param('id') id: string, @Body() body: any, @Res() res: any) {
    // console.log("BODY:", body);
    const managerId = body.managerId;
    delete body.managerId;
    console.log("BODY (after delete):", body);
    return await this.employeeService.updateEmployee(id, body, res, managerId);
  }

  @Get('list')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN, UserRole.MANAGER, UserRole.PAYROLL)
  @Render('employee-list')
  async getMedicalService(
    @Req() req,
    @Query('search') search: string = '',
    @Query('page') page: number = 1,
    @Query('startDate') startDate: string = '',
    @Query('endDate') endDate: string = '',
  ) {
    const limit = 20;
    const { data, total, totalPages } = await this.employeeService.paginateEmployee(
      search,
      Number(page),
      limit,
      req.session.user,
    );

    const currentPage = Number(page);
    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    return {
      title: 'Employee list',
      data,
      search,
      startDate,
      endDate,
      total,
      totalPages,
      startPage,
      endPage,
      currentPage,
      user: req.session.user,
    };
  }

  @Post('compare')
  compare(@Body() data: any) {
    return this.employeeService.compare(data);
  }

  @Get('import-password')
  @Render('import-password')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.HR_ADMIN)
  async getImportPassword(@Req() req: any) {
    return { title: "Import Password", error: req.query.error };
  }

  @Post('import-password')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.HR_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async importFromPassword(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: any,
    @Req() req: any,
  ) {

    if (file) {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

      // 🎯 Sélectionner uniquement certains champs
      const filtered = rows.map(row => ({
        matricule: row['matricule'],
        app_password: row['app_password'],
        onehr_password: row['onehr_password']
      }));

      // ❗ ignorer lignes vides
      const cleanData = filtered.filter(x => x.matricule);

      for (const data of cleanData) {
        console.log("DATA:", data);

        await this.employeeService.updatePassword(data);
      }
      await this.historyService.create({
        reason: HistoryReason.EMPLOYEE,
        message: "Import password send by " + req.session.user.firstName + " " + req.session.user.name,

      });
      return res.redirect('/');
    } else {
      throw new BadRequestException('Aucun fichier reçu');
    }
  }

  @Get('import-manager')
  @Render('import-manager')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.HR_ADMIN)
  async getImportManager(@Req() req: any) {
    return { title: "Import Manager", error: req.query.error };
  }

  @Post('import-manager')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.HR_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async importFromManager(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: any,
    @Req() req: any,
  ) {

    if (file) {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

      // 🎯 Sélectionner uniquement certains champs
      const filtered = rows.map(row => ({
        matricule: row['matricule'],
        manager: row['manager']
      }));

      // ❗ ignorer lignes vides
      const cleanData = filtered.filter(x => x.matricule);

      for (const data of cleanData) {
        console.log("DATA:", data);

        await this.employeeService.updateManager(data);
      }
      await this.historyService.create({
        reason: HistoryReason.EMPLOYEE,
        message: "Import manager by " + req.session.user.firstName + " " + req.session.user.name,

      });
      return res.redirect('/');
    } else {
      const error = "Aucun fichier reçu";
      return res.redirect('/employee/import-manager?error=' + error);
    }
  }

  @Get('finding/search-list')
  async search(@Query('q') q: string, @Req() req: any) {
    return this.employeeService.search(q, req.session.user.site);
  }

  @Get('find-one-by-matricule')
  async findOneByMatricule(@Query('matricule') matricule: string) {
    console.log('FIND ONE BY MATRICULE');
    return await this.employeeService.findOneByMatricule(matricule);
  }

  @Get('find-one-by-fullname')
  async findOneByFullName(@Query('fullname') fullname: string) {
    return this.employeeService.findOneByFullName(fullname);
  }

  @Get('find-by-line')
  async findByLine(@Query('line') line: string) {
    return this.employeeService.findByLine(line);
  }

  @Get('find-by-section')
  async findBySection(@Query('section') section: string) {
    return this.employeeService.findBySection(section);
  }

  @Get('find-by-line-and-section')
  async findByLineAndSection(@Query('line') line: string, @Query('section') section: string) {
    return this.employeeService.findByLineAndSection(line, section);
  }

  @Get('find-all')
  async findAllByLineAndSection(
    @Req() req: any,
    @Query('line') line: string,
    @Query('departement') departement: string,
    @Query('site') site: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 50,
    @Query('year') year: number = new Date().getFullYear(),
  ) {
    // const test = await this.employeeService.getEmployeeSolde("10784", new Date("2017-12-31"))
    // console.log("TEST 10784 2017-01-10:", test);

    const employees = await this.employeeService.getEmployeesWithBalances(line, departement, site, +skip, +take, +year, req.session.user);
    // console.log("employees", employees);
    // console.log("SESSION:", req.session.user);
    return employees;
    // return this.employeeService.findAllByLineAndDepartement(line, departement, +skip, +take, year);
  }

  @Get('test')
  async test(
    @Req() req: any,
    @Query('line') line: string,
    @Query('departement') departement: string,
    @Query('site') site: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 50,
    @Query('year') year: number = new Date().getFullYear(),
  ) {
    const employees = await this.employeeService.getEmployeesWithBalances(line, departement, site, +skip, +take, +year, req.session.user);
    console.log("employees", employees);
    return employees;
    // return this.employeeService.findAllByLineAndDepartement(line, departement, +skip, +take, year);
  }

  @Get('new-employee')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HR_ADMIN)
  @Render('new-employee')
  async newEmployee(
    @Req() req: any,
    @Query('line') line: string,
    @Query('departement') departement: string,
    @Query('error') error: string = '',
  ) {
    const allowedSites = this.getAllowedSites(req.session.user.site);
    console.log("ALLOWERD SITES:", allowedSites);
    const employees = await this.employeeService.getEmployees(line, departement);
    const KEYS = allowedSites.map(val => {
      // On cherche la clé dans l'objet Site qui possède cette valeur
      const key = (Object.keys(Site) as (keyof typeof Site)[]).find(
        k => Site[k] === val
      );
      return key;
    });
    return { title: "New Employee", employees, allowedSites, KEYS, error };
  }

  @Get('my-team')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
  @Render('my-team')
  async getMyTeam(@Req() req: any, @Query('search') search: string) {
    // const employees = await this.employeeService.getNoManager(req.session.user.site, search);
    console.log("SEARCH:", search);
    const employees = await this.employeeService.getMyTeam(req.session.user);
    console.log("EMPLOYEES:", employees);
    return { title: "My Team", employees };
  }

  @Get('no-manager')
  async getNoManager(@Req() req: any, @Query('search') search: string) {
    // const employees = await this.employeeService.getNoManager(req.session.user.site, search);
    console.log("SEARCH:", search);
    const employees = await this.employeeService.getNoManager(req.session.user.site, search);
    console.log("EMPLOYEES:", employees);
    return employees;
  }

  @Get('assign-manager')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  // @Render('test')
  @Render('employee-assign')
  async assignManager(@Req() req: any) {
    const employees = await this.employeeService.getNoManager(req.session.user.site, "");
    const managers = await this.userService.findAllManagers(req.session.user.site);
    return { title: "Assign Manager", employees, managers };
  }

  @Post('assign-manager')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HR_ADMIN, UserRole.HEAD_HR)
  async assignManagerPost(@Body() body: any, @Res() res: express.Response, @Req() req: any) {
    console.log("BODY:", body);
    await this.employeeService.assignManager(body.managerId, body.employeeIds);
    await this.historyService.create({
      reason: HistoryReason.EMPLOYEE,
      message: "Assign manager by " + req.session.user.firstName + " " + req.session.user.name,

    });
    return res.redirect('/employee/assign-manager');
  }

  @Get('assigned-employees/:managerId')
  async getAssignedEmployees(@Req() req: any, @Param('managerId') managerId: string) {
    const employees = await this.employeeService.getAssignedEmployees(managerId);
    console.log("EMPLOYEES:", employees);
    return employees;
  }

  @Post('new-employee')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  async newEmployeePost(@Body() body: any, @Res() res: express.Response, @Req() req: any) {
    console.log("BODY:", body);
    await this.employeeService.create(body, res, req);
  }

  @Get('import-master-file')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  @Render('import-master-file')
  async importMasterFile(@Req() req: any) {
    return { title: "Import Master File", error: req.query.error };
  }

  @Post('import-master-file')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async import(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: express.Response,
    @Req() req: any,
  ) {
    console.log("FILE:", file);

    try {
      await this.employeeService.processExcelBuffer(file);
      await this.historyService.create({
        reason: HistoryReason.EMPLOYEE,
        message: "Import master file by " + req.session.user.firstName + " " + req.session.user.name,
      });
      res.redirect(`/leave/planning-view`);
    } catch (error) {
      console.log("ERROR:", error.message)
      res.redirect(`/employee/import-master-file?error=${encodeURIComponent(error.message)}`);
    }
  }

  // @UseGuards(RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  // @Post()
  // create(@Body() createEmployeeDto: CreateEmployeeDto) {
  //   return this.employeeService.create(createEmployeeDto);
  // }

  @Get()
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':matricule')
  findOne(@Param('matricule') matricule: string) {
    console.log("MATRICULE:", matricule);

    return this.employeeService.findOneByMatricule(matricule);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }

}
