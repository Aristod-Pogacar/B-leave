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

}