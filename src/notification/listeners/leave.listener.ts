import { Injectable } from "@nestjs/common";
import { Leave } from "src/leave/entities/leave.entity";
import { Repository } from "typeorm";
import { NotificationService } from "../notification.service";
import { LeaveCreatedEvent } from "../events/leave-created.event";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class LeaveListener {

    constructor(
        @InjectRepository(Leave)
        private readonly leaveRepository: Repository<Leave>,
        private readonly notificationService: NotificationService,
    ) { }

    @OnEvent('leave.created')
    async handleLeaveCreated(event: LeaveCreatedEvent) {

        const leave = await this.leaveRepository.findOne({
            where: {
                id: event.leaveId,
            },
            relations: [
                'employee',
                'employee.manager',
                'employee.manager.user'
            ]
        });

        if (!leave)
            return;

        const manager = leave.employee.manager?.user;

        if (!manager)
            return;

        await this.notificationService.create({

            recipient: manager,

            title: "New leave request",

            message:
                `${leave.employee.name} ${leave.employee.firstname} has requested a leave.`,

            url: `/leave/approuve-leaves`,

        });

    }

}