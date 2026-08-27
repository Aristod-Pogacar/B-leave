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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskScheduler = void 0;
const common_1 = require("@nestjs/common");
const task_service_1 = require("./task.service");
const typeorm_1 = require("@nestjs/typeorm");
const employee_entity_1 = require("../employee/entities/employee.entity");
const typeorm_2 = require("typeorm");
const leave_entity_1 = require("../leave/entities/leave.entity");
const leave_service_1 = require("../leave/leave.service");
let TaskScheduler = class TaskScheduler {
    leaveService;
    taskService;
    employeeRepo;
    leaveRepo;
    i = 0;
    constructor(leaveService, taskService, employeeRepo, leaveRepo) {
        this.leaveService = leaveService;
        this.taskService = taskService;
        this.employeeRepo = employeeRepo;
        this.leaveRepo = leaveRepo;
    }
    async runTasks() {
        console.log("TEST Scheduling");
        const leaves = await this.leaveService.findLeavesNotDone(10);
        leaves.forEach(async (leave) => {
            if (leave.employee) {
                console.log(leave.employee.matricule);
            }
        });
        await this.taskService.executePendingTasks();
    }
};
exports.TaskScheduler = TaskScheduler;
exports.TaskScheduler = TaskScheduler = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(3, (0, typeorm_1.InjectRepository)(leave_entity_1.Leave)),
    __metadata("design:paramtypes", [leave_service_1.LeaveService,
        task_service_1.TaskService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TaskScheduler);
//# sourceMappingURL=task.scheduler.js.map