"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const auth_service_1 = require("./auth/auth.service");
const user_service_1 = require("./user/user.service");
const user_entity_1 = require("./user/entities/user.entity");
const role_guard_1 = require("./user/role.guard");
const role_decorator_1 = require("./user/role.decorator");
const employee_service_1 = require("./employee/employee.service");
const auth_guard_1 = require("./auth/auth.guard");
const nestjs_i18n_1 = require("nestjs-i18n");
const leave_service_1 = require("./leave/leave.service");
const smia_ostie_service_1 = require("./smia_ostie/smia_ostie.service");
let AppController = class AppController {
    appService;
    authService;
    userService;
    employeeService;
    leaveService;
    smiaOstieService;
    constructor(appService, authService, userService, employeeService, leaveService, smiaOstieService) {
        this.appService = appService;
        this.authService = authService;
        this.userService = userService;
        this.employeeService = employeeService;
        this.leaveService = leaveService;
        this.smiaOstieService = smiaOstieService;
    }
    obtenirDateReference = () => {
        const d = new Date();
        const jourSemaine = d.getDay();
        if (jourSemaine === 1) {
            d.setDate(d.getDate() - 3);
        }
        else {
            d.setDate(d.getDate() - 1);
        }
        return d;
    };
    getAllowedSites(userSite) {
        if (userSite === user_entity_1.Site.MADA) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2, user_entity_1.Site.TANA];
        }
        if (userSite === user_entity_1.Site.ANTSIRABE) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2];
        }
        return [userSite];
    }
    async getHello(i18n, req) {
        const date = new Date();
        const activeEmployees = await this.employeeService.getActiveEmployeesNotOnLeave(date);
        const onLeaveEmployees = await this.employeeService.getEmployeesOnLeave(date);
        const totalEmployees = activeEmployees + onLeaveEmployees;
        const dateRef = this.obtenirDateReference();
        const activeEmployeesRef = await this.employeeService.getActiveEmployeesNotOnLeave(dateRef);
        const employeesBySection = await this.employeeService.getEmployeeCountBySection();
        const diff = activeEmployees - activeEmployeesRef;
        const { currentRate, lastRate, variation } = await this.leaveService.getMonthlyAbsenceRate();
        let status = 'neutral';
        if (diff > 0) {
            status = 'positive';
        }
        else if (diff < 0) {
            status = 'negative';
        }
        const { ongoingLeaves, approvedLeaves, totalLeaves, approvalRate } = await this.leaveService.getLeavesStatsCurrentMonth();
        const { pendingLeaves, totalLeaves: totalLeaves2, pendingRate } = await this.leaveService.getPendingLeavesStats();
        const monthlyStats = await this.leaveService.getAbsenceByMonth(date.getFullYear());
        const leaveTypes = await this.leaveService.getLeaveTypesDistribution();
        const leaveStatus = await this.leaveService.getLeaveStatusStats();
        const managerStats = await this.leaveService.getAbsenceByManager();
        const sectionStats = await this.leaveService.getAbsenceBySection();
        const medicalStats = await this.smiaOstieService.getMedicalRateBySectionToday();
        const medicalByManagerStats = await this.smiaOstieService.getMedicalConsultationByManager();
        const absenceRateBySection = await this.leaveService.getMonthlyLeaveDistributionBySection();
        const monthlyGlobalAbsenceRate = await this.leaveService.getMonthlyGlobalAbsenceRate();
        const ongoingLeavesBySection = await this.leaveService.getOngoingLeavesBySection();
        const pendingLeavesBySection = await this.leaveService.getPendingLeavesBySection();
        const userStats = await this.userService.getUsersDashboardStats();
        const allowedSites = this.getAllowedSites(req.session.user.site);
        const departementList = await this.employeeService.findAllDepartments();
        const divisionList = await this.employeeService.findAllDivisions();
        const sectionList = await this.employeeService.findAllSections();
        const lineList = await this.employeeService.findAllLines();
        const KEYS = allowedSites.map(val => {
            const key = Object.keys(user_entity_1.Site).find(k => user_entity_1.Site[k] === val);
            return key;
        });
        return { t: (key) => i18n.t(key), title: 'Dashboard', activeEmployees, onLeaveEmployees, totalEmployees, diff, status, currentRate, lastRate, variation, ongoingLeaves, approvedLeaves, totalLeaves, approvalRate, pendingLeaves, totalLeaves2, pendingRate, monthlyStats, leaveTypes, leaveStatus, managerStats, sectionStats, medicalStats, medicalByManagerStats, userStats, departementList, divisionList, sectionList, lineList, KEYS, allowedSites, employeesBySection, absenceRateBySection, monthlyGlobalAbsenceRate, ongoingLeavesBySection, pendingLeavesBySection };
    }
    async getLogin(i18n, req, res) {
        if (req.session.user) {
            return res.redirect('/');
        }
        return { t: (key) => i18n.t(key), title: 'Login' };
    }
    async login(i18n, body, req, res) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            return res.render('login', { error: 'Invalid credentials', t: (key) => i18n.t(key), title: 'Login' });
        }
        req.session.user = user;
        return res.redirect('/');
    }
    getRegister() {
        return { title: 'Register', UserRole: user_entity_1.UserRole };
    }
    async register(body, req, res) {
        if (body.password !== body.confirmPassword) {
            return res.render('register', { error: 'Passwords do not match' });
        }
        const user = await this.userService.create(body);
        if (!user) {
            return res.render('register', { error: 'Invalid credentials' });
        }
        return res.redirect('/user/list');
    }
    async logout(req, res) {
        req.session.destroy();
        return res.redirect('/login');
    }
    async test(req, res) {
        return res.render('import-test', { title: 'Test' });
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(),
    (0, common_1.Render)('index'),
    __param(0, (0, nestjs_i18n_1.I18n)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nestjs_i18n_1.I18nContext, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('login'),
    (0, common_1.Render)('login'),
    __param(0, (0, nestjs_i18n_1.I18n)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nestjs_i18n_1.I18nContext, Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getLogin", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, nestjs_i18n_1.I18n)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nestjs_i18n_1.I18nContext, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Get)('register'),
    (0, common_1.Render)('register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AppController.prototype, "getRegister", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)("test"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "test", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        auth_service_1.AuthService,
        user_service_1.UserService,
        employee_service_1.EmployeeService,
        leave_service_1.LeaveService,
        smia_ostie_service_1.SmiaOstieService])
], AppController);
//# sourceMappingURL=app.controller.js.map