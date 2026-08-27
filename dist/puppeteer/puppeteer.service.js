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
exports.PuppeteerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const employee_entity_1 = require("../employee/entities/employee.entity");
const function_1 = require("../function/function");
const leave_entity_1 = require("../leave/entities/leave.entity");
const puppeteer_manager_service_1 = require("../puppeteer-manager/puppeteer-manager.service");
const typeorm_2 = require("typeorm");
const path = __importStar(require("path"));
const leaveTypeLocation = {
    Indisponibilite_AMD: { x: 140, y: 300 },
    Local_Leave_AMD: { x: 140, y: 340 },
    Permission_AMD: { x: 140, y: 420 },
};
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
let PuppeteerService = class PuppeteerService {
    employeeRepo;
    leaveRepo;
    config;
    manager;
    constructor(employeeRepo, leaveRepo, config, manager) {
        this.employeeRepo = employeeRepo;
        this.leaveRepo = leaveRepo;
        this.config = config;
        this.manager = manager;
    }
    async start(sessionId) {
        try {
            const { page } = this.manager.getSession(sessionId);
            await page.goto(this.config.get('LOGIN_URL') || "", { timeout: 200000 });
            const result = { success: true };
            console.log("RESULTS:", result);
            return result;
        }
        catch (error) {
            const result = { success: false };
            console.log("ERROR:", error);
            return result;
        }
    }
    async login(sessionId, username, password) {
        const session = this.manager.getSession(sessionId);
        try {
            await session.page.goto(this.config.get('LOGIN_URL') || "", { waitUntil: "domcontentloaded" });
            console.log("🔗 Ouverture du site...");
            console.log("✏️ Remplissage du formulaire...");
            console.log("USERNAME:", username);
            console.log("PASSWORD:", password);
            await session.page.$eval('#loginForm\\:username12', (el) => el.value = '');
            await session.page.type("#loginForm\\:username12", username, { delay: 80 });
            await session.page.type("#loginForm\\:password", password, { delay: 80 });
            console.log("🚀 Connexion...");
            await Promise.all([
                session.page.click("#loginForm\\:loginButton"),
                session.page.waitForNavigation({ waitUntil: "domcontentloaded" }),
            ]);
            const targetUrl = 'https://cieltextile.peoplestrong.com/oneweb/#/home';
            await session.page.waitForFunction((url) => window.location.href.includes(url), { timeout: 120000 }, targetUrl);
            session.state = 'LOGGED';
            console.log("✅ Connecté avec succès !");
            const result = { success: true };
            console.log("RESULTS:", result);
            return result;
        }
        catch (error) {
            const result = { success: false };
            console.log("ERROR:", error);
            return result;
        }
    }
    async goToLeave(sessionId) {
        const session = this.manager.getSession(sessionId);
        const newPagePromise = new Promise(resolve => session.page.browser().once('targetcreated', async (target) => {
            const newPage = await target.page();
            resolve(newPage);
        }));
        await session.page.mouse.click(340, 460);
        await delay(500);
        const newPage = await newPagePromise;
        const targetUrl = '#/timepay/ltadetail';
        await newPage.waitForFunction((url) => window.location.href.includes(url), { timeout: 200000 }, targetUrl);
        console.log("Page Leave");
        session.newPage = newPage;
        session.state = 'LEAVE';
        const result = { success: true };
        console.log("RESULTS:", result);
        return result;
    }
    async goToNewLeave(sessionId) {
        const session = this.manager.getSession(sessionId);
        if (!session.newPage) {
            throw new Error("newPage non initialisée");
        }
        await session.newPage.waitForSelector('button.btn.btn-default', { visible: true });
        await session.newPage.evaluate(() => {
            const btn = [...document.querySelectorAll('button.btn.btn-default')]
                .find(b => b.textContent.trim() === 'New Leave');
            if (btn) {
                btn.click();
            }
            ;
        });
        const result = { success: true };
        console.log("RESULTS:", result);
        return result;
    }
    async completeFormulaire(sessionId, data) {
        const session = this.manager.getSession(sessionId);
        const leaveLocation = leaveTypeLocation[data.leave_type];
        await delay(2000);
        if (!session.newPage) {
            throw new Error("newPage non initialisée");
        }
        await session.newPage.waitForSelector('input[placeholder="Comment"]', { visible: true });
        await session.newPage.evaluate(() => {
            const el = document.querySelector('input[placeholder="Comment"]');
            el.value = "";
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        console.log('comment =', data.reason, [typeof data.reason]);
        await session.newPage.type('input[placeholder="Comment"]', String(data.reason ?? ''), { delay: 100 });
        await delay(2000);
        await session.newPage.mouse.click(160, 240);
        await delay(2000);
        await session.newPage.mouse.click(leaveLocation.x, leaveLocation.y);
        await delay(2000);
        console.log("STARTING DATE NOW !!!");
        await (0, function_1.setDate)(session.newPage, "#startDate", "" + (data.start_date.getMonth() + 1) + "/" + data.start_date.getDate() + "/" + data.start_date.getFullYear());
        await delay(2000);
        console.log("ENDING DATE NOW !!!");
        await (0, function_1.setDate)(session.newPage, "#endDate", "" + (data.end_date.getMonth() + 1) + "/" + data.end_date.getDate() + "/" + data.end_date.getFullYear());
        await delay(4000);
        const fileInputs = await session.newPage.$$('input[type="file"]');
        console.log("Nombre de champs file trouvés:", fileInputs.length);
        if (fileInputs.length === 0) {
            throw new Error("Aucun champ file détecté");
        }
        const filePath = path.join(process.cwd(), 'punch-in.png');
        console.log("FILE PATH:", filePath);
        await fileInputs[0].uploadFile(filePath);
        await delay(4000);
        console.log("✅ Bouton 'New Leave' cliqué");
        const result = { success: true };
        console.log("RESULTS:", result);
        return result;
    }
};
exports.PuppeteerService = PuppeteerService;
exports.PuppeteerService = PuppeteerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(leave_entity_1.Leave)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        puppeteer_manager_service_1.PuppeteerManagerService])
], PuppeteerService);
//# sourceMappingURL=puppeteer.service.js.map