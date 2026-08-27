import * as puppeteer from 'puppeteer';
interface PuppeteerSession {
    browser: puppeteer.Browser;
    page: puppeteer.Page;
    newPage?: puppeteer.Page;
    state: 'INIT' | 'LOGGED' | 'LEAVE';
    lastUsed: number;
}
export declare class PuppeteerManagerService {
    private sessions;
    createSession(): Promise<any>;
    getSession(sessionId: string): PuppeteerSession;
    closeSession(sessionId: string): Promise<{
        message: string;
    } | undefined>;
}
export {};
