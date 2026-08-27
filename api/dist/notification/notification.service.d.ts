import { Repository } from "typeorm";
import { Notification } from "./entities/notification.entity";
export declare class NotificationService {
    private repo;
    constructor(repo: Repository<Notification>);
    create(data: Partial<Notification>): Promise<Notification>;
    findOne(id: string): Promise<Notification | null>;
    markAsRead(notificationId: string): Promise<Notification>;
    getNotifications(userId: string): Promise<[Notification[], number]>;
    getUnreadNotifications(userId: string): Promise<[Notification[], number]>;
    getNotificationsCount(userId: string): Promise<number>;
}
