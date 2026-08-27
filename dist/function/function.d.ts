import { Page } from "puppeteer";
declare function connect(page: Page, loginUrl: string, username: string, password: string): Promise<{
    success: boolean;
}>;
declare function delay(ms: number): Promise<unknown>;
declare function setDate(page: Page, selector: string, value: string): Promise<void>;
export { connect, delay, setDate };
