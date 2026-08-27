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
exports.Leave = exports.WithdrawStatus = exports.LeaveStatus = void 0;
const employee_entity_1 = require("../../employee/entities/employee.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const withdraw_entity_1 = require("../../withdraw/entities/withdraw.entity");
const typeorm_1 = require("typeorm");
var LeaveStatus;
(function (LeaveStatus) {
    LeaveStatus["PENDING"] = "pending";
    LeaveStatus["APPROVED"] = "approved";
    LeaveStatus["REJECTED"] = "rejected";
    LeaveStatus["WITHDRAWN"] = "withdrawn";
})(LeaveStatus || (exports.LeaveStatus = LeaveStatus = {}));
var WithdrawStatus;
(function (WithdrawStatus) {
    WithdrawStatus["WITHDRAW_PENDING"] = "withdraw_pending";
    WithdrawStatus["WITHDRAW_APPROVED"] = "withdraw_approved";
    WithdrawStatus["WITHDRAW_CANCELLED"] = "withdraw_cancelled";
})(WithdrawStatus || (exports.WithdrawStatus = WithdrawStatus = {}));
let Leave = class Leave {
    id;
    employee;
    leave_type;
    start_date;
    end_date;
    duration;
    status;
    imported;
    withdraw_status;
    onehr_status;
    reason;
    approved_date;
    approver;
    created_at;
    withdraw_Request;
};
exports.Leave = Leave;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Leave.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.leaves),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], Leave.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Leave.prototype, "leave_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Leave.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Leave.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Leave.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: LeaveStatus.PENDING }),
    __metadata("design:type", String)
], Leave.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Leave.prototype, "imported", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: null }),
    __metadata("design:type", String)
], Leave.prototype, "withdraw_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Leave.prototype, "onehr_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Leave.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Leave.prototype, "approved_date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.leaves),
    (0, typeorm_1.JoinColumn)({ name: 'approver_id' }),
    __metadata("design:type", user_entity_1.User)
], Leave.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Leave.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => withdraw_entity_1.Withdraw, withdraw => withdraw.leave),
    __metadata("design:type", Array)
], Leave.prototype, "withdraw_Request", void 0);
exports.Leave = Leave = __decorate([
    (0, typeorm_1.Entity)('leaves')
], Leave);
//# sourceMappingURL=leave.entity.js.map