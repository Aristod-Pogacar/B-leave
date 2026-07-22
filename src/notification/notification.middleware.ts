import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response, Request } from "express";
import { NotificationService } from "./notification.service";

@Injectable()
export class NotificationMiddleware implements NestMiddleware {
    constructor(
        private readonly notificationService: NotificationService,
    ) { }

    async use(req: any, res: any, next: NextFunction) {
        if (req.session.user) {
            const [notifications] =
                await this.notificationService.getNotifications(req.session.user.id);

            const [, count] =
                await this.notificationService.getUnreadNotifications(req.session.user.id);

            res.locals.notifications = notifications;
            res.locals.notificationCount = count;
        }

        next();
    }
}