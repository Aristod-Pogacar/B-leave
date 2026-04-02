import { BadRequestException, Body, Controller, Delete, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CryptoService } from 'src/crypto/crypto.service';
import { EmployeeService } from 'src/employee/employee.service';
import { CreateLeaveDto } from 'src/leave/dto/create-leave.dto';
import { LeaveService } from 'src/leave/leave.service';
import { PuppeteerManagerService } from 'src/puppeteer-manager/puppeteer-manager.service';
import { PuppeteerService } from './puppeteer.service';
import * as path from 'path';

@Controller('bot')
export class PuppeteerController {
    constructor(
        private readonly manager: PuppeteerManagerService,
        private readonly bot: PuppeteerService,
        private readonly employeeService: EmployeeService,
        private readonly leaveService: LeaveService,
        private cryptoService: CryptoService
    ) { }

    @Post('session')
    async createSession() {
        console.log("CREATING SESSION")
        const sessionId = await this.manager.createSession();
        return { sessionId };
    }

    @Post(':sessionId/start')
    start(@Param('sessionId') sessionId: string, @Res() res: Response) {
        console.log("START")
        return this.bot.start(sessionId);
    }

    @Post(':sessionId/login')
    async login(@Param('sessionId') sessionId: string, @Body() body: { username: string, encryptedPassword: string }, @Res() res: Response) {
        console.log("LOGIN")
        const decryptedPassword = await this.cryptoService.decrypt(body.encryptedPassword);
        console.log(decryptedPassword);
        return this.bot.login(sessionId, body.username, decryptedPassword);
    }

    @Post(':sessionId/leave')
    goToLeave(@Param('sessionId') sessionId: string, @Res() res: Response) {
        console.log("GO TO LEAVE")
        return this.bot.goToLeave(sessionId);
    }

    @Post(':sessionId/new-leave')
    goToNewLeave(@Param('sessionId') sessionId: string, @Res() res: Response) {
        console.log("GO TO NEW LEAVE")
        return this.bot.goToNewLeave(sessionId);
    }

    @Post(':sessionId/complete-form')
    completeForm(@Param('sessionId') sessionId: string, @Body() data: CreateLeaveDto, @Res() res: Response) {
        console.log("COMPLETE FORM")
        return this.bot.completeFormulaire(sessionId, data);
    }
    // @Post(':sessionId/leave')
    // goToLeave(@Param('sessionId') sessionId: string, @Body() createLeaveDto: CreateLeaveDto) {
    //     return this.bot.goToLeave(sessionId, createLeaveDto);
    // }

    @Delete(':sessionId')
    close(@Param('sessionId') sessionId: string) {
        console.log("DELETING SESSION")
        return this.manager.closeSession(sessionId);
    }

    @Post('full-leave')
    async fullLeave(@Body() data: CreateLeaveDto, @Res() res: Response) {

        const filePath = path.join(process.cwd(), 'punch-in.png');
        console.log("FILE PATH:", filePath);

        console.log("====================================================================================")
        console.log("CREATING SESSION")

        // const available = await this.leaveService.isLeaveAvailable(
        //     data.matricule,
        //     data.start_date,
        //     data.end_date,
        // );

        // if (!available) {
        //     throw new BadRequestException('Leave dates overlap with existing leave');
        // }

        // const cumulBalance = calculateCumulBalance(parseDate(data.start_date));
        // console.log("CUMUL BALANCE:", cumulBalance);

        // const nbLeaveTaken = await this.leaveService.countEmployeeLeaveDays(data.matricule, "Local_Leave_AMD", new Date().getFullYear());

        // const nbDays = parseDate(data.end_date).getDate() - parseDate(data.start_date).getDate();

        // const nbLeaveLeft = cumulBalance - nbLeaveTaken - nbDays;

        // if (nbLeaveLeft < 0) {
        //     throw new BadRequestException('Local leave solde not enough');
        // }

        // const nbPermissionTaken = await this.leaveService.countEmployeeLeaveDays(data.matricule, "Permission_AMD", new Date().getFullYear());

        // const nbPermissionLeft = 10 - nbPermissionTaken - nbDays;

        // if (nbPermissionLeft < 0) {
        //     throw new BadRequestException('Permission solde not enough');
        // }
        // console.log("NB PERMISSION LEFT:", nbPermissionLeft);

        const employee = await this.employeeService.findOne(data.employee);
        const sessionId = await this.manager.createSession();
        // console.log("SessionID:", sessionId);
        if (employee) {
            await delay(200);
            await this.bot.start(sessionId).then(async (startingResponse) => {
                console.log("STATUS:", startingResponse.success);
                console.log("RESPONSE:", startingResponse);
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
                                                    const leave = await this.leaveService.create(data, res);
                                                    await this.manager.closeSession(sessionId);
                                                    res.status(200).json({ success: true, message: "LEAVE SAVED", leave: leave });
                                                } else {
                                                    await this.manager.closeSession(sessionId);
                                                    res.status(500).json({ success: false, message: "❌ FORM NOT COMPLETE" });
                                                }
                                            });
                                        } else {
                                            await this.manager.closeSession(sessionId);
                                            res.status(500).json({ success: false, message: "❌ NEW LEAVE NOT FOUND" });
                                        }
                                    });
                                } else {
                                    await this.manager.closeSession(sessionId);
                                    res.status(500).json({ success: false, message: "❌ LEAVE NOT FOUND" });
                                }
                            });
                        } else {
                            await this.manager.closeSession(sessionId);
                            res.status(500).json({ success: false, message: "❌ LOGIN FAILED" });
                        }
                    });
                } else {
                    await this.manager.closeSession(sessionId);
                    res.status(500).json({ success: false, message: "❌ START FAILED" });
                }
            });
        }
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
