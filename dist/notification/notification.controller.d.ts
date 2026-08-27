import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    create(createNotificationDto: CreateNotificationDto): Promise<import("./entities/notification.entity").Notification>;
    markAsRead(id: string): Promise<import("./entities/notification.entity").Notification>;
    markAllAsRead(req: any, res: any): Promise<any>;
    redirect(id: string, res: any): Promise<any>;
}
