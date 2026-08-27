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
exports.NotificationMiddleware = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
let NotificationMiddleware = class NotificationMiddleware {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async use(req, res, next) {
        if (req.session.user) {
            const [notifications] = await this.notificationService.getNotifications(req.session.user.id);
            const [, count] = await this.notificationService.getUnreadNotifications(req.session.user.id);
            res.locals.notifications = notifications;
            res.locals.notificationCount = count;
        }
        next();
    }
};
exports.NotificationMiddleware = NotificationMiddleware;
exports.NotificationMiddleware = NotificationMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationMiddleware);
//# sourceMappingURL=notification.middleware.js.map