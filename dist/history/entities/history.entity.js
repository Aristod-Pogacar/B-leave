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
exports.History = exports.HistoryReason = void 0;
const typeorm_1 = require("typeorm");
var HistoryReason;
(function (HistoryReason) {
    HistoryReason["LEAVE"] = "Leave";
    HistoryReason["PERMISSION_2H"] = "Permission 2h";
    HistoryReason["CONSULTATION_MEDICAL"] = "Consultation medicale";
    HistoryReason["MEDICAL_SERVICE"] = "Medical service";
    HistoryReason["EMPLOYEE"] = "Employee";
    HistoryReason["MANAGER"] = "Manager";
    HistoryReason["USER"] = "User";
    HistoryReason["HOLIDAY"] = "Holiday";
    HistoryReason["WITHDRAW"] = "Withdraw";
})(HistoryReason || (exports.HistoryReason = HistoryReason = {}));
let History = class History {
    id;
    date_at;
    reason;
    message;
    created_by;
};
exports.History = History;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], History.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'datetime',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], History.prototype, "date_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], History.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], History.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], History.prototype, "created_by", void 0);
exports.History = History = __decorate([
    (0, typeorm_1.Entity)('history')
], History);
//# sourceMappingURL=history.entity.js.map