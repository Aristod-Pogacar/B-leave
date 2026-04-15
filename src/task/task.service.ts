import { Injectable } from "@nestjs/common";
import { PuppeteerManagerService } from "src/puppeteer-manager/puppeteer-manager.service";
import { PuppeteerService } from "src/puppeteer/puppeteer.service";
import { EmployeeService } from "src/employee/employee.service";
import { LeaveService } from "src/leave/leave.service";
import { CryptoService } from "src/crypto/crypto.service";
import { CreateLeaveDto } from "src/leave/dto/create-leave.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Employee } from "src/employee/entities/employee.entity";
import { Leave } from "src/leave/entities/leave.entity";
import { HistoryService } from "src/history/history.service";
import { HistoryReason } from "src/history/entities/history.entity";

@Injectable()
export class TaskService {

  constructor(
    private readonly manager: PuppeteerManagerService,
    private readonly bot: PuppeteerService,
    private readonly employeeService: EmployeeService,
    private readonly leaveService: LeaveService,
    private cryptoService: CryptoService,
    private readonly historyService: HistoryService,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Leave)
    private readonly leaveRepo: Repository<Leave>,

  ) { }

  async executePendingTasks() {

    const leaves = await this.leaveService.findLeavesNotDone(10);
    var bool = true;

    leaves.forEach(async (leave) => {
      if (leave.employee && bool) {
        try {
          bool = false;

          const data: CreateLeaveDto = {
            employee: leave.employee.matricule,
            start_date: leave.start_date,
            end_date: leave.end_date,
            reason: leave.reason,
            // attach_file: leave.attach_file,
            leave_type: leave.leave_type
          }

          await this.runPuppeteerTask(data, leave);

        } catch (error) {

          console.error(`Leave ${leave.id} failed`, error);

        }
      }
    });
  }

  async runPuppeteerTask(data: CreateLeaveDto, leave: Leave) {
    const employee = await this.employeeService.findOne(data.employee);
    if (!employee) {
      return;
    }
    const sessionId = await this.manager.createSession();
    console.log("SessionID:", sessionId);
    await delay(200);
    await this.bot.start(sessionId).then(async (startingResponse) => {
      console.log("STATUS:", startingResponse.success);
      // console.log("RESPONSE:", startingResponse);
      if (startingResponse.success) {
        await delay(5000);
        const password = await this.cryptoService.decrypt(employee.onehr_password);
        await this.bot.login(sessionId, employee.matricule, password).then(async (loginResponse) => {
          if (loginResponse.success == true) {
            await delay(5000);
            await this.bot.goToLeave(sessionId).then(async (leaveResponse) => {
              if (leaveResponse.success == true) {
                await delay(5000);
                await this.bot.goToNewLeave(sessionId).then(async (newLeaveResponse) => {
                  if (newLeaveResponse.success == true) {
                    await delay(5000);
                    await this.bot.completeFormulaire(sessionId, data).then(async (completeFormResponse) => {
                      if (completeFormResponse.success == true) {
                        console.log("✅ FORM COMPLETE");
                        await delay(5000);
                        await this.leaveService.doneLeave(leave);
                        await this.historyService.create({
                          reason: HistoryReason.LEAVE,
                          message: "New leave " + leave.start_date + " to " + leave.end_date + " of " + leave.employee.fullname + " send to OneHR by AUTOMATION PUPPETEER",
                        });
                        // await this.leaveService.save(data);
                        await this.manager.closeSession(sessionId);
                        // res.status(200).json({ success: true, message: "FORM COMPLETE" });
                      } else {
                        await this.manager.closeSession(sessionId);
                        // res.status(500).json({ success: false, message: "❌ FORM NOT COMPLETE" });
                      }
                    });
                  } else {
                    await this.manager.closeSession(sessionId);
                    // res.status(500).json({ success: false, message: "❌ NEW LEAVE NOT FOUND" });
                  }
                });
              } else {
                await this.manager.closeSession(sessionId);
                // res.status(500).json({ success: false, message: "❌ LEAVE NOT FOUND" });
              }
            });
          } else {
            await this.manager.closeSession(sessionId);
            // res.status(500).json({ success: false, message: "❌ LOGIN FAILED" });
          }
        });
      } else {
        await this.manager.closeSession(sessionId);
        // res.status(500).json({ success: false, message: "❌ START FAILED" });
      }
    });
    // ici ta logique Puppeteer
  }

}


function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateCumulBalance(date: Date) {
  let soldeCumul = 0;
  for (let m = 0; m <= date.getMonth(); m++) {
    const daysInMonth = new Date(date.getFullYear(), m + 1, 0).getDate();

    if (m === date.getMonth()) {
      soldeCumul += (2.5 / daysInMonth) * date.getDate();
    } else {
      soldeCumul += 2.5;
    }
  }
  return soldeCumul;
}

function parseDate(dateStr: string): Date {
  const [month, day, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}
