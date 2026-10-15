/**
 * Verificação do pet num navegador de verdade.
 *
 * Uso: `npm run dev` (ou `next start`) em outro terminal e
 *   PET_BASE_URL=http://localhost:3000 npx tsx scripts/verify-pet.ts
 *
 * Os prints vão para PET_OUT (padrão /tmp/pet). Sai com código 1 se algum
 * check falhar.
 */
import { chromium, devices, type BrowserContext } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.PET_BASE_URL ?? "http://localhost:3000";
const OUT = process.env.PET_OUT ?? "/tmp/pet";
const GL = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"];

let falhas = 0;
function ok(cond: boolean, msg: string) {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
}

async function modoTeste(ctx: BrowserContext) {
  await ctx.addInitScript(() => {
    (window as Window & { __sxPetSonoMs?: number }).__sxPetSonoMs = 1500;
    try {
      sessionStorage.setItem("sx-boot", "1");
    } catch {}
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ args: GL });

  // 1. Desktop pt
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await modoTeste(ctx);
  const page = await ctx.newPage();
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") erros.push(m.text());
  });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const pet = page.locator("[data-pet]");
  await pet.waitFor({ timeout: 15000 });
  await page.waitForTimeout(800);
  ok((await pet.locator("canvas").count()) === 1, "desktop: pet montado com canvas");

  for (const id of ["projects", "more", "stack", "about"]) {
    await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ behavior: "instant" }), id);
    await page.waitForTimeout(900);
    await pet.screenshot({ path: `${OUT}/pet-sobre-${id}.png` });
  }

  // Review Focus 1: canto da caixa fora do Mac não pertence ao pet
  const furo = await page.evaluate(() => {
    const r = document.querySelector("[data-pet]")!.getBoundingClientRect();
    const el = document.elementFromPoint(r.left + 6, r.bottom - 6);
    return !!el && !el.closest("[data-pet]");
  });
  ok(furo, "canto da caixa deixa o clique passar para a página");

  // Sono e despertar
  await page.mouse.move(700, 400);
  await page.waitForTimeout(2300);
  ok((await pet.getAttribute("data-expressao")) === "dormindo", "dorme após inatividade");
  await pet.screenshot({ path: `${OUT}/pet-dormindo.png` });
  await page.mouse.move(600, 300);
  await page.waitForTimeout(80);
  ok((await pet.getAttribute("data-expressao")) === "surpreso", "acorda surpreso com o mouse");

  // Hover
  const link = page.locator("a[href]").first();
  await link.hover();
  await page.waitForTimeout(100);
  ok((await pet.getAttribute("data-expressao")) === "atento", "hover num link deixa atento");
  await page.mouse.move(700, 450);

  // Balão
  await page.evaluate(() => document.getElementById("stack")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(700);
  await pet.locator("button").click();
  const balao = page.locator("[data-pet-balao]");
  ok(await balao.isVisible(), "clique abre o balão");
  ok(((await balao.textContent()) ?? "").includes("armazenamento"), "balão traz a dica da stack");
  await page.screenshot({ path: `${OUT}/pet-balao.png`, clip: { x: 1440 - 420, y: 900 - 360, width: 420, height: 360 } });
  await page.keyboard.press("Escape");
  ok(!(await balao.isVisible().catch(() => false)), "Esc fecha o balão");

  // Review Focus 2: navegação client-side para um case
  await page.evaluate(() => document.getElementById("projects")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(500);
  await page.locator('a[href^="/projetos/"]').first().click();
  await page.waitForURL(/\/projetos\//);
  await page.waitForTimeout(800);
  await page.mouse.move(400, 300);
  await page.waitForTimeout(80);
  ok((await page.locator("[data-pet]").getAttribute("data-expressao")) !== "atento", "hover não fica preso depois de navegar");
  await page.locator("[data-pet] button").click();
  ok(((await page.locator("[data-pet-balao]").textContent()) ?? "").includes("próximo projeto"), "no case, a dica é do case");
  ok(erros.length === 0, `sem erros no console${erros.length ? ": " + erros.join(" | ") : ""}`);

  // /cv sem pet
  await page.goto(`${BASE}/cv`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  ok((await page.locator("[data-pet]").count()) === 0, "/cv sem pet");
  await ctx.close();

  // Review Focus 5: inglês
  const en = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await modoTeste(en);
  const pe = await en.newPage();
  await pe.goto(`${BASE}/en`, { waitUntil: "networkidle" });
  await pe.locator("[data-pet]").waitFor({ timeout: 15000 });
  await pe.evaluate(() => document.getElementById("stack")?.scrollIntoView({ behavior: "instant" }));
  await pe.waitForTimeout(700);
  await pe.locator("[data-pet] button").click();
  ok(((await pe.locator("[data-pet-balao]").textContent()) ?? "").includes("storage bar"), "/en: balão em inglês");
  await en.close();

  // Celular
  const mob = await browser.newContext({ ...devices["iPhone 13"] });
  const pm = await mob.newPage();
  await pm.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await pm.waitForTimeout(2500);
  ok((await pm.locator("[data-pet]").count()) === 0, "celular sem pet");
  await mob.close();

  // Reduzir movimento
  const red = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await modoTeste(red);
  const pr = await red.newPage();
  await pr.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await pr.locator("[data-pet]").waitFor({ timeout: 15000 });
  await pr.mouse.move(100, 100);
  await pr.mouse.wheel(0, 2500);
  await pr.waitForTimeout(60);
  const rot = await pr.evaluate(
    () => (window as Window & { __sxPet?: { rot: { x: number; y: number } } }).__sxPet?.rot,
  );
  ok(!!rot && Math.abs(rot.x) < 1e-6 && Math.abs(rot.y) < 1e-6, "reduzir movimento: corpo parado");
  await red.close();
  await browser.close();

  // Review Focus 4: sem WebGL
  const semGl = await chromium.launch({ args: ["--disable-gpu", "--disable-software-rasterizer", "--disable-webgl"] });
  const cg = await semGl.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await cg.newPage();
  await pg.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await pg.waitForTimeout(3000);
  ok((await pg.locator("[data-pet]").count()) === 0, "sem WebGL o pet some inteiro");
  await semGl.close();

  if (falhas) {
    console.error(`\n${falhas} check(s) falharam`);
    process.exit(1);
  }
  console.log("\ntudo certo");
}

main();
