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
exports.PuppeteerController = void 0;
const common_1 = require("@nestjs/common");
const crypto_service_1 = require("../crypto/crypto.service");
const employee_service_1 = require("../employee/employee.service");
const create_leave_dto_1 = require("../leave/dto/create-leave.dto");
const leave_service_1 = require("../leave/leave.service");
const puppeteer_manager_service_1 = require("../puppeteer-manager/puppeteer-manager.service");
const puppeteer_service_1 = require("./puppeteer.service");
const path = __importStar(require("path"));
let PuppeteerController = class PuppeteerController {
    manager;
    bot;
    employeeService;
    leaveService;
    cryptoService;
    constructor(manager, bot, employeeService, leaveService, cryptoService) {
        this.manager = manager;
        this.bot = bot;
        this.employeeService = employeeService;
        this.leaveService = leaveService;
        this.cryptoService = cryptoService;
    }
    async createSession() {
        console.log("CREATING SESSION");
        const sessionId = await this.manager.createSession();
        return { sessionId };
    }
    start(sessionId, res) {
        console.log("START");
        return this.bot.start(sessionId);
    }
    async login(sessionId, body, res) {
        console.log("LOGIN");
        const decryptedPassword = await this.cryptoService.decrypt(body.encryptedPassword);
        console.log(decryptedPassword);
        return this.bot.login(sessionId, body.username, decryptedPassword);
    }
    goToLeave(sessionId, res) {
        console.log("GO TO LEAVE");
        return this.bot.goToLeave(sessionId);
    }
    goToNewLeave(sessionId, res) {
        console.log("GO TO NEW LEAVE");
        return this.bot.goToNewLeave(sessionId);
    }
    completeForm(sessionId, data, res) {
        console.log("COMPLETE FORM");
        return this.bot.completeFormulaire(sessionId, data);
    }
    close(sessionId) {
        console.log("DELETING SESSION");
        return this.manager.closeSession(sessionId);
    }
    async fullLeave(data, res) {
        const filePath = path.join(process.cwd(), 'punch-in.png');
        console.log("FILE PATH:", filePath);
        console.log("====================================================================================");
        console.log("CREATING SESSION");
        const employee = await this.employeeService.findOne(data.employee);
        const sessionId = await this.manager.createSession();
        if (employee) {
            await delay(200);
            await this.bot.start(sessionId).then(async (startingResponse) => {
                console.log("STATUS:", startingResponse.success);
                console.log("RESPONSE:", startingResponse);
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
                                            await this.bot.completeFormulaire(sessionId, data).then(async (completeFormResponse) => {
                                                if (completeFormResponse.success == true) {
                                                    console.log("✅ FORM COMPLETE");
                                                    await delay(5000);
                                                    const leave = await this.leaveService.create(data, res, { session: { user: { name: "PUPPETEER", firstName: "AUTOMATION" } } });
                                                    await this.manager.closeSession(sessionId);
                                                    res.status(200).json({ success: true, message: "LEAVE SAVED", leave: leave });
                                                }
                                                else {
                                                    await this.manager.closeSession(sessionId);
                                                    res.status(500).json({ success: false, message: "❌ FORM NOT COMPLETE" });
                                                }
                                            });
                                        }
                                        else {
                                            await this.manager.closeSession(sessionId);
                                            res.status(500).json({ success: false, message: "❌ NEW LEAVE NOT FOUND" });
                                        }
                                    });
                                }
                                else {
                                    await this.manager.closeSession(sessionId);
                                    res.status(500).json({ success: false, message: "❌ LEAVE NOT FOUND" });
                                }
                            });
                        }
                        else {
                            await this.manager.closeSession(sessionId);
                            res.status(500).json({ success: false, message: "❌ LOGIN FAILED" });
                        }
                    });
                }
                else {
                    await this.manager.closeSession(sessionId);
                    res.status(500).json({ success: false, message: "❌ START FAILED" });
                }
            });
        }
    }
};
exports.PuppeteerController = PuppeteerController;
__decorate([
    (0, common_1.Post)('session'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PuppeteerController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)(':sessionId/start'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PuppeteerController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':sessionId/login'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PuppeteerController.prototype, "login", null);
__decorate([
    (0, common_1.Post)(':sessionId/leave'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PuppeteerController.prototype, "goToLeave", null);
__decorate([
    (0, common_1.Post)(':sessionId/new-leave'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PuppeteerController.prototype, "goToNewLeave", null);
__decorate([
    (0, common_1.Post)(':sessionId/complete-form'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_leave_dto_1.CreateLeaveDto, Object]),
    __metadata("design:returntype", void 0)
], PuppeteerController.prototype, "completeForm", null);
__decorate([
    (0, common_1.Delete)(':sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PuppeteerController.prototype, "close", null);
__decorate([
    (0, common_1.Post)('full-leave'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leave_dto_1.CreateLeaveDto, Object]),
    __metadata("design:returntype", Promise)
], PuppeteerController.prototype, "fullLeave", null);
exports.PuppeteerController = PuppeteerController = __decorate([
    (0, common_1.Controller)('bot'),
    __metadata("design:paramtypes", [puppeteer_manager_service_1.PuppeteerManagerService,
        puppeteer_service_1.PuppeteerService,
        employee_service_1.EmployeeService,
        leave_service_1.LeaveService,
        crypto_service_1.CryptoService])
], PuppeteerController);
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
//# sourceMappingURL=puppeteer.controller.js.map