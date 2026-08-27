"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = __importDefault(require("express"));
const platform_express_1 = require("@nestjs/platform-express");
const employee_service_1 = require("./employee.service");
const update_employee_dto_1 = require("./dto/update-employee.dto");
const multer_1 = require("multer");
const role_guard_1 = require("../user/role.guard");
const role_decorator_1 = require("../user/role.decorator");
const user_entity_1 = require("../user/entities/user.entity");
const XLSX = __importStar(require("xlsx"));
const user_service_1 = require("../user/user.service");
const history_service_1 = require("../history/history.service");
const history_entity_1 = require("../history/entities/history.entity");
const bcrypt = __importStar(require("bcrypt"));
let EmployeeController = class EmployeeController {
    employeeService;
    userService;
    historyService;
    constructor(employeeService, userService, historyService) {
        this.employeeService = employeeService;
        this.userService = userService;
        this.historyService = historyService;
    }
    getAllowedSites(userSite) {
        if (userSite === user_entity_1.Site.MADA) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2, user_entity_1.Site.TANA];
        }
        if (userSite === user_entity_1.Site.ANTSIRABE) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2];
        }
        return [userSite];
    }
    async getEmployeeConfirmArchive(id, req) {
        const employee = await this.employeeService.findOne(id);
        return { title: "Confirm archive", employee };
    }
    async getEmployeeConfirmArchivePost(id, req, res, body) {
        const employee = await this.employeeService.archiveEmployee(id, body.DOR);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.EMPLOYEE,
            message: `Employee ${employee.matricule} archived by ${req.session.user.firstName} ${req.session.user.name}`,
            created_by: req.session.user.matricule,
        });
        return res.redirect(`/employee/list`);
    }
    async getEmployee(id, req) {
        const employee = await this.employeeService.findOne(id);
        return { title: "Employee details", employee };
    }
    async getEmployeeEdit(id, req, error = '') {
        const allowedSites = this.getAllowedSites(req.session.user.site);
        const employee = await this.employeeService.findOne(id);
        const KEYS = allowedSites.map(val => {
            const key = Object.keys(user_entity_1.Site).find(k => user_entity_1.Site[k] === val);
            return key;
        });
        return { title: "Edit employee", employee, allowedSites, KEYS, error };
    }
    async postEmployeeEdit(id, body, res) {
        const managerId = body.managerId;
        console.log("BODY: ", body);
        return await this.employeeService.updateEmployee(id, body, res, managerId);
    }
    async getMedicalService(req, search = '', page = 1, startDate = '', endDate = '') {
        const limit = 20;
        const { data, total, totalPages } = await this.employeeService.paginateEmployee(search, Number(page), limit, req.session.user);
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
    compare(data) {
        return this.employeeService.compare(data);
    }
    async getImportPassword(req) {
        return { title: "Import Password", error: req.query.error };
    }
    async importFromPassword(body, file, res, req) {
        if (file) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet);
            const filtered = rows.map(row => ({
                matricule: row['matricule'],
                app_password: row['app_password'],
                onehr_password: row['onehr_password']
            }));
            const cleanData = filtered.filter(x => x.matricule);
            for (const data of cleanData) {
                await this.employeeService.updatePassword(data);
            }
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.EMPLOYEE,
                message: "Import password send by " + req.session.user.firstName + " " + req.session.user.name,
                created_by: req.session.user.matricule,
            });
            return res.redirect('/');
        }
        else {
            throw new common_1.BadRequestException('Aucun fichier reçu');
        }
    }
    async getImportManager(req) {
        return { title: "Import Manager", error: req.query.error };
    }
    async importFromManager(body, file, res, req) {
        if (file) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet);
            const filtered = rows.map(row => ({
                matricule: row['matricule'],
                manager: row['manager']
            }));
            const cleanData = filtered.filter(x => x.matricule);
            for (const data of cleanData) {
                await this.employeeService.updateManager(data);
            }
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.EMPLOYEE,
                message: "Import manager by " + req.session.user.firstName + " " + req.session.user.name,
                created_by: req.session.user.matricule,
            });
            const filtered2 = rows.map(row => ({
                matricule: row['matricule'],
                app_password: row['app_password'],
                onehr_password: row['onehr_password']
            }));
            const cleanData2 = filtered2.filter(x => x.matricule);
            for (const data of cleanData2) {
                await this.employeeService.updatePassword(data);
            }
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.EMPLOYEE,
                message: "Import password send by " + req.session.user.firstName + " " + req.session.user.name,
                created_by: req.session.user.matricule,
            });
            return res.redirect('/');
        }
        else {
            const error = "Aucun fichier reçu";
            return res.redirect('/employee/import-manager?error=' + error);
        }
    }
    async search(q, req) {
        return this.employeeService.search(q, req.session.user);
    }
    async searchForUser(q, req) {
        return this.employeeService.searchForUser(q, req.session.user);
    }
    async findOneByMatricule(matricule) {
        return await this.employeeService.findOneByMatricule(matricule);
    }
    async findOneByName(name) {
        return this.employeeService.findOneByName(name);
    }
    async findByLine(line) {
        return this.employeeService.findByLine(line);
    }
    async findBySection(section) {
        return this.employeeService.findBySection(section);
    }
    async findByLineAndSection(line, section) {
        return this.employeeService.findByLineAndSection(line, section);
    }
    async findAllByLineAndSection(req, line, section, division, site, skip = 0, take = 50, year = new Date().getFullYear(), search = '') {
        const employees = await this.employeeService.getEmployeesWithBalances(line, "", section, division, site, +skip, +take, +year, req.session.user, search);
        return employees;
    }
    async test(req, line, departement, section, division, site, skip = 0, take = 50, year = new Date().getFullYear()) {
        const employees = await this.employeeService.getEmployeesWithBalances(line, departement, section, division, site, +skip, +take, +year, req.session.user, '');
        return employees;
    }
    async newEmployee(req, line, departement, error = '') {
        const allowedSites = this.getAllowedSites(req.session.user.site);
        const employees = await this.employeeService.getEmployees(line, departement);
        const KEYS = allowedSites.map(val => {
            const key = Object.keys(user_entity_1.Site).find(k => user_entity_1.Site[k] === val);
            return key;
        });
        return { title: "New Employee", employees, allowedSites, KEYS, error };
    }
    async getMyTeam(req, search = '') {
        const employees = await this.employeeService.getMyTeam(req.session.user, search);
        return { title: "My Team", employees, search };
    }
    async getNoManager(req, search) {
        const employees = await this.employeeService.getNoManager(req.session.user.site, search);
        return employees;
    }
    async assignManager(req) {
        const employees = await this.employeeService.getNoManager(req.session.user.site, "");
        const managers = await this.userService.findAllManagers(req.session.user.site);
        return { title: "Assign Manager", employees, managers };
    }
    async assignManagerPost(body, res, req) {
        await this.employeeService.assignManager(body.managerId, body.employeeIds);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.EMPLOYEE,
            message: "Assign manager by " + req.session.user.firstName + " " + req.session.user.name,
            created_by: req.session.user.matricule,
        });
        return res.redirect('/employee/assign-manager');
    }
    async getAssignedEmployees(req, managerId) {
        const employees = await this.employeeService.getAssignedEmployees(managerId);
        return employees;
    }
    async newEmployeePost(body, res, req) {
        await this.employeeService.create(body, res, req);
    }
    async importMasterFile(req) {
        return { title: "Import Master File", error: req.query.error };
    }
    async import(body, file, res, req) {
        try {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet);
            await this.employeeService.processExcelBuffer(file);
            const filtered = rows.map(row => ({
                matricule: "" + row['Emp Id'],
                manager: "" + row['Manager']
            }));
            const cleanData = filtered.filter(x => x.matricule);
            for (const data of cleanData) {
                await this.employeeService.updateManager(data);
            }
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.EMPLOYEE,
                message: "Import manager by " + req.session.user.firstName + " " + req.session.user.name,
                created_by: req.session.user.matricule,
            });
            const rolesFiltered = rows
                .map(row => ({
                matricule: "" + row['Emp Id'],
                role: "" + row['Role'],
                email: "" + row['Email'],
            }));
            const cleanDataRole = rolesFiltered.filter(x => x.matricule);
            for (const data of cleanDataRole) {
                if (data.role !== 'undefined') {
                    const u = await this.userService.findOneByMatricule(data.matricule);
                    const employee = await this.employeeService.findOneByMatricule(data.matricule);
                    if (!u && employee) {
                        const salt = await bcrypt.genSalt(10);
                        const user = new user_entity_1.User();
                        user.email = data.email;
                        user.role = data.role;
                        user.employee = employee;
                        user.site = employee.site;
                        const hashedPassword = await bcrypt.hash(data.matricule, salt);
                        user.password = hashedPassword;
                        await this.userService.save(user);
                    }
                }
            }
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.EMPLOYEE,
                message: "Import role by " + req.session.user.firstName + " " + req.session.user.name,
                created_by: req.session.user.matricule,
            });
            await this.historyService.create({
                reason: history_entity_1.HistoryReason.EMPLOYEE,
                message: "Import master file by " + req.session.user.firstName + " " + req.session.user.name,
                created_by: req.session.user.matricule,
            });
            res.redirect(`/`);
        }
        catch (error) {
            console.log(error);
            res.redirect(`/employee/import-master-file?error=${encodeURIComponent(error.message)}`);
        }
    }
    async find(body) {
        console.log('body', body);
        const result = await this.employeeService.getEmployeeWithBalances(body.matricule, body.date);
        const employee = result.data[0];
        return employee;
    }
    findAll() {
        return this.employeeService.findAll();
    }
    findOne(matricule) {
        return this.employeeService.findOneByMatricule(matricule);
    }
    update(id, updateEmployeeDto) {
        return this.employeeService.update(id, updateEmployeeDto);
    }
    remove(id) {
        return this.employeeService.remove(id);
    }
};
exports.EmployeeController = EmployeeController;
__decorate([
    (0, common_1.Get)('confirm-archive/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Render)('confirm-archive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeConfirmArchive", null);
__decorate([
    (0, common_1.Post)('confirm-archive/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.HR_LEAD),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeConfirmArchivePost", null);
__decorate([
    (0, common_1.Get)('details/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.PAYROLL, user_entity_1.UserRole.HR_LEAD),
    (0, common_1.Render)('employee'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployee", null);
__decorate([
    (0, common_1.Get)('edit/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Render)('edit-employee'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('error')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeEdit", null);
__decorate([
    (0, common_1.Post)('edit/:id'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "postEmployeeEdit", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.HR_LEAD, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Render)('employee-list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getMedicalService", null);
__decorate([
    (0, common_1.Post)('compare'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "compare", null);
__decorate([
    (0, common_1.Get)('import-password'),
    (0, common_1.Render)('import-password'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getImportPassword", null);
__decorate([
    (0, common_1.Post)('import-password'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "importFromPassword", null);
__decorate([
    (0, common_1.Get)('import-manager'),
    (0, common_1.Render)('import-manager'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getImportManager", null);
__decorate([
    (0, common_1.Post)('import-manager'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "importFromManager", null);
__decorate([
    (0, common_1.Get)('finding/search-list'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('finding/search-for-user'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "searchForUser", null);
__decorate([
    (0, common_1.Get)('find-one-by-matricule'),
    __param(0, (0, common_1.Query)('matricule')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "findOneByMatricule", null);
__decorate([
    (0, common_1.Get)('find-one-by-name'),
    __param(0, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "findOneByName", null);
__decorate([
    (0, common_1.Get)('find-by-line'),
    __param(0, (0, common_1.Query)('line')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "findByLine", null);
__decorate([
    (0, common_1.Get)('find-by-section'),
    __param(0, (0, common_1.Query)('section')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "findBySection", null);
__decorate([
    (0, common_1.Get)('find-by-line-and-section'),
    __param(0, (0, common_1.Query)('line')),
    __param(1, (0, common_1.Query)('section')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "findByLineAndSection", null);
__decorate([
    (0, common_1.Get)('find-all'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('line')),
    __param(2, (0, common_1.Query)('section')),
    __param(3, (0, common_1.Query)('division')),
    __param(4, (0, common_1.Query)('site')),
    __param(5, (0, common_1.Query)('skip')),
    __param(6, (0, common_1.Query)('take')),
    __param(7, (0, common_1.Query)('year')),
    __param(8, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Number, Number, Number, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "findAllByLineAndSection", null);
__decorate([
    (0, common_1.Get)('test'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('line')),
    __param(2, (0, common_1.Query)('departement')),
    __param(3, (0, common_1.Query)('section')),
    __param(4, (0, common_1.Query)('division')),
    __param(5, (0, common_1.Query)('site')),
    __param(6, (0, common_1.Query)('skip')),
    __param(7, (0, common_1.Query)('take')),
    __param(8, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "test", null);
__decorate([
    (0, common_1.Get)('new-employee'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Render)('new-employee'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('line')),
    __param(2, (0, common_1.Query)('departement')),
    __param(3, (0, common_1.Query)('error')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "newEmployee", null);
__decorate([
    (0, common_1.Get)('my-team'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.MANAGER),
    (0, common_1.Render)('my-team'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getMyTeam", null);
__decorate([
    (0, common_1.Get)('no-manager'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getNoManager", null);
__decorate([
    (0, common_1.Get)('assign-manager'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.ADMIN),
    (0, common_1.Render)('employee-assign'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "assignManager", null);
__decorate([
    (0, common_1.Post)('assign-manager'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "assignManagerPost", null);
__decorate([
    (0, common_1.Get)('assigned-employees/:managerId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('managerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getAssignedEmployees", null);
__decorate([
    (0, common_1.Post)('new-employee'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "newEmployeePost", null);
__decorate([
    (0, common_1.Get)('import-master-file'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Render)('import-master-file'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "importMasterFile", null);
__decorate([
    (0, common_1.Post)('import-master-file'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "import", null);
__decorate([
    (0, common_1.Post)('employee-with-balances'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "find", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':matricule'),
    __param(0, (0, common_1.Param)('matricule')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_employee_dto_1.UpdateEmployeeDto]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "remove", null);
exports.EmployeeController = EmployeeController = __decorate([
    (0, common_1.Controller)('employee'),
    __metadata("design:paramtypes", [employee_service_1.EmployeeService,
        user_service_1.UserService,
        history_service_1.HistoryService])
], EmployeeController);
//# sourceMappingURL=employee.controller.js.map