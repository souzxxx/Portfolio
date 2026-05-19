import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const dir = path.resolve(__dirname, "..", "public", "projects", "projeto-software");
  await mkdir(dir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1200 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  const URL = "https://projeto-sofware-2026-1-front-lyart.vercel.app";
  await page.goto(URL, { waitUntil: "networkidle", timeout: 45000 }).catch(() =>
    page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 }),
  );
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(dir, "cover.png"), fullPage: false });
  console.log("✓ cover.png");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(dir, "mobile.png"), fullPage: false });
  console.log("✓ mobile.png");
  await browser.close();
}
main();
