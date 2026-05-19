import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  const URL = "https://portfolio-souzxxxs-projects.vercel.app/";
  console.log("Navigating to", URL);
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: "/tmp/prod-hero.png", fullPage: false });
  console.log("✓ hero shot");

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  let y = 0;
  while (y < totalHeight) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(500);
    y += 900;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);

  const sections = ["projects", "more", "academic", "stack", "about"];
  for (const id of sections) {
    await page.evaluate((sel) => {
      const el = document.getElementById(sel);
      if (el) el.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    }, id);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `/tmp/prod-${id}.png`, fullPage: false });
    console.log(`✓ ${id}`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "/tmp/prod-mobile.png", fullPage: false });
  console.log("✓ mobile");

  await browser.close();
}

main();
