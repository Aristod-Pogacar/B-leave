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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const employee_entity_1 = require("../employee/entities/employee.entity");
const employee_service_1 = require("../employee/employee.service");
let UserService = class UserService {
    userRepo;
    jwtService;
    employeeService;
    constructor(userRepo, jwtService, employeeService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.employeeService = employeeService;
    }
    async create(createUserDto) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
        const employee = await this.employeeService.findOne(createUserDto.employee);
        if (!employee) {
            throw new common_1.BadRequestException("Employee not found");
        }
        if (employee.user) {
            throw new common_1.BadRequestException("Employee already has a user");
        }
        const user = await this.userRepo.save({
            ...createUserDto,
            password: hashedPassword,
            employee,
            site: employee.site
        });
        return user;
    }
    async searchManager(site, search) {
        const allowedSites = this.getAllowedSites(site);
        const result = await this.userRepo.find({
            where: [
                { employee: { site: (0, typeorm_2.In)(allowedSites), name: (0, typeorm_2.Like)(`%${search}%`) }, role: user_entity_1.UserRole.MANAGER },
                { employee: { site: (0, typeorm_2.In)(allowedSites), firstname: (0, typeorm_2.Like)(`%${search}%`) }, role: user_entity_1.UserRole.MANAGER },
                { employee: { site: (0, typeorm_2.In)(allowedSites), matricule: (0, typeorm_2.Like)(`%${search}%`) }, role: user_entity_1.UserRole.MANAGER }
            ],
            select: ['id', 'employee', 'email', 'phone', 'role'],
            relations: ['employee']
        });
        return result;
    }
    getAllowedSites(userSite) {
        if (userSite === user_entity_1.Site.MADA) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2, user_entity_1.Site.TANA];
        }
        else if (userSite === user_entity_1.Site.ANTSIRABE) {
            return [user_entity_1.Site.ABE1, user_entity_1.Site.ABE2];
        }
        else if (userSite === user_entity_1.Site.TANA) {
            return [user_entity_1.Site.TANA];
        }
        else if (userSite === user_entity_1.Site.ABE1) {
            return [user_entity_1.Site.ABE1];
        }
        else if (userSite === user_entity_1.Site.ABE2) {
            return [user_entity_1.Site.ABE2];
        }
        else {
            return [];
        }
    }
    async findAllManagers(site) {
        const allowedSites = this.getAllowedSites(site);
        return await this.userRepo.find({ where: { employee: { site: (0, typeorm_2.In)(allowedSites) }, role: user_entity_1.UserRole.MANAGER } });
    }
    async getAdminUser() {
        const employee = new employee_entity_1.Employee();
        employee.matricule = "superadmin";
        employee.firstname = "Super";
        employee.name = "Admin";
        employee.site = user_entity_1.Site.MADA;
        const user = new user_entity_1.User();
        user.id = "superadmin";
        user.phone = "-";
        user.email = process.env.SUPERADMIN_EMAIL;
        user.role = user_entity_1.UserRole.SUPERADMIN;
        user.employee = employee;
        user.site = user_entity_1.Site.MADA;
        return user;
    }
    async findAll() {
        return await this.userRepo.find({ relations: ['employee'] });
    }
    async findOne(id) {
        return await this.userRepo.findOne({ where: { id }, relations: ['employee'] });
    }
    async update(id, updateUserDto) {
        return await this.userRepo.update(id, updateUserDto);
    }
    async remove(id) {
        return await this.userRepo.delete(id);
    }
    async approveUser(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException("User not found");
        }
        user.isActive = true;
        await this.userRepo.save(user);
        return { message: "User approved" };
    }
    async updatePassword(id, body) {
        const user = await this.userRepo.findOne({ where: { id } });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.newPassword, salt);
        if (!user) {
            throw new common_1.BadRequestException("User not found");
        }
        const match = await bcrypt.compare(body.actualPassword, user.password);
        if (body.newPassword != body.confirmPassword) {
            throw new common_1.BadRequestException("New password and confirm password do not match");
        }
        if (!match) {
            throw new common_1.BadRequestException("Actual password do not match");
        }
        await this.userRepo.update(id, { password: hashedPassword });
        return user;
    }
    async login(email, password) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException();
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            throw new common_1.UnauthorizedException();
        if (!user.isVerified)
            throw new common_1.ForbiddenException('Email not verified');
        if (!user.isActive)
            throw new common_1.ForbiddenException('Waiting admin approval');
        if (user.isBlocked || user.isSuspended || user.isArchived)
            throw new common_1.ForbiddenException('Account restricted');
        const payload = { sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload)
        };
    }
    async getUsersDashboardStats() {
        const users = await this.userRepo.find({
            where: {
                isDeleted: false
            },
            order: {
                createdAt: "DESC"
            },
            relations: ['employee']
        });
        const admins = users.filter(u => u.role === user_entity_1.UserRole.ADMIN ||
            u.role === user_entity_1.UserRole.SUPERADMIN).length;
        const hrManagers = users.filter(u => u.role === user_entity_1.UserRole.HR_LEAD).length;
        const managers = users.filter(u => u.role === user_entity_1.UserRole.MANAGER).length;
        const payrolls = users.filter(u => u.role === user_entity_1.UserRole.PAYROLL).length;
        return {
            users: users.slice(0, 5),
            stats: {
                admins,
                hrManagers,
                managers,
                payrolls
            }
        };
    }
    async findOneByMatricule(matricule) {
        return await this.userRepo.findOne({ where: { employee: { matricule } } });
    }
    async findPayrollUser(role, site) {
        return await this.userRepo.find({ where: { role, employee: { site } }, relations: ['employee'] });
    }
    async findUsersByRole(role, site) {
        return await this.userRepo.find({ where: { role, employee: { site } }, relations: ['employee'] });
    }
    async save(user) {
        return await this.userRepo.save(user);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        employee_service_1.EmployeeService])
], UserService);
//# sourceMappingURL=user.service.js.map