import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

interface Target {
  slug: string;
  url: string;
  wait?: number;
}

const targets: Target[] = [
  { slug: "sentinel", url: "https://sentinel-mu-navy.vercel.app", wait: 4000 },
  { slug: "financehub", url: "https://financehub-web-ecru.vercel.app", wait: 3000 },
  { slug: "universe-project", url: "https://universe-project-navy.vercel.app", wait: 2500 },
  { slug: "usp-fono", url: "https://usp-fono.vercel.app", wait: 2500 },
  { slug: "projeto-software", url: "https://projeto-sofware-2026-1-front.vercel.app", wait: 2500 },
];

const ROOT = path.resolve(__dirname, "..");

async function capture(target: Target) {
  const dir = path.join(ROOT, "public", "projects", target.slug);
  await mkdir(dir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  try {
    const ctx = await browser.newContext({
      viewport: { width: 1920, height: 1200 },
      deviceScaleFactor: 2,
      colorScheme: "dark",
    });
    const page = await ctx.newPage();

    console.log(`[${target.slug}] navigating to ${target.url}`);
    await page.goto(target.url, { waitUntil: "networkidle", timeout: 45000 }).catch(async () => {
      console.warn(`[${target.slug}] networkidle timeout, falling back to domcontentloaded`);
      await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 30000 });
    });
    await page.waitForTimeout(target.wait ?? 2000);

    const outDesk = path.join(dir, "cover.png");
    await page.screenshot({ path: outDesk, fullPage: false });
    console.log(`[${target.slug}] saved desktop -> ${outDesk}`);

    // Mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(800);
    const outMobile = path.join(dir, "mobile.png");
    await page.screenshot({ path: outMobile, fullPage: false });
    console.log(`[${target.slug}] saved mobile -> ${outMobile}`);
  } catch (err) {
    console.error(`[${target.slug}] FAILED:`, err);
  } finally {
    await browser.close();
  }
}

async function main() {
  await Promise.all(targets.map(capture));
  console.log("\n✓ All captures complete");
}

main();
