/**
 * Captures DEMO screenshots of FinanceHub using a freshly-created Supabase user
 * with zero personal data, then deletes the user. This guarantees nothing
 * personal lands in the public portfolio.
 */
import { chromium, type Page } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const FINANCEHUB_ENV = process.env.FINANCEHUB_ENV ?? "";
const SITE = "https://financehub-web-ecru.vercel.app";
const OUT_DIR = path.resolve(__dirname, "..", "public", "projects", "financehub");

if (!FINANCEHUB_ENV) {
  console.error("Set FINANCEHUB_ENV=path/to/financehub/.env");
  process.exit(1);
}

function loadEnv(p: string): Record<string, string> {
  const raw = readFileSync(p, "utf-8");
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

async function adminApi(supabaseUrl: string, key: string, path: string, body?: unknown) {
  const res = await fetch(`${supabaseUrl}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${path} ${res.status}: ${await res.text()}`);
  return res.json();
}

async function createDemoUser(supabaseUrl: string, key: string, email: string) {
  console.log("→ creating demo user", email);
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: crypto.randomUUID() + "Aa1!",
      email_confirm: true,
      user_metadata: { display_name: "Demo Portfolio" },
    }),
  });
  if (!res.ok) throw new Error(`create user ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { id: string; email: string };
  console.log("✓ created", data.id);
  return data;
}

async function deleteUser(supabaseUrl: string, key: string, id: string) {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) console.warn("! delete user failed:", res.status, await res.text());
  else console.log("✓ deleted demo user");
}

async function generateMagicLink(supabaseUrl: string, key: string, email: string) {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "magiclink",
      email,
      options: { redirect_to: `${SITE}/dashboard` },
    }),
  });
  if (!res.ok) throw new Error(`magiclink ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { action_link?: string; properties?: { action_link: string } };
  const link = data.action_link ?? data.properties?.action_link;
  if (!link) throw new Error("no action_link");
  return link;
}

async function snap(page: Page, slug: string) {
  const out = path.join(OUT_DIR, `${slug}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log(`✓ ${slug}.png — ${page.url()}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const env = loadEnv(FINANCEHUB_ENV);
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("missing supabase env");

  const demoEmail = `demo-portfolio-${Date.now()}@example.com`;
  const user = await createDemoUser(supabaseUrl, serviceKey, demoEmail);

  try {
    const link = await generateMagicLink(supabaseUrl, serviceKey, demoEmail);

    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      colorScheme: "light",
    });
    const page = await ctx.newPage();

    console.log("→ following magic link…");
    await page.goto(link, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page
      .waitForURL(/\/dashboard/, { timeout: 30000 })
      .catch(() => console.warn("! no redirect, current:", page.url()));
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(5000);

    if (!page.url().includes("/dashboard")) {
      await page.goto(`${SITE}/dashboard`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(3000);
    }

    await snap(page, "dashboard");

    const routes = [
      ["/dashboard/transactions", "transactions"],
      ["/dashboard/ai", "luna-ai"],
      ["/dashboard/stats", "stats"],
      ["/dashboard/recurring", "recurring"],
      ["/dashboard/investments", "investments"],
      ["/dashboard/budget", "budget"],
      ["/dashboard/import-export", "import-export"],
      ["/dashboard/more", "more"],
    ] as const;

    for (const [route, slug] of routes) {
      try {
        await page.goto(`${SITE}${route}`, { waitUntil: "networkidle", timeout: 20000 });
        await page.waitForTimeout(2500);
        await snap(page, slug);
      } catch (e) {
        console.warn(`! skipped ${route}:`, (e as Error).message);
      }
    }

    // Mobile capture
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${SITE}/dashboard`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2500);
    await snap(page, "mobile");

    // Login screen (no auth) for branding
    await ctx.clearCookies();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SITE, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2500);
    await snap(page, "landing");

    await browser.close();
  } finally {
    await deleteUser(supabaseUrl, serviceKey, user.id);
  }
}

main().catch(async (e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
