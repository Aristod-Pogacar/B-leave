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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Site = exports.UserRole = void 0;
const employee_entity_1 = require("../../employee/entities/employee.entity");
const leave_entity_1 = require("../../leave/entities/leave.entity");
const withdraw_entity_1 = require("../../withdraw/entities/withdraw.entity");
const typeorm_1 = require("typeorm");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["HR_LEAD"] = "HR_LEAD";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["PAYROLL"] = "PAYROLL";
    UserRole["SUPERADMIN"] = "SUPERADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var Site;
(function (Site) {
    Site["ABE1"] = "ABE 1";
    Site["ABE2"] = "ABE 2";
    Site["ANTSIRABE"] = "ANTSIRABE";
    Site["TANA"] = "TANA";
    Site["MADA"] = "MADA";
})(Site || (exports.Site = Site = {}));
let User = class User {
    id;
    phone;
    email;
    password;
    role;
    site;
    createdAt;
    updatedAt;
    isActive;
    isVerified;
    isDeleted;
    isBlocked;
    isSuspended;
    isArchived;
    leaves;
    withdrawn;
    employee;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        default: UserRole.PAYROLL
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: Site, default: Site.ABE1 }),
    __metadata("design:type", String)
], User.prototype, "site", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isBlocked", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isSuspended", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isArchived", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leave_entity_1.Leave, leave => leave.approver),
    __metadata("design:type", Array)
], User.prototype, "leaves", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => withdraw_entity_1.Withdraw, withdraw => withdraw.approver),
    __metadata("design:type", Array)
], User.prototype, "withdrawn", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => employee_entity_1.Employee, employee => employee.user, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", Object)
], User.prototype, "employee", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
//# sourceMappingURL=user.entity.js.map