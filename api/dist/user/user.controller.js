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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const auth_guard_1 = require("../auth/auth.guard");
const user_entity_1 = require("./entities/user.entity");
const role_guard_1 = require("./role.guard");
const role_decorator_1 = require("./role.decorator");
const auth_service_1 = require("../auth/auth.service");
const history_service_1 = require("../history/history.service");
const history_entity_1 = require("../history/entities/history.entity");
const bcrypt = __importStar(require("bcrypt"));
let UserController = class UserController {
    userService;
    authService;
    historyService;
    constructor(userService, authService, historyService) {
        this.userService = userService;
        this.authService = authService;
        this.historyService = historyService;
    }
    getAllowedSitesForNewUsers(userSite) {
        if (userSite === user_entity_1.Site.MADA) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2, user_entity_1.Site.ANTSIRABE, user_entity_1.Site.TANA, user_entity_1.Site.MADA];
        }
        if (userSite === user_entity_1.Site.ANTSIRABE) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2, user_entity_1.Site.ANTSIRABE];
        }
        return [userSite];
    }
    enumAllowed(userSite) {
        let values = [];
        if (userSite === user_entity_1.Site.MADA) {
            values = [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2, user_entity_1.Site.ANTSIRABE, user_entity_1.Site.TANA, user_entity_1.Site.MADA];
        }
        else if (userSite === user_entity_1.Site.ANTSIRABE) {
            values = [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2, user_entity_1.Site.ANTSIRABE];
        }
        else {
            values = [userSite];
        }
        return values.map(val => {
            const key = Object.keys(user_entity_1.Site).find(k => user_entity_1.Site[k] === val);
            return key;
        });
    }
    async saveMyPassword(body, res, req) {
        const user = await this.userService.findOne(req.session.user.id);
        if (!user) {
            return res.redirect('/');
        }
        if (body.newPassword != body.confirmPassword) {
            const userSite = req.session.user.site;
            const sites = this.getAllowedSitesForNewUsers(userSite);
            const allowedKeys = this.enumAllowed(userSite);
            return res.render('edit-password', {
                title: 'Edit password',
                user: user,
                userRole: user_entity_1.UserRole,
                sites: sites,
                allowedKeys: allowedKeys,
                error: 'New password and confirm password do not match'
            });
        }
        const match = await bcrypt.compare(body.actualPassword, user.password);
        if (!match) {
            const userSite = req.session.user.site;
            const sites = this.getAllowedSitesForNewUsers(userSite);
            const allowedKeys = this.enumAllowed(userSite);
            return res.render('edit-password', {
                title: 'Edit password',
                user: user,
                userRole: user_entity_1.UserRole,
                sites: sites,
                allowedKeys: allowedKeys,
                error: 'Actual password do not match'
            });
        }
        await this.userService.updatePassword(req.session.user.id, body);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.USER,
            message: "Password changed for " + user.employee?.firstname + " " + user.employee?.name + " by " + req.session.user.employee?.firstname + " " + req.session.user.employee?.name,
            created_by: req.session.user.employee?.matricule,
        });
        return res.redirect('/user/my-profil?success=true');
    }
    async connectAdminUser(req, res, body) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        req.session.user = user;
        return res.status(200).json({ success: true });
    }
    async getLoginAdmin(res, body) {
        const user = await this.authService.getEmailOrMatricule(body.login);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        return res.status(200).json({ success: true });
    }
    async getAllManagers(req) {
        return this.userService.findAllManagers(req.session.user.site);
    }
    async searchManager(req, search) {
        return await this.userService.searchManager(req.session.user.site, search);
    }
    async getList(req) {
        const admin = await this.userService.getAdminUser();
        const baseusers = await this.userService.findAll();
        const users = [admin, ...baseusers];
        const userSite = req.session.user.site;
        const sites = this.getAllowedSitesForNewUsers(userSite);
        const allowedKeys = this.enumAllowed(userSite);
        const KEYS = Object.values(user_entity_1.Site).map(val => {
            const key = Object.keys(user_entity_1.Site).find(k => user_entity_1.Site[k] === val);
            return key;
        });
        return {
            users: users,
            title: 'Users',
            userRole: user_entity_1.UserRole,
            site: user_entity_1.Site,
            allValues: Object.values(user_entity_1.Site),
            allowedSites: sites,
            keys: KEYS
        };
    }
    async getNewUser(req) {
        const userSite = req.session.user.site;
        const sites = this.getAllowedSitesForNewUsers(userSite);
        const allowedKeys = this.enumAllowed(userSite);
        return {
            title: 'New user',
            userRole: user_entity_1.UserRole,
            sites: sites,
            allowedKeys: allowedKeys
        };
    }
    async register(body, req, res) {
        if (body.password !== body.confirmPassword) {
            const userSite = req.session.user.site;
            const sites = this.getAllowedSitesForNewUsers(userSite);
            const allowedKeys = this.enumAllowed(userSite);
            return res.render('new-user', {
                title: 'New user',
                userRole: user_entity_1.UserRole,
                sites: sites,
                allowedKeys: allowedKeys,
                error: 'Passwords do not match'
            });
        }
        if (body.phone == null || body.phone == undefined || body.phone == '') {
            const userSite = req.session.user.site;
            const sites = this.getAllowedSitesForNewUsers(userSite);
            const allowedKeys = this.enumAllowed(userSite);
            return res.render('new-user', {
                title: 'New user',
                userRole: user_entity_1.UserRole,
                sites: sites,
                allowedKeys: allowedKeys,
                error: 'Phone number is required'
            });
        }
        if (body.employee == null || body.employee == undefined || body.employee == '' || body.employeeSearch == null || body.employeeSearch == undefined || body.employeeSearch == '') {
            const userSite = req.session.user.site;
            const sites = this.getAllowedSitesForNewUsers(userSite);
            const allowedKeys = this.enumAllowed(userSite);
            return res.render('new-user', {
                title: 'New user',
                userRole: user_entity_1.UserRole,
                sites: sites,
                allowedKeys: allowedKeys,
                error: 'Employee is required'
            });
        }
        const user = await this.userService.create(body);
        if (!user) {
            const userSite = req.session.user.site;
            const sites = this.getAllowedSitesForNewUsers(userSite);
            const allowedKeys = this.enumAllowed(userSite);
            return res.render('new-user', {
                title: 'New user',
                userRole: user_entity_1.UserRole,
                sites: sites,
                allowedKeys: allowedKeys,
                error: 'Invalid credentials'
            });
        }
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.USER,
            message: "User " + user.employee?.firstname + " " + user.employee?.name + " created by " + req.session.user.employee?.firstname + " " + req.session.user.employee?.name,
            created_by: req.session.user.employee?.matricule,
        });
        return res.redirect('/user/list');
    }
    async deleteUser(id) {
        return {
            title: 'Delete user',
            userRole: user_entity_1.UserRole,
            users: await this.userService.findOne(id)
        };
    }
    async deleteTheUser(id, res, req) {
        const user = await this.userService.findOne(id);
        if (!user) {
            return res.redirect('/user/list');
        }
        this.userService.remove(id);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.USER,
            message: "User " + user.employee?.firstname + " " + user.employee?.name + " deleted by " + req.session.user.employee?.firstname + " " + req.session.user.employee?.name,
            created_by: req.session.user.employee?.matricule,
        });
        return res.redirect('/user/list');
    }
    async editUser(id, req) {
        const userSite = req.session.user.site;
        return {
            title: 'Edit user',
            userRole: user_entity_1.UserRole,
            users: await this.userService.findOne(id),
            site: this.getAllowedSitesForNewUsers(userSite)
        };
    }
    async editTheUser(id, updateUserDto, res, req) {
        const user = await this.userService.findOne(id);
        if (!user) {
            return res.redirect('/user/list');
        }
        this.userService.update(id, updateUserDto);
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.USER,
            message: "User " + user.employee?.firstname + " " + user.employee?.name + " updated by " + req.session.user.employee?.firstname + " " + req.session.user.employee?.name,
            created_by: req.session.user.employee?.matricule,
        });
        return res.redirect('/user/list');
    }
    async getMyProfile(req) {
        return {
            title: 'My profile',
            user: req.session.user
        };
    }
    async editMyProfile(req) {
        return {
            title: 'Edit profile',
            user: req.session.user
        };
    }
    async editMyPassword(req) {
        return {
            title: 'Edit password',
            user: req.session.user
        };
    }
    async saveMyProfile(updateUserDto, res, req) {
        const user = await this.userService.findOne(req.session.user.id);
        if (!user) {
            return res.redirect('/');
        }
        await this.userService.update(req.session.user.id, updateUserDto);
        const updatedUser = await this.userService.findOne(req.session.user.id);
        req.session.user = updatedUser;
        await this.historyService.create({
            reason: history_entity_1.HistoryReason.USER,
            message: "User " + user.employee?.firstname + " " + user.employee?.name + " updated by " + req.session.user.employee?.firstname + " " + req.session.user.employee?.name,
            created_by: req.session.user.employee?.matricule,
        });
        return res.redirect('/user/my-profil?success=true');
    }
    create(createUserDto) {
        return this.userService.create(createUserDto);
    }
    findAll() {
        return this.userService.findAll();
    }
    findOne(id) {
        return this.userService.findOne(id);
    }
    update(id, updateUserDto) {
        return this.userService.update(id, updateUserDto);
    }
    remove(id) {
        return this.userService.remove(id);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)('save-password'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "saveMyPassword", null);
__decorate([
    (0, common_1.Post)('connect-admin-user'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "connectAdminUser", null);
__decorate([
    (0, common_1.Post)('get-login-admin'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getLoginAdmin", null);
__decorate([
    (0, common_1.Get)('get-all-managers'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllManagers", null);
__decorate([
    (0, common_1.Get)('search-manager'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "searchManager", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Get)('list'),
    (0, common_1.Render)('users'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getList", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Get)('new-user'),
    (0, common_1.Render)('new-user'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getNewUser", null);
__decorate([
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Post)('new-user'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Get)('delete-user/:id'),
    (0, common_1.Render)('delete-user'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Post)('delete-user/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteTheUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Get)('edit-user/:id'),
    (0, common_1.Render)('edit-user'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "editUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN),
    (0, common_1.Post)('edit-user/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "editTheUser", null);
__decorate([
    (0, common_1.Get)('my-profil'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.HR_LEAD, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Render)('my-profil'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Get)('edit-profil'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Render)('edit-profil'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "editMyProfile", null);
__decorate([
    (0, common_1.Get)('edit-password'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Render)('edit-password'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "editMyPassword", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.HR_LEAD, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.PAYROLL),
    (0, common_1.Post)('save-profile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_user_dto_1.UpdateUserDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "saveMyProfile", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        auth_service_1.AuthService,
        history_service_1.HistoryService])
], UserController);
//# sourceMappingURL=user.controller.js.map