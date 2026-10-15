/**
 * Verificação do pet num navegador de verdade.
 *
 * Uso: `npm run dev` (ou `next start`) em outro terminal e
 *   PET_BASE_URL=http://localhost:3000 npx tsx scripts/verify-pet.ts
 *
 * Os prints vão para PET_OUT (padrão /tmp/pet). Sai com código 1 se algum
 * check falhar.
 */
import { chromium, devices, type Browser, type BrowserContext, type Page } from "playwright";
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

/** Espera o botão (= primeiro quadro desenhado) e o desvio assentar: a
 *  primeira medida sai ~300 ms depois e a mola do translate leva 420 ms. */
async function assentar(p: Page) {
  await p.locator("[data-pet] button").waitFor({ timeout: 15000 });
  await p.waitForTimeout(1600);
}

/** Rótulos dos alvos cujo CENTRO cai dentro do pet. */
async function cobertos(p: Page, seletor: string) {
  return p.evaluate((sel) => {
    const nomes: string[] = [];
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      const topo = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (topo?.closest("[data-pet]")) nomes.push((el.textContent ?? "").trim().slice(0, 20));
    }
    return nomes;
  }, seletor);
}

const ICONES_DA_MESA = ".mesa nav a, .mesa nav button";

/**
 * Correções da revisão final: canvas sem escala presa (I1), botão só com a
 * cena desenhada (T8), desvio de controles (I2), janelas da mesa contidas
 * (I3). Os prints vão para OUT/final-*.
 */
async function correcoesFinais(browser: Browser) {
  // I1 + T8: cinco cargas frescas, sem rolar nada. As duas últimas passam
  // pelo Boot (sessão nova), as de índice ímpar em DPR 2.
  for (let i = 0; i < 5; i++) {
    const dpr = i % 2 ? 2 : 1;
    const c = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: dpr,
    });
    if (i < 3) await modoTeste(c);
    await c.addInitScript(() => {
      // Retrato do wrapper no instante em que ele entra no DOM.
      const w = window as Window & { __sxPetNasce?: { botao: boolean; opacidade: string } };
      new MutationObserver((_, mo) => {
        const el = document.querySelector<HTMLElement>("[data-pet]");
        if (!el) return;
        w.__sxPetNasce = {
          botao: !!el.querySelector("button"),
          opacidade: getComputedStyle(el).opacity,
        };
        mo.disconnect();
      }).observe(document, { childList: true, subtree: true });
    });
    const p = await c.newPage();
    await p.goto(`${BASE}/`, { waitUntil: "load" });
    await p.locator("[data-pet] button").waitFor({ timeout: 15000 });
    await p.waitForTimeout(700);
    const m = await p.evaluate(() => {
      const cv = document.querySelector<HTMLCanvasElement>("[data-pet] canvas")!;
      const d = window.devicePixelRatio;
      const w = window as Window & { __sxPetNasce?: { botao: boolean; opacidade: string } };
      return {
        css: [cv.offsetWidth, cv.offsetHeight],
        buffer: [cv.width / d, cv.height / d],
        nasce: w.__sxPetNasce,
        rolou: window.scrollY,
      };
    });
    ok(
      m.css.join() === "150,150" && m.buffer.join() === "150,150" && m.rolou === 0,
      `carga ${i + 1} (dpr ${dpr}${i < 3 ? "" : ", com Boot"}): canvas 150×150 antes de rolar — css ${m.css.join("×")}, buffer/dpr ${m.buffer.join("×")}`,
    );
    ok(
      !!m.nasce && !m.nasce.botao && m.nasce.opacidade === "0",
      `carga ${i + 1}: o pet nasce transparente e sem botão até a cena desenhar — ${JSON.stringify(m.nasce)}`,
    );
    await c.close();
  }

  // I2 (a): ícones da mesa, home no topo.
  for (const [w, h] of [
    [1366, 768],
    [1280, 800],
    [1280, 720],
    [1024, 768],
    [1440, 700],
  ]) {
    const c = await browser.newContext({ viewport: { width: w, height: h } });
    await modoTeste(c);
    const p = await c.newPage();
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await assentar(p);
    const nomes = await cobertos(p, ICONES_DA_MESA);
    const total = await p.locator(ICONES_DA_MESA).count();
    ok(
      total === 8 && nomes.length === 0,
      `${w}×${h} topo: nenhum dos ${total} ícones da mesa (Lixeira e GitHub inclusos) sob o pet${nomes.length ? " — cobertos: " + nomes.join(", ") : ""}`,
    );
    await p.screenshot({
      path: `${OUT}/final-icones-${w}x${h}.png`,
      clip: { x: w - 420, y: h - 420, width: 420, height: 420 },
    });

    // I3: em 1440×700 (mesa não sticky), com as janelas na tela, o botão
    // recebe o clique. Sem `isolate` o z-70 das janelas competia com o z-60.
    if (w === 1440 && h === 700) {
      let abriu = false;
      try {
        await p.locator("[data-pet] button").click({ timeout: 5000 });
        abriu = await p.locator("[data-pet-balao]").isVisible();
      } catch {}
      ok(abriu, "1440×700: o botão do pet recebe o clique com as janelas da mesa na tela");
    }
    await c.close();
  }

  // I2 (b): "Voltar ao topo" no fim da página, home e um case.
  for (const [w, h] of [
    [1440, 900],
    [1024, 768],
  ]) {
    for (const rota of ["/", "/projetos/tecna-site"]) {
      const c = await browser.newContext({ viewport: { width: w, height: h } });
      await modoTeste(c);
      const p = await c.newPage();
      await p.goto(`${BASE}${rota}`, { waitUntil: "networkidle" });
      await p.locator("[data-pet] button").waitFor({ timeout: 15000 });
      await p.evaluate(() => {
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await p.waitForTimeout(1600);
      const nomes = await cobertos(p, 'footer a[href="#top"]');
      ok(nomes.length === 0, `${w}×${h} fim de ${rota}: "Voltar ao topo" fora do pet`);
      await p.screenshot({
        path: `${OUT}/final-rodape-${w}x${h}${rota.replace(/\//g, "_")}.png`,
        clip: { x: w - 520, y: h - 360, width: 520, height: 360 },
      });
      await c.close();
    }
  }

  // I3 + mesa intacta: 1366×650 (o caso do revisor). Arrasta a última
  // janela para o canto do pet; o pet continua por cima e clicável, e a
  // janela de fato andou. Depois o Terminal responde e o cursor da mesa
  // continua o de pixel.
  {
    const w = 1366;
    const h = 650;
    const c = await browser.newContext({ viewport: { width: w, height: h } });
    await modoTeste(c);
    const p = await c.newPage();
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await assentar(p);
    const alcas = p.locator(".mesa .cursor-grab");
    const n = await alcas.count();
    const antes = (await alcas.nth(n - 1).boundingBox())!;
    await p.mouse.move(antes.x + 30, antes.y + antes.height / 2);
    await p.mouse.down();
    for (let i = 1; i <= 20; i++) {
      await p.mouse.move(
        antes.x + 30 + ((w - 260 - antes.x) * i) / 20,
        antes.y + antes.height / 2 + ((h - 120 - antes.y) * i) / 20,
      );
    }
    await p.mouse.up();
    await p.waitForTimeout(1600);
    const depois = (await alcas.nth(n - 1).boundingBox())!;
    ok(
      Math.abs(depois.x - antes.x) > 50 && Math.abs(depois.y - antes.y) > 50,
      `${w}×${h}: arrastar janela da mesa continua funcionando`,
    );
    const noPet = await p.evaluate(() => {
      const b = document.querySelector("[data-pet] button")!.getBoundingClientRect();
      return !!document
        .elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
        ?.closest("[data-pet]");
    });
    let abriu = false;
    try {
      await p.locator("[data-pet] button").click({ timeout: 5000 });
      abriu = await p.locator("[data-pet-balao]").isVisible();
    } catch {}
    ok(noPet && abriu, `${w}×${h}: janela arrastada para o canto não cobre o pet (clique abre o balão)`);
    await p.screenshot({ path: `${OUT}/final-arrasto-${w}x${h}.png` });
    await p.keyboard.press("Escape");

    await p.locator("#sx-terminal").fill("help");
    const antesTxt = (await p.locator("#sx-terminal").evaluate((el) => el.closest("form")!.parentElement!.textContent ?? "")).length;
    await p.locator("#sx-terminal").press("Enter");
    await p.waitForTimeout(200);
    const depoisTxt = (await p.locator("#sx-terminal").evaluate((el) => el.closest("form")!.parentElement!.textContent ?? "")).length;
    ok(depoisTxt > antesTxt + 20, "Terminal da mesa responde a `help`");
    const cursor = await p.evaluate(() => getComputedStyle(document.querySelector("section.mesa")!).cursor);
    ok(cursor.startsWith("url("), "cursor de pixel da mesa intacto");
    await c.close();
  }

  // Movimento reduzido: sem transição, mas ainda desvia.
  {
    const c = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      reducedMotion: "reduce",
    });
    await modoTeste(c);
    const p = await c.newPage();
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await assentar(p);
    const nomes = await cobertos(p, ICONES_DA_MESA);
    const m = await p.evaluate(() => {
      const cs = getComputedStyle(document.querySelector("[data-pet]")!);
      return { translate: cs.translate, duracao: parseFloat(cs.transitionDuration) };
    });
    const andou = (m.translate.match(/-?[\d.]+/g) ?? []).some((v) => Number(v) !== 0);
    ok(
      nomes.length === 0 && andou && m.duracao < 0.001,
      `movimento reduzido: desvia sem transição — translate ${m.translate}, duração ${m.duracao}s`,
    );
    await c.close();
  }
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

  await correcoesFinais(browser);
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
