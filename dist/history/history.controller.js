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
exports.HistoryController = void 0;
const common_1 = require("@nestjs/common");
const history_service_1 = require("./history.service");
const role_guard_1 = require("../user/role.guard");
const role_decorator_1 = require("../user/role.decorator");
const user_entity_1 = require("../user/entities/user.entity");
let HistoryController = class HistoryController {
    historyService;
    constructor(historyService) {
        this.historyService = historyService;
    }
    async bLeaveHistory(req, search = '', page = 1, startDate = new Date().toISOString().split('T')[0], endDate = new Date().toISOString().split('T')[0]) {
        const limit = 20;
        const { data, total, totalPages } = await this.historyService.paginate(search, Number(page), limit, startDate, endDate);
        ;
        const currentPage = Number(page);
        const maxButtons = 7;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        return {
            title: "B-Leave History",
            histories: data,
            total,
            totalPages,
            currentPage,
            startPage,
            endPage,
            search,
            startDate,
            endDate,
        };
    }
};
exports.HistoryController = HistoryController;
__decorate([
    (0, common_1.Get)('b-leave-history'),
    (0, common_1.Render)('b-leave-history'),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, role_decorator_1.Roles)(user_entity_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, String, String]),
    __metadata("design:returntype", Promise)
], HistoryController.prototype, "bLeaveHistory", null);
exports.HistoryController = HistoryController = __decorate([
    (0, common_1.Controller)('history'),
    __metadata("design:paramtypes", [history_service_1.HistoryService])
], HistoryController);
//# sourceMappingURL=history.controller.js.map