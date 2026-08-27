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
exports.Withdraw = exports.WithdrawStatus = void 0;
const leave_entity_1 = require("../../leave/entities/leave.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const typeorm_1 = require("typeorm");
var WithdrawStatus;
(function (WithdrawStatus) {
    WithdrawStatus["WITHDRAW_PENDING"] = "withdraw_pending";
    WithdrawStatus["WITHDRAW_APPROVED"] = "withdraw_approved";
    WithdrawStatus["WITHDRAW_REJECTED"] = "withdraw_rejected";
})(WithdrawStatus || (exports.WithdrawStatus = WithdrawStatus = {}));
let Withdraw = class Withdraw {
    id;
    leave;
    status;
    onehr_status;
    approved_date;
    approver;
    created_at;
};
exports.Withdraw = Withdraw;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Withdraw.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => leave_entity_1.Leave, leave => leave.withdraw_Request, { onDelete: 'CASCADE', onUpdate: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'leave_id' }),
    __metadata("design:type", leave_entity_1.Leave)
], Withdraw.prototype, "leave", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: WithdrawStatus.WITHDRAW_PENDING }),
    __metadata("design:type", String)
], Withdraw.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Withdraw.prototype, "onehr_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Withdraw.prototype, "approved_date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.withdrawn, { onDelete: 'CASCADE', onUpdate: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'approver_id' }),
    __metadata("design:type", user_entity_1.User)
], Withdraw.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Withdraw.prototype, "created_at", void 0);
exports.Withdraw = Withdraw = __decorate([
    (0, typeorm_1.Entity)()
], Withdraw);
//# sourceMappingURL=withdraw.entity.js.map