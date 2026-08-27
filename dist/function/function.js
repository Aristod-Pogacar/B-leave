"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = connect;
exports.delay = delay;
exports.setDate = setDate;
async function connect(page, loginUrl, username, password) {
    try {
        await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 180000 });
        console.log("🔗 Ouverture du site...");
        await delay(5000);
        console.log("✏️ Remplissage du formulaire...");
        console.log("USERNAME:", username);
        console.log("PASSWORD:", password);
        await page.$eval('#loginForm\\:username12', (el) => el.value = '');
        await page.type("#loginForm\\:username12", username, { delay: 100 });
        await page.type("#loginForm\\:password", password, { delay: 100 });
        await delay(2000);
        console.log("🚀 Connexion...");
        await Promise.all([
            page.click("#loginForm\\:loginButton"),
            page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 180000 }),
        ]);
        const targetUrl = 'https://cieltextile.peoplestrong.com/oneweb/#/home';
        await page.waitForFunction((url) => window.location.href.includes(url), { timeout: 180000 }, targetUrl);
        console.log("✅ Connecté avec succès !");
        const result = { success: true };
        console.log("RESULTS:", result);
        return result;
    }
    catch (error) {
        const result = { success: false };
        console.log("ERROR:", error);
        return result;
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function setDate(page, selector, value) {
    await page.evaluate((selector, value) => {
        const el = document.querySelector(selector);
        if (!el)
            return;
        el.removeAttribute('disabled');
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }, selector, value);
}
//# sourceMappingURL=function.js.map