const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
  });
  const page = await browser.newPage();

  await page.goto("***********");

  await page.waitForSelector('input[name="email"]');
  await page.waitForSelector('input[name="password"]');

  const email = "example@gmail.com";
  const password = "*************";

  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', password);

  const inputsFilled = await page.evaluate(() => {
    const emailValue = document
      .querySelector('input[name="email"]')
      .value.trim();
    const passwordValue = document
      .querySelector('input[name="password"]')
      .value.trim();
    return {
      emailFilled: emailValue.length > 0,
      passwordFilled: passwordValue.length > 0,
    };
  });

  if (!inputsFilled.emailFilled || !inputsFilled.passwordFilled) {
    console.error("Email or password is not filled.");
    await browser.close();
    return;
  }

  console.log("Inputs are filled, proceeding to sign in.");

  await page.click('button[type="submit"]');
  console.log("Submit button clicked.");

  const navigationPromise = page.waitForNavigation({
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  try {
    await navigationPromise;
    console.log("Navigation successful after button click.");
  } catch (err) {
    console.error("Navigation failed or timeout occurred:", err);
    await browser.close();
    return;
  }

  const currentUrl = page.url();
  console.log("Current URL:", currentUrl);
  if (!currentUrl.includes("select")) {
    console.error(
      "Navigation failed or login not successful. URL:",
      currentUrl
    );
    await browser.close();
    return;
  }

  await page.waitForSelector("table tbody");

  const tableData = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    return rows.map((row) => {
      const cells = row.querySelectorAll("td");

      const title = cells[1]?.innerText.trim() || "";
      const linkElement = cells[2]?.querySelector("a");
      const link = linkElement ? linkElement.href : "";
      const deadline = cells[3]?.innerText.trim() || "";
      const amount = cells[4]?.innerText.trim() || "";

      return {
        title,
        link,
        deadline,
        amount,
      };
    });
  });

  console.log("Table Data:", tableData);

  await browser.close();
})().catch((err) => {
  console.error("Error:", err);
});
