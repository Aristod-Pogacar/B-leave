import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { TaskService } from './task.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { Repository } from 'typeorm';
import { Leave } from '../leave/entities/leave.entity';
import { LeaveService } from '../leave/leave.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { EmployeeService } from '../employee/employee.service';
import { NotificationService } from '../notification/notification.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class TaskScheduler {

  private i = 0;

  constructor(
    private readonly leaveService: LeaveService,
    private readonly taskService: TaskService,
    private readonly userService: UserService,
    private readonly employeeService: EmployeeService,
    private readonly notificationService: NotificationService,
    private readonly mailerService: MailerService,
    // @InjectRepository(Employee)
    // private readonly employeeRepo: Repository<Employee>,
    // @InjectRepository(Leave)
    // private readonly leaveRepo: Repository<Leave>,
  ) { }

  // @Cron('0 0 16 * * *') // tous les jours à 16h
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
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

    await this.taskService.executePendingTasks();
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  // @Cron('0 0 16 * * *') // tous les jours à 16h
  async dailyReminder() {
    console.log("====================DAILY REMINDER=================");
    const allUsers = await this.userService.findAll();
    allUsers.forEach(async (user) => {
      const leaves = await this.leaveService.getNonApprouvedLeaves(user)
      if (leaves.length > 0) {
        await this.notificationService.create({
          title: 'ACTION REQUIRED',
          message: `You have ${leaves.length} pending leave request(s) awaiting your review. Please click here to check them.`,
          url: '/leave/approuve-leaves',
          recipient: user
        })
        if (user.email && user.email !== "" && user.email !== undefined && user.email !== null) {
          console.log("RECEIPIENT:", user.email)
          //                   await this.mailerService.sendMail({
          //                       to: user.email,
          //                       cc: 'stagedp@aquarabe.mg',
          //                       subject: `Pending Leave Requests Reminder (${leaves.length})`,
          //                       text: `Dear ${user?.employee?.firstname} ${user.employee?.name}, You have ${leaves.length} pending leave request(s) waiting for your review. Please log in to the portal to process them. Best regards, HR Team`,
          //                       html: `
          //   <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
          //     <p>
          //       Dear <strong>${user?.employee?.firstname + " " + user?.employee?.name}</strong>,
          //     </p>
          //     <p>
          //       This is a friendly reminder that you have <strong>${leaves.length} pending leave request(s)</strong> requiring your approval.
          //     </p>
          //     <p>
          //       Please log in to the portal at your earliest convenience to review and action these requests.
          //     </p>
          //     <div style="margin: 20px 0;">
          //       <a href="'/leave/approuve-leaves'" style="background-color: #0056b3; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
          //         Review Pending Requests
          //       </a>
          //     </div>
          //     <p>
          //       Best regards,<br>
          //       <strong>HR Team</strong>
          //     </p>
          //   </div>
          // `,
          //                   });

          console.log("PENDING LEAVES:", leaves.length)
        }
      }

    })
  }

}