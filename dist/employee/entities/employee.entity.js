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
exports.Employee = void 0;
const employee_history_entity_1 = require("../../employee-history/entities/employee-history.entity");
const leave_entity_1 = require("../../leave/entities/leave.entity");
const permission2h_entity_1 = require("../../permission2h/entities/permission2h.entity");
const smia_ostie_entity_1 = require("../../smia_ostie/entities/smia_ostie.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const typeorm_1 = require("typeorm");
const carried_forward_entity_1 = require("../../carried-forward/entities/carried-forward.entity");
let Employee = class Employee {
    id;
    departement;
    section;
    line;
    matricule;
    gender;
    DOE;
    DOR;
    division;
    name;
    firstname;
    job_level;
    designation;
    site;
    type;
    is_deleted;
    is_active;
    leaves;
    permission2h;
    smia_ostie;
    manager;
    app_password;
    onehr_password;
    histories;
    fingerprintId;
    deviceId;
    user;
    subordinates;
    carriedForwards;
};
exports.Employee = Employee;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Employee.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "departement", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "line", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Employee.prototype, "matricule", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Employee.prototype, "DOE", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Employee.prototype, "DOR", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "division", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "firstname", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "job_level", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "designation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "site", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "is_deleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Employee.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leave_entity_1.Leave, leave => leave.employee, { onDelete: 'NO ACTION' }),
    __metadata("design:type", Array)
], Employee.prototype, "leaves", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => permission2h_entity_1.Permission2h, permission2h => permission2h.employee, { onDelete: 'NO ACTION' }),
    __metadata("design:type", Array)
], Employee.prototype, "permission2h", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => smia_ostie_entity_1.SmiaOstie, smia_ostie => smia_ostie.employee, { onDelete: 'NO ACTION' }),
    __metadata("design:type", Array)
], Employee.prototype, "smia_ostie", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => Employee, manager => manager.subordinates, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", Object)
], Employee.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "app_password", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "onehr_password", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employee_history_entity_1.EmployeeHistory, employeeHistory => employeeHistory.employee, { onDelete: 'NO ACTION' }),
    __metadata("design:type", Array)
], Employee.prototype, "histories", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, unique: true }),
    __metadata("design:type", Object)
], Employee.prototype, "fingerprintId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Employee.prototype, "deviceId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.employee, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", user_entity_1.User)
], Employee.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Employee, employee => employee.manager),
    __metadata("design:type", Array)
], Employee.prototype, "subordinates", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => carried_forward_entity_1.CarriedForward, (carriedForward) => carriedForward.employee),
    __metadata("design:type", Array)
], Employee.prototype, "carriedForwards", void 0);
exports.Employee = Employee = __decorate([
    (0, typeorm_1.Entity)('employees')
], Employee);
//# sourceMappingURL=employee.entity.js.map