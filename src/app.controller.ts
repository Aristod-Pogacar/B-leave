import { Body, Controller, Get, Post, Render, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import * as express from 'express';
import { AuthService } from './auth/auth.service';
import { SuperAdminGuard } from './superadmin/superadmin.guard';
import { UserService } from './user/user.service';
import { Site, UserRole } from './user/entities/user.entity';
import { RolesGuard } from './user/role.guard';
import { Roles } from './user/role.decorator';
import { EmployeeService } from './employee/employee.service';
import { AuthGuard } from './auth/auth.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { LeaveService } from './leave/leave.service';
import { SmiaOstieService } from './smia_ostie/smia_ostie.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly employeeService: EmployeeService,
    private readonly leaveService: LeaveService,
    private readonly smiaOstieService: SmiaOstieService,
  ) { }

  obtenirDateReference = () => {
    const d = new Date();
    const jourSemaine = d.getDay();

    if (jourSemaine === 1) { // Nous sommes lundi
      d.setDate(d.getDate() - 3); // On recule de 3 jours pour tomber sur vendredi
    } else {
      d.setDate(d.getDate() - 1); // Sinon, on prend juste hier
    }

    return d;
  }

  private getAllowedSites(userSite: string): string[] {

    if (userSite === Site.MADA) {
      return [Site.ABE1, Site.ABE2, Site.TANA]; // pas de filtre
    }

    if (userSite === Site.ANTSIRABE) {
      return [Site.ABE1, Site.ABE2];
    }

    return [userSite];
  }

  @UseGuards(AuthGuard)
  @Get()
  @Render('index')
  async getHello(@I18n() i18n: I18nContext, @Req() req: any) {
    const date = new Date();
    const activeEmployees = await this.employeeService.getActiveEmployeesNotOnLeave(date);
    const onLeaveEmployees = await this.employeeService.getEmployeesOnLeave(date);
    const totalEmployees = activeEmployees + onLeaveEmployees;

    const dateRef = this.obtenirDateReference();
    const activeEmployeesRef = await this.employeeService.getActiveEmployeesNotOnLeave(dateRef);
    const diff = activeEmployees - activeEmployeesRef;

    const { currentRate, lastRate, variation } = await this.leaveService.getMonthlyAbsenceRate();

    let status = 'neutral';
    if (diff > 0) {
      status = 'positive';
    } else if (diff < 0) {
      status = 'negative';
    }

    const { ongoingLeaves, approvedLeaves, totalLeaves, approvalRate } = await this.leaveService.getLeavesStatsCurrentMonth();
    const { pendingLeaves, totalLeaves: totalLeaves2, pendingRate } = await this.leaveService.getPendingLeavesStats();

    const monthlyStats = await this.leaveService.getAbsenceByMonth(date.getFullYear());

    const leaveTypes = await this.leaveService.getLeaveTypesDistribution();

    const leaveStatus = await this.leaveService.getLeaveStatusStats();

    const sectionStats = await this.leaveService.getAbsenceBySection();

    const medicalStats = await this.smiaOstieService.getMedicalRateBySectionToday();

    const userStats = await this.userService.getUsersDashboardStats();
    const allowedSites = this.getAllowedSites(req.session.user.site);
    const departementList = await this.employeeService.findAllDepartments()
    const divisionList = await this.employeeService.findAllDivisions()
    const sectionList = await this.employeeService.findAllSections()
    const lineList = await this.employeeService.findAllLines()
    const KEYS = allowedSites.map(val => {
      const key = (Object.keys(Site) as (keyof typeof Site)[]).find(
        k => Site[k] === val
      );
      return key;
    });

    return { t: (key: string) => i18n.t(key), title: 'Dashboard', activeEmployees, onLeaveEmployees, totalEmployees, diff, status, currentRate, lastRate, variation, ongoingLeaves, approvedLeaves, totalLeaves, approvalRate, pendingLeaves, totalLeaves2, pendingRate, monthlyStats, leaveTypes, leaveStatus, sectionStats, medicalStats, userStats, departementList, divisionList, sectionList, lineList, KEYS, allowedSites };
  }

  @Get('login')
  @Render('login')
  async getLogin(@I18n() i18n: I18nContext, @Req() req: any, @Res({ passthrough: true }) res: any) {
    console.log(i18n.lang);
    if (req.session.user) {
      return res.redirect('/');
    }
    console.log(i18n.t('LOGIN', { lang: 'fr' }));
    console.log(i18n.t('LOGIN', { lang: 'en' }));
    console.log(i18n.t('LOGIN', { lang: 'mg' }));
    return { t: (key: string) => i18n.t(key), title: 'Login' };
  }

  @Post('login')
  async login(@I18n() i18n: I18nContext, @Body() body, @Req() req: any, @Res() res: any) {
    const user = await this.authService.validateUser(
      body.email,
      body.password,
    );

    if (!user) {
      return res.render('login', { error: 'Invalid credentials', t: (key: string) => i18n.t(key), title: 'Login' });
    }

    req.session.user = user;

    return res.redirect('/');
  }

  // @UseGuards(AuthGuard)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get('register')
  @Render('register')
  getRegister(): { title: string; UserRole: typeof UserRole; } {
    return { title: 'Register', UserRole: UserRole };
  }

  // @UseGuards(AuthGuard)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post('register')
  async register(@Body() body, @Req() req: any, @Res() res: any) {
    if (body.password !== body.confirmPassword) {
      return res.render('register', { error: 'Passwords do not match' });
    }
    const user = await this.userService.create(body);

    if (!user) {
      return res.render('register', { error: 'Invalid credentials' });
    }

    return res.redirect('/user/list');
  }

  @UseGuards(AuthGuard)
  @Get('logout')
  async logout(@Req() req: any, @Res() res: any) {
    req.session.destroy();
    return res.redirect('/login');
  }

  @Get("test")
  async test(@Req() req: any, @Res() res: any) {
    return res.render('import-test', { title: 'Test' });
  }
}
