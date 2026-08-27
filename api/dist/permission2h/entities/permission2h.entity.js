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
exports.Permission2h = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("../../employee/entities/employee.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const leave_entity_1 = require("../../leave/entities/leave.entity");
let Permission2h = class Permission2h {
    id;
    reason;
    date;
    expectedStartTime;
    expectedEndTime;
    startTime;
    endTime;
    employee;
    approved_date;
    approver;
    status;
    applied_at;
};
exports.Permission2h = Permission2h;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Permission2h.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        nullable: true,
    }),
    __metadata("design:type", String)
], Permission2h.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: true,
    }),
    __metadata("design:type", Date)
], Permission2h.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'time',
    }),
    __metadata("design:type", String)
], Permission2h.prototype, "expectedStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'time',
    }),
    __metadata("design:type", String)
], Permission2h.prototype, "expectedEndTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'time',
        nullable: true,
    }),
    __metadata("design:type", String)
], Permission2h.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'time',
        nullable: true,
    }),
    __metadata("design:type", String)
], Permission2h.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, (employee) => employee.permission2h, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_matricule', referencedColumnName: 'matricule' }),
    __metadata("design:type", employee_entity_1.Employee)
], Permission2h.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Permission2h.prototype, "approved_date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.leaves),
    (0, typeorm_1.JoinColumn)({ name: 'approver_id' }),
    __metadata("design:type", user_entity_1.User)
], Permission2h.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: leave_entity_1.LeaveStatus.PENDING }),
    __metadata("design:type", String)
], Permission2h.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Permission2h.prototype, "applied_at", void 0);
exports.Permission2h = Permission2h = __decorate([
    (0, typeorm_1.Entity)()
], Permission2h);
//# sourceMappingURL=permission2h.entity.js.map