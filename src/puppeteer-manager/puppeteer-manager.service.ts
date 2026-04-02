import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import { v4 as uuid } from 'uuid';

interface PuppeteerSession {
    browser: puppeteer.Browser;
    page: puppeteer.Page;
    newPage?: puppeteer.Page;
    state: 'INIT' | 'LOGGED' | 'LEAVE';
    lastUsed: number;
}

@Injectable()
export class PuppeteerManagerService {
    private sessions = new Map<string, PuppeteerSession>();

    async createSession() {
        const sessionId = uuid();
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            userDataDir: `./sessions/${sessionId}`,
            timeout: 2000000
        });

        const page = await browser.newPage();
        await page.setCacheEnabled(true);

        this.sessions.set(sessionId, {
            browser,
            page,
            state: 'INIT',
            lastUsed: Date.now(),
        });

        return sessionId;
    }

    getSession(sessionId: string): PuppeteerSession {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Session expirée ou inexistante');
        session.lastUsed = Date.now();
        return session;
    }

    async closeSession(sessionId: string) {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        await session.browser.close();
        fs.rmSync('./sessions/' + sessionId, { recursive: true, force: true });
        this.sessions.delete(sessionId);
        return { message: "Session deleted successfully" }
    }
}
