import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3500);

  await page.screenshot({ path: "/tmp/portfolio-hero.png", fullPage: false });
  console.log("✓ hero shot: /tmp/portfolio-hero.png");

  // Slowly scroll the entire page to trigger every IntersectionObserver
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportH = 900;
  let y = 0;
  while (y < totalHeight) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(400);
    y += viewportH;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);

  await page.screenshot({ path: "/tmp/portfolio-full.png", fullPage: true });
  console.log("✓ full shot: /tmp/portfolio-full.png");

  // Capture each major section individually after revealing them
  const sections = ["projects", "more", "academic", "stack", "about"];
  for (const id of sections) {
    await page.evaluate((sel) => {
      const el = document.getElementById(sel);
      if (el) el.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    }, id);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `/tmp/portfolio-${id}.png`, fullPage: false });
    console.log(`✓ ${id} shot: /tmp/portfolio-${id}.png`);
  }

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "/tmp/portfolio-mobile.png", fullPage: false });
  console.log("✓ mobile shot: /tmp/portfolio-mobile.png");

  await browser.close();
}

main();
