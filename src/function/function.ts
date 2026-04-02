import { Page } from "puppeteer";

async function connect(page: Page, loginUrl: string, username: string, password: string) {
  try {
    await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 180000 });

    console.log("🔗 Ouverture du site...");
    await delay(5000);

    // Remplir le formulaire de connexion
    console.log("✏️ Remplissage du formulaire...");
    console.log("USERNAME:", username);
    console.log("PASSWORD:", password);

    await page.$eval('#loginForm\\:username12', (el: HTMLInputElement) => el.value = '');
    await page.type("#loginForm\\:username12", username, { delay: 100 });
    await page.type("#loginForm\\:password", password, { delay: 100 });

    // Cliquer sur le bouton Login
    await delay(2000);
    console.log("🚀 Connexion...");
    await Promise.all([
      page.click("#loginForm\\:loginButton"),
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 180000 }),
    ]);
    const targetUrl = 'https://cieltextile.peoplestrong.com/oneweb/#/home';

    await page.waitForFunction(
      (url) => window.location.href.includes(url),
      { timeout: 180000 },
      targetUrl
    );

    console.log("✅ Connecté avec succès !");
    const result = { success: true }
    console.log("RESULTS:", result);
    return result;
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
  }
}
// async function connect(page: Page, loginUrl: string, username: string, password: string) {
//   await page.goto(loginUrl, { waitUntil: "domcontentloaded" });

//   console.log("🔗 Ouverture du site...");

//   // Remplir le formulaire de connexion
//   console.log("✏️ Remplissage du formulaire...");
//   console.log("USERNAME:", username);
//   console.log("PASSWORD:", password);
//   await delay(3000);

//   await page.$eval('#loginForm\\:username12', (el: HTMLInputElement) => el.value = '');
//   await page.type("#loginForm\\:username12", "AMAA9000002356", { delay: 200 });
//   await page.type("#loginForm\\:password", "Test@2026", { delay: 200 });
//   // await page.type("#loginForm\\:username12", username, { delay: 80 });
//   // await page.type("#loginForm\\:password", password, { delay: 80 });

//   await delay(3000);
//   // Cliquer sur le bouton Login
//   console.log("🚀 Connexion...");
//   await Promise.all([
//     page.click("#loginForm\\:loginButton"),
//     page.waitForNavigation({ waitUntil: "domcontentloaded" }),
//   ]);

//   // Attente que la page principale charge (vérifie un élément spécifique du tableau de bord)
//   console.log("✅ Connecté avec succès !");
// }

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function setDate(page: Page, selector: string, value: string) {
  await page.evaluate((selector, value) => {
    const el: HTMLInputElement | null = document.querySelector(selector);
    if (!el) return;
    el.removeAttribute('disabled');
    el.value = value;

    // Simuler changement Angular
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, selector, value);
}

export {
  connect,
  delay,
  setDate
}