import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "./entities/notification.entity";

@Injectable()
export class NotificationService {

  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) { }

  async create(data: Partial<Notification>) {

    const notification = this.repo.create(data);

    return this.repo.save(notification);

  }

  async findOne(id: string) {
    return await this.repo.findOne({
      where: { id },
    });
  }

  async markAsRead(notificationId: string) {
    const notification = await this.repo.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;

    return await this.repo.save(notification);
  }

  async getNotifications(userId: string): Promise<[Notification[], number]> {
    return await this.repo.findAndCount({
      where: { recipient: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 5,
    });
  }

  async getUnreadNotifications(userId: string): Promise<[Notification[], number]> {
    return await this.repo.findAndCount({
      where: { recipient: { id: userId }, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  async getNotificationsCount(userId: string): Promise<number> {
    return await this.repo.count({
      where: { recipient: { id: userId }, isRead: false },
    });
  }

}