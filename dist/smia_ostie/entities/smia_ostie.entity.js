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
exports.SmiaOstie = void 0;
const employee_entity_1 = require("../../employee/entities/employee.entity");
const typeorm_1 = require("typeorm");
let SmiaOstie = class SmiaOstie {
    id;
    date_at;
    date;
    reason;
    status;
    employee;
};
exports.SmiaOstie = SmiaOstie;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SmiaOstie.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'datetime',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], SmiaOstie.prototype, "date_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'datetime',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], SmiaOstie.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        nullable: true,
    }),
    __metadata("design:type", String)
], SmiaOstie.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        nullable: true,
        default: 'normal',
    }),
    __metadata("design:type", String)
], SmiaOstie.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, (employee) => employee.smia_ostie, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_matricule', referencedColumnName: 'matricule' }),
    __metadata("design:type", employee_entity_1.Employee)
], SmiaOstie.prototype, "employee", void 0);
exports.SmiaOstie = SmiaOstie = __decorate([
    (0, typeorm_1.Entity)('smia_ostie')
], SmiaOstie);
//# sourceMappingURL=smia_ostie.entity.js.map