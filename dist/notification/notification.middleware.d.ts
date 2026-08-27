import { NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import { NotificationService } from "./notification.service";
export declare class NotificationMiddleware implements NestMiddleware {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    use(req: any, res: any, next: NextFunction): Promise<void>;
}
