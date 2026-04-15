import { Controller, Get, Post, Body, Patch, Param, Delete, Render, Res, Query, UseGuards, ParseIntPipe, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import * as express from 'express';
import { EmployeeService } from 'src/employee/employee.service';
import { SuperAdminGuard } from 'src/superadmin/superadmin.guard';
import { RolesGuard } from 'src/user/role.guard';
import { Roles } from 'src/user/role.decorator';
import { UserRole, Site } from 'src/user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { HistoryService } from 'src/history/history.service';
import { HistoryReason } from 'src/history/entities/history.entity';

@Controller('leave')
export class LeaveController {

  constructor(
    private readonly leaveService: LeaveService,
    private readonly employeeService: EmployeeService,
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

  @Get('new-leave')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Render('new-leave')
  async newLeave(@Query() query: any, @Query() error?: string) {
    return { title: "New Leave", error: error ? error : null };
  }

  @Post('new-leave')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async createNewLeave(@Body() createLeaveDto: CreateLeaveDto, @Res() res: express.Response, @Req() req: any) {
    await this.leaveService.create(createLeaveDto, res, req);
  }

  @Get('leave-history')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.PAYROLL, UserRole.MANAGER, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  @Render('leave-history')
  async leaveHistory(@Query() query: any, @Query() error?: string) {
    return { title: "Leave History", error: error ? error : null };
  }

  @Get('approuve-leaves')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
  @Render('approuve-leaves')
  async approuveLeaves(@Req() req: any) {
    const leaves = await this.leaveService.getNonApprouvedLeaves(req.session.user.id);
    console.log("LEAVES:", leaves);
    return { title: "Approuve Leaves", error: req.query.error, leaves: leaves, message: req.query.message };
  }

  @Post('approve-leave/:leaveId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
  async approveLeave(@Param('leaveId') leaveId: string, @Res() res: express.Response, @Req() req: any) {
    await this.leaveService.approveLeave(leaveId, req.session.user.id);
    const message = "Leave approved successfully. You are pleased to validate also on OneHR platfrom."
    await this.historyService.create({
      reason: HistoryReason.LEAVE,
      message: "Leave approved by " + req.session.user.firstName + " " + req.session.user.name,
    });
    res.redirect('/leave/approuve-leaves?message=' + message);
  }

  @Post('reject-leave/:leaveId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
  async rejectLeave(@Param('leaveId') leaveId: string, @Res() res: express.Response, @Req() req: any) {
    await this.leaveService.rejectLeave(leaveId, req.session.user.id);
    const message = "Leave rejected successfully."
    await this.historyService.create({
      reason: HistoryReason.LEAVE,
      message: "Leave rejected by " + req.session.user.firstName + " " + req.session.user.name,
    });
    res.redirect('/leave/approuve-leaves?message=' + message);
  }

  @Get('employee-leaves/paginate/:employeeId')
  async getEmployeeLeaves(@Param('employeeId') employeeId: string, @Query('skip') skip: number, @Query('take') take: number, @Query('startDate') startDate: string, @Query('endDate') endDate: string, @Query('status') status: string) {
    const st = new Date(startDate);
    const et = new Date(endDate);
    console.log("STATUS:", status);
    console.log("EMPLOYEE ID:", employeeId);
    console.log("START DATE:", startDate);
    console.log("END DATE:", endDate);
    return this.leaveService.getPaginateEmployeeLeaves(employeeId, skip, take, st, et, status);
  }

  @Get('employee-leaves/:employeeId/:month/:year')
  async getEmployeeLeavesByMonth(@Param('employeeId') employeeId: string, @Param('month') month: number, @Param('year') year: number) {
    return this.leaveService.getEmployeeLeavesByMonth(employeeId, month, year);
  }

  @Get('employee-leaves/:employeeId/:year')
  async getEmployeeLeavesByYear(@Param('employeeId') employeeId: string, @Param('year') year: number) {
    return this.leaveService.getEmployeeLeavesByYear(employeeId, year);
  }

  @Get('employee-leaves/:employeeId/:startDate/:endDate')
  async getEmployeeLeavesByRange(@Param('employeeId') employeeId: string, @Param('startDate') startDate: Date, @Param('endDate') endDate: Date) {
    return this.leaveService.getEmployeeLeavesByRange(employeeId, startDate, endDate);
  }

  @Get('leaves-line/:line')
  async getLeavesByLine(@Param('line') line: string) {
    return this.leaveService.getLeavesByLine(line);
  }

  @Get('leaves-section/:section')
  async getLeavesBySection(@Param('section') section: string) {
    return this.leaveService.getLeavesBySection(section);
  }

  @Get('leaves-month-year/:month/:year')
  async getLeavesByMonth(@Param('month') month: number, @Param('year') year: number) {
    return this.leaveService.getLeavesByMonth(month, year);
  }

  @Get('leaves-year/:year')
  async getLeavesByYear(@Param('year') year: number) {
    return this.leaveService.getLeavesByYear(year);
  }

  @Get('leaves-line-section/:line/:section')
  async getLeavesByLineAndSection(@Param('line') line: string, @Param('section') section: string) {
    return this.leaveService.getLeavesByLineAndSection(line, section);
  }

  @Get('range')
  async getLeavesByRange(
    @Query('year') year: number,
    @Query('startMonth') startMonth: number,
    @Query('endMonth') endMonth: number,
    @Query('line') line: string,
    @Query('departement') departement: string,
    @Query('site') site: string,
  ) {
    return this.leaveService.getLeavesByRange(year, startMonth, endMonth, line, departement, site);
  }

  @Get('month-line-departement')
  async getLeavesByMonthAndLineAndDepartement(
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('line') line: string,
    @Query('departement') departement: string,
    @Query('site') site: string,
  ) {
    return this.leaveService.getLeavesByMonthAndLineAndDepartement(year, month, line, departement, site);
  }

  @Get('planning')
  async getPlanning(
    @Query('year') year: number,
    @Query('startMonth') startMonth: number,
    @Query('endMonth') endMonth: number,
    @Query('line') line: string,
    @Query('section') section: string,
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    return this.leaveService.getPlanning(year, startMonth, endMonth, line, section, skip, take);
  }

  @Post('simulate-cumul-balance')
  async getEmployeeCumulativeBalance(@Body('matricule') matricule: string, @Body('date') date: string) {
    const employee = await this.employeeService.findOneByMatricule(matricule);
    return this.leaveService.getEmployeeCumulativeBalance(employee?.id, new Date(date));
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL)
  @Get('import-leaves')
  @Render('import-leaves')
  async importLeavesView(@Req() req: any) {
    return { title: "Import Leaves", error: req.query.error };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL)
  @Post('import-leaves')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async importLeavesPost(@UploadedFile() file: Express.Multer.File, @Res() res: express.Response, @Req() req: any) {
    try {
      console.log("FILE:", file);
      const result = await this.leaveService.importLeaves(file);
      if (result.result === 'error') {
        return res.redirect(`/leave/import-leaves?error=${result.message}`);
      }
      await this.historyService.create({
        reason: HistoryReason.LEAVE,
        message: "Import leaves by " + req.session.user.firstName + " " + req.session.user.name,
      });
      return res.redirect(`/leave/planning-view`);
    } catch (error) {
      return res.redirect(`/leave/import-leaves?error=${error.message}`);
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL, UserRole.MANAGER, UserRole.ADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  @Get('export')
  @Render('export')
  async exportView() {
    const departementList = await this.employeeService.findAllDepartments()
    const lineList = await this.employeeService.findAllLines()
    return { title: "Export", departementList, lineList };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL, UserRole.MANAGER, UserRole.ADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  @Post('export-planning')
  async exportPlanningPost(
    @Body('startDate') startDate: Date,
    @Body('endDate') endDate: Date,
    @Body('line') line: string,
    @Body('departement') departement: string,
    @Body('status') status: string,
    @Req() req: any,
    @Res() res: express.Response
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const workbook = await this.leaveService.exportLeavePlanning(req.session.user, start, end, line, departement, status);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${status}-leaves-${line}-${departement}-${startDate}-${endDate}.xlsx`
    );

    await workbook.xlsx.write(res);
    console.log("Exported successfully");
    await this.historyService.create({
      reason: HistoryReason.LEAVE,
      message: "Export leaves by " + req.session.user.firstName + " " + req.session.user.name,
    });
    res.end();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL, UserRole.MANAGER, UserRole.ADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  @Get('export-employee-leaves')
  async exportEmployeeLeaves(
    @Query('employeeId') employeeId: string,
    @Query('start') startDate: string,
    @Query('end') endDate: string,
    @Query('status') status: string,
    @Res() res: express.Response,
    @Req() req: any,
  ) {
    console.log("Employee ID:", employeeId);
    const employee = await this.employeeService.findOne(employeeId);
    console.log("Employee:", employee);

    if (!employee) {
      return res.status(404).send('Employee not found');
    }

    const workbook = await this.leaveService.exportEmployeeLeaves(employee, new Date(startDate), new Date(endDate), status);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=employee-leaves-${employee.matricule}-${employee.fullname}.xlsx`
    );

    await workbook.xlsx.write(res);
    console.log("Exported successfully");
    await this.historyService.create({
      reason: HistoryReason.LEAVE,
      message: "Export leaves of employee " + employee.fullname + " by " + req.session.user.firstName + " " + req.session.user.name,
    });
    res.end();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL, UserRole.MANAGER, UserRole.ADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  @Get('planning-view')
  @Render('leave-planning')
  async planningView(@Req() req: any) {
    const allowedSites = this.getAllowedSites(req.session.user.site);
    const departementList = await this.employeeService.findAllDepartments()
    const lineList = await this.employeeService.findAllLines()
    const KEYS = allowedSites.map(val => {
      // On cherche la clé dans l'objet Site qui possède cette valeur
      const key = (Object.keys(Site) as (keyof typeof Site)[]).find(
        k => Site[k] === val
      );
      return key;
    });
    return { title: "Planning View", departementList, lineList, allowedSites, KEYS };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Get('new-leave-test')
  @Render('new-leave-test')
  async newLeaveView() {
    return { title: "New leave" };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.PAYROLL, UserRole.MANAGER, UserRole.ADMIN, UserRole.HEAD_HR, UserRole.HR_ADMIN)
  @Get('simulate-leave')
  @Render('simulate-leave')
  async simulateLeave() {
    return { title: "Simulate leave", userRole: UserRole };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto, @Res() res: express.Response, @Req() req: any) {
    return this.leaveService.create(createLeaveDto, res, req);
  }

  @Get()
  findAll() {
    return this.leaveService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeaveDto: UpdateLeaveDto) {
    return this.leaveService.update(id, updateLeaveDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaveService.remove(id);
  }
}
