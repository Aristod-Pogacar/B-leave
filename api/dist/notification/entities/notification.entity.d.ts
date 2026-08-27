import { User } from "../../user/entities/user.entity";
export declare class Notification {
    id: string;
    recipient: User;
    title: string;
    message: string;
    isRead: boolean;
    url: string;
    icon: string;
    createdAt: Date;
}
