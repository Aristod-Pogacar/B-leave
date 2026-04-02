import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Page } from "puppeteer";
import { Employee } from 'src/employee/entities/employee.entity';
import { setDate } from 'src/function/function';
import { CreateLeaveDto } from 'src/leave/dto/create-leave.dto';
import { Leave } from 'src/leave/entities/leave.entity';
// import * as puppeteer from 'puppeteer';
import { Response } from 'express';
import { PuppeteerManagerService } from 'src/puppeteer-manager/puppeteer-manager.service';
import { Repository } from 'typeorm';
import * as path from 'path';

const leaveTypeLocation = {
    Indisponibilite_AMD: { x: 140, y: 300 },
    Local_Leave_AMD: { x: 140, y: 340 },
    Permission_AMD: { x: 140, y: 420 },
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

@Injectable()
export class PuppeteerService {
    constructor(
        @InjectRepository(Employee)
        private readonly employeeRepo: Repository<Employee>,
        @InjectRepository(Leave)
        private leaveRepo: Repository<Leave>,
        private readonly config: ConfigService,
        private readonly manager: PuppeteerManagerService
    ) { }

    async start(sessionId: string) {
        try {
            const { page } = this.manager.getSession(sessionId);
            await page.goto(this.config.get<string>('LOGIN_URL') || "", { timeout: 200000 });
            const result = { success: true }
            console.log("RESULTS:", result);
            return result
            // return res.status(200).json(result)
        } catch (error) {
            const result = { success: false }
            console.log("ERROR:", error);
            return result
            // return res.status(500).json(result)
        }
    }

    async login(sessionId: string, username: string, password: string) {
        const session = this.manager.getSession(sessionId);

        try {
            await session.page.goto(this.config.get<string>('LOGIN_URL') || "", { waitUntil: "domcontentloaded" });

            console.log("🔗 Ouverture du site...");

            // Remplir le formulaire de connexion
            console.log("✏️ Remplissage du formulaire...");
            console.log("USERNAME:", username);
            console.log("PASSWORD:", password);

            await session.page.$eval('#loginForm\\:username12', (el: HTMLInputElement) => el.value = '');
            await session.page.type("#loginForm\\:username12", username, { delay: 80 });
            await session.page.type("#loginForm\\:password", password, { delay: 80 });

            // Cliquer sur le bouton Login
            console.log("🚀 Connexion...");
            await Promise.all([
                session.page.click("#loginForm\\:loginButton"),
                session.page.waitForNavigation({ waitUntil: "domcontentloaded" }),
            ]);
            const targetUrl = 'https://cieltextile.peoplestrong.com/oneweb/#/home';

            await session.page.waitForFunction(
                (url) => window.location.href.includes(url),
                { timeout: 120000 },
                targetUrl
            );

            session.state = 'LOGGED';
            console.log("✅ Connecté avec succès !");
            const result = { success: true }
            console.log("RESULTS:", result);
            return result;
            // return res.status(200).json(result);
            // session.page.on('framenavigated', frame => {
            //     if (frame === session.page.mainFrame()) {
            //         // console.log('Nouvelle URL:', frame.url());
            //         const url = frame.url();
            //         if (url.includes("https://cieltextile.peoplestrong.com/oneweb/#/home")) {
            //             console.log('Nouvelle URL:', frame.url());
            //             session.state = 'LOGGED';
            //             console.log("✅ Connecté avec succès !");
            //             return { success: true }
            //         }
            //     }
            // });

        } catch (error) {
            const result = { success: false }
            console.log("ERROR:", error);
            return result;
            // return res.status(500).json(result)
        }
    }

    async goToLeave(sessionId: string) {
        const session = this.manager.getSession(sessionId);
        const newPagePromise = new Promise<Page>(resolve =>
            session.page.browser().once('targetcreated', async target => {
                const newPage = await target.page() as Page;
                resolve(newPage);
            })
        );
        // X: 90, Y: 200
        // await session.page.mouse.click(90, 200);
        await session.page.mouse.click(340, 460);
        await delay(500);
        // X: 300, Y: 220
        // await session.page.mouse.click(300, 220);
        const newPage: Page = await newPagePromise;
        // await delay(2000);
        // // await page.mouse.click(370, 250);
        // await delay(2000);
        const targetUrl = '#/timepay/ltadetail';

        await newPage.waitForFunction(
            (url) => window.location.href.includes(url),
            { timeout: 200000 },
            targetUrl
        );
        console.log("Page Leave");
        session.newPage = newPage;
        session.state = 'LEAVE';
        const result = { success: true }
        console.log("RESULTS:", result);
        // return res.status(200).json(result);
        return result;
    }

    async goToNewLeave(sessionId: string) {
        const session = this.manager.getSession(sessionId);

        if (!session.newPage) {
            throw new Error("newPage non initialisée");
        }

        await session.newPage.waitForSelector('button.btn.btn-default', { visible: true });
        await session.newPage.evaluate(() => {
            const btn = [...document.querySelectorAll('button.btn.btn-default')]
                .find(b => b.textContent.trim() === 'New Leave') as HTMLButtonElement | undefined;
            if (btn) { btn.click(); };
        });
        const result = { success: true }
        console.log("RESULTS:", result);
        // return res.status(200).json(result);
        return result;
    }

    async completeFormulaire(sessionId: string, data: CreateLeaveDto) {
        const session = this.manager.getSession(sessionId);
        const leaveLocation = leaveTypeLocation[data.leave_type];
        await delay(2000);
        // await newPage.$eval('#leaveComment', el => el.value = '');

        if (!session.newPage) {
            throw new Error("newPage non initialisée");
        }

        await session.newPage.waitForSelector('input[placeholder="Comment"]', { visible: true });
        await session.newPage.evaluate(() => {
            const el: HTMLInputElement = document.querySelector('input[placeholder="Comment"]') as HTMLInputElement;

            el.value = "";
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        console.log('comment =', data.reason, [typeof data.reason]);
        await session.newPage.type('input[placeholder="Comment"]', String(data.reason ?? ''), { delay: 100 });

        await delay(2000);
        await session.newPage.mouse.click(160, 240)
        await delay(2000);
        await session.newPage.mouse.click(leaveLocation.x, leaveLocation.y)
        await delay(2000);
        // await page.click('#startDate');
        console.log("STARTING DATE NOW !!!");
        // await setDate(newPage,"#startDate", '11/13/2025')
        await setDate(session.newPage, "#startDate", "" + (data.start_date.getMonth() + 1) + "/" + data.start_date.getDate() + "/" + data.start_date.getFullYear())
        await delay(2000);
        console.log("ENDING DATE NOW !!!");
        await setDate(session.newPage, "#endDate", "" + (data.end_date.getMonth() + 1) + "/" + data.end_date.getDate() + "/" + data.end_date.getFullYear())
        await delay(4000);

        const fileInputs = await session.newPage.$$('input[type="file"]');

        console.log("Nombre de champs file trouvés:", fileInputs.length);

        if (fileInputs.length === 0) {
            throw new Error("Aucun champ file détecté");
        }

        const filePath = path.join(process.cwd(), 'punch-in.png');
        console.log("FILE PATH:", filePath);

        await fileInputs[0].uploadFile(filePath);
        // await newPage.click('button[title="Submit"]');
        // D:/Aquarelle/aqua-project/one-hr-back/punch-in.png
        await delay(4000);
        console.log("✅ Bouton 'New Leave' cliqué");
        // await session.newPage.click('button[title="Submit"]');
        // await delay(3000);
        // console.log("1- ✅ Bouton 'Submit' cliqué");
        // await delay(3000);
        // console.log("1- ✅ Bouton 'Submit' cliqué");
        // await delay(3000);
        // console.log("1- ✅ Bouton 'Submit' cliqué");

        const result = { success: true }
        console.log("RESULTS:", result);
        // return res.status(200).json(result);
        return result;
    }

    // async goToLeave(sessionId: string, data: CreateLeaveDto) {
    //     const session = this.manager.getSession(sessionId);
    //     try {
    //         if (session.state !== 'LOGGED') {
    //             throw new Error('Utilisateur non connecté');
    //         }
    //         const inactivity_timeout = 5000;
    //         let btn_new_leave = false;
    //         let form = false;
    //         // await session.page.click('a[href="/leave"]');
    //         await newLeave(session.page, btn_new_leave, form, inactivity_timeout, data.start_date, data.end_date, data.comment, data.leave_type);
    //         session.state = 'LEAVE';
    //         const employ = await this.employeeRepo.findOne({
    //             where: { matricule: data.matricule },
    //         });
    //         // const leave = this.leaveRepo.create(data);
    //         // leave.employee = employ;
    //         // return this.leaveRepo.save(leave);
    //     } catch (error) {
    //         console.log("ERROR:", error);
    //         return { success: false }
    //     }
    // }
}
