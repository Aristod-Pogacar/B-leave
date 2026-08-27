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
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer_manager_service_1 = require("../puppeteer-manager/puppeteer-manager.service");
const puppeteer_service_1 = require("../puppeteer/puppeteer.service");
const employee_service_1 = require("../employee/employee.service");
const leave_service_1 = require("../leave/leave.service");
const crypto_service_1 = require("../crypto/crypto.service");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const employee_entity_1 = require("../employee/entities/employee.entity");
const leave_entity_1 = require("../leave/entities/leave.entity");
const history_service_1 = require("../history/history.service");
let TaskService = class TaskService {
    manager;
    bot;
    employeeService;
    leaveService;
    cryptoService;
    historyService;
    employeeRepo;
    leaveRepo;
    constructor(manager, bot, employeeService, leaveService, cryptoService, historyService, employeeRepo, leaveRepo) {
        this.manager = manager;
        this.bot = bot;
        this.employeeService = employeeService;
        this.leaveService = leaveService;
        this.cryptoService = cryptoService;
        this.historyService = historyService;
        this.employeeRepo = employeeRepo;
        this.leaveRepo = leaveRepo;
    }
    async executePendingTasks() {
        const leaves = await this.leaveService.findLeavesNotDone(10);
        var bool = true;
        leaves.forEach(async (leave) => {
            if (leave.employee && bool) {
                try {
                    bool = false;
                    const data = {
                        employee: leave.employee.matricule,
                        start_date: leave.start_date,
                        end_date: leave.end_date,
                        reason: leave.reason,
                        leave_type: leave.leave_type
                    };
                    await this.runPuppeteerTask(data, leave);
                }
                catch (error) {
                    console.error(`Leave ${leave.id} failed`, error);
                }
            }
        });
    }
    async runPuppeteerTask(data, leave) {
        const employee = await this.employeeService.findOneByMatricule(data.employee);
        if (!employee || leave.onehr_status == true)
            return;
        const sessionId = await this.manager.createSession();
        await delay(200);
        await this.bot.start(sessionId).then(async (startingResponse) => {
            if (startingResponse.success) {
                await delay(5000);
                const password = await this.cryptoService.decrypt(employee.onehr_password);
                await this.bot.login(sessionId, employee.matricule, password).then(async (loginResponse) => {
                    if (loginResponse.success == true) {
                        await delay(5000);
                        await this.bot.goToLeave(sessionId).then(async (leaveResponse) => {
                            if (leaveResponse.success == true) {
                                await delay(5000);
                                await this.bot.goToNewLeave(sessionId).then(async (newLeaveResponse) => {
                                    if (newLeaveResponse.success == true) {
                                        await delay(5000);
                                        await this.manager.closeSession(sessionId);
                                    }
                                    else {
                                        await this.manager.closeSession(sessionId);
                                    }
                                });
                            }
                            else {
                                await this.manager.closeSession(sessionId);
                            }
                        });
                    }
                    else {
                        await this.manager.closeSession(sessionId);
                    }
                });
            }
            else {
                await this.manager.closeSession(sessionId);
            }
        });
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, typeorm_2.InjectRepository)(employee_entity_1.Employee)),
    __param(7, (0, typeorm_2.InjectRepository)(leave_entity_1.Leave)),
    __metadata("design:paramtypes", [puppeteer_manager_service_1.PuppeteerManagerService,
        puppeteer_service_1.PuppeteerService,
        employee_service_1.EmployeeService,
        leave_service_1.LeaveService,
        crypto_service_1.CryptoService,
        history_service_1.HistoryService,
        typeorm_1.Repository,
        typeorm_1.Repository])
], TaskService);
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function calculateCumulBalance(date) {
    let soldeCumul = 0;
    for (let m = 0; m <= date.getMonth(); m++) {
        const daysInMonth = new Date(date.getFullYear(), m + 1, 0).getDate();
        if (m === date.getMonth()) {
            soldeCumul += (2.5 / daysInMonth) * date.getDate();
        }
        else {
            soldeCumul += 2.5;
        }
    }
    return soldeCumul;
}
function parseDate(dateStr) {
    const [month, day, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}
//# sourceMappingURL=task.service.js.map