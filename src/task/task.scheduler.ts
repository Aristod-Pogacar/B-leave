import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { TaskService } from './task.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import { Repository } from 'typeorm';
import { Leave } from 'src/leave/entities/leave.entity';
import { LeaveService } from 'src/leave/leave.service';

@Injectable()
export class TaskScheduler {

    private i = 0;

    constructor(
        private readonly leaveService: LeaveService,
        private readonly taskService: TaskService,
        @InjectRepository(Employee)
        private readonly employeeRepo: Repository<Employee>,
        @InjectRepository(Leave)
        private readonly leaveRepo: Repository<Leave>,
    ) { }

    // @Cron('0 0 16 * * *') // tous les jours à 16h
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    // @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_9AM_AND_6PM)"0 */30 9-18 * * *"
    // @Interval(10000)
    async runTasks() {
        console.log("TEST Scheduling");
        const leaves = await this.leaveService.findLeavesNotDone(10);
        leaves.forEach(async (leave) => {
            if (leave.employee) {
                console.log(leave.employee.matricule);
            }
        });
        // const leaves = await this.leaveService.findLeavesNotDone();
        // console.log(this.i++, "NEW TEST SCHEDULING");

        await this.taskService.executePendingTasks();
    }

}