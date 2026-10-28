/**
 * Verificação do pet num navegador de verdade.
 *
 * Uso: `npm run dev` (ou `next start`) em outro terminal e
 *   PET_BASE_URL=http://localhost:3000 npx tsx scripts/verify-pet.ts
 *
 * Os prints vão para PET_OUT (padrão /tmp/pet). Sai com código 1 se algum
 * check falhar.
 *
 * NA HOME o pet só existe depois do SOUZXXX (spec §5): com a mesa à vista ele
 * fica fora de cena, sem botão, e entra/sai com o teletransporte quando a
 * borda de cima do SOUZXXX cruza a MenuBar. Por isso todo check que precisa
 * do pet na home rola até lá antes (`cortinaEm`), e o que roda com a home no
 * topo confere que ele NÃO está lá.
 */
import { chromium, devices, type Browser, type BrowserContext, type Page } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdir, rename, stat } from "node:fs/promises";

const BASE = process.env.PET_BASE_URL ?? "http://localhost:3000";
const OUT = process.env.PET_OUT ?? "/tmp/pet";
const GL = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"];

let falhas = 0;
function ok(cond: boolean, msg: string) {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
}

type JanelaDeTeste = Window & {
  __sxPetSonoMs?: number;
  __sxFasesAntes?: string[];
  __sxExpressoes?: string[];
  __sxPetEntra?: number;
  __sxVigia?: { minOp: number; escondido: boolean; petEntra: boolean; quadros: number };
};

async function modoTeste(ctx: BrowserContext) {
  await ctx.addInitScript(() => {
    (window as Window & { __sxPetSonoMs?: number }).__sxPetSonoMs = 1500;
    try {
      sessionStorage.setItem("sx-boot", "1");
    } catch {}
  });
}

/**
 * Grava toda fase que o `data-teleporte` do pet já teve. O MutationObserver
 * guarda o valor ANTIGO de cada troca (o novo é o atual), então nenhuma fase
 * se perde mesmo quando duas trocas caem no mesmo lote. `fases(p)` devolve a
 * sequência completa, sem repetições seguidas.
 *
 * Conta também cada vez que a `.pet-entra` (a entrada CSS de fora da home)
 * começa no wrapper: `entradasCss(p)`.
 */
async function gravarFases(ctx: BrowserContext) {
  await ctx.addInitScript(() => {
    const w = window as Window & { __sxFasesAntes?: string[]; __sxPetEntra?: number };
    w.__sxFasesAntes = [];
    w.__sxPetEntra = 0;
    document.addEventListener("animationstart", (e) => {
      if (e.animationName === "pet-entra" && (e.target as Element).matches?.("[data-pet]")) w.__sxPetEntra!++;
    });
    new MutationObserver((registros) => {
      for (const r of registros) {
        if (r.type === "attributes" && (r.target as Element).matches("[data-pet]")) {
          w.__sxFasesAntes!.push(r.oldValue ?? "∅");
        }
      }
    }).observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-teleporte"],
      attributeOldValue: true,
    });
  });
}

async function fases(p: Page): Promise<string[]> {
  return p.evaluate(() => {
    const w = window as JanelaDeTeste;
    const atual = document.querySelector("[data-pet]")?.getAttribute("data-teleporte") ?? "∅";
    const todas = [...(w.__sxFasesAntes ?? []), atual];
    return todas.filter((f, i) => i === 0 || f !== todas[i - 1]);
  });
}

const fase = (p: Page) => p.locator("[data-pet]").getAttribute("data-teleporte");

const entradasCss = (p: Page) => p.evaluate(() => (window as JanelaDeTeste).__sxPetEntra ?? 0);
const zerarEntradasCss = (p: Page) => p.evaluate(() => ((window as JanelaDeTeste).__sxPetEntra = 0));

/**
 * Vigia o pet a cada quadro por `ms`: a menor opacidade EFETIVA (wrapper ×
 * corpo, que não herdam), se ele ficou `hidden` e se a `.pet-entra` chegou a
 * rodar. Um print depois da navegação não pega uma piscada de 300 ms; isto pega.
 */
async function vigiar(p: Page, ms: number) {
  await p.evaluate((dur) => {
    const w = window as JanelaDeTeste;
    const v = { minOp: 1, escondido: false, petEntra: false, quadros: 0 };
    w.__sxVigia = v;
    const t0 = performance.now();
    // Laço anônimo e sem await de propósito: o evaluate volta na hora e a
    // vigia segue sozinha. Função com nome aqui dentro quebra no tsx (__name).
    void (async () => {
      while (performance.now() - t0 < dur) {
        const pet = document.querySelector("[data-pet]");
        const corpo = pet?.querySelector('[data-teleporte-parte="corpo"]');
        if (pet && corpo) {
          const op = parseFloat(getComputedStyle(pet).opacity) * parseFloat(getComputedStyle(corpo).opacity);
          v.minOp = Math.min(v.minOp, op);
          if (getComputedStyle(pet).visibility === "hidden") v.escondido = true;
          if (pet.getAnimations().some((a) => (a as CSSAnimation).animationName === "pet-entra" && a.playState === "running")) {
            v.petEntra = true;
          }
        }
        v.quadros++;
        await new Promise(requestAnimationFrame);
      }
    })();
  }, ms);
}
const vigia = (p: Page) => p.evaluate(() => (window as JanelaDeTeste).__sxVigia!);

/**
 * Rola até a borda de cima do SOUZXXX (`[data-cortina]`) ficar em `topo` px
 * da janela. Scroll instantâneo: o `scroll-behavior` do site faria o
 * teletransporte disparar no meio de uma rolagem suave, em hora incerta.
 */
async function cortinaEm(p: Page, topo: number, espera = 700) {
  await p.evaluate((t) => {
    document.documentElement.style.scrollBehavior = "auto";
    const r = document.querySelector("[data-cortina]")!.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - t);
  }, topo);
  if (espera) await p.waitForTimeout(espera);
}

/**
 * A cena desenhou o primeiro quadro: o wrapper perde o `opacity: 0` inline.
 * Não dá para esperar o botão, porque na home, no topo, ele não existe.
 */
async function esperarCena(p: Page) {
  await p.waitForFunction(
    () => {
      const el = document.querySelector("[data-pet]");
      return !!el && getComputedStyle(el).opacity === "1";
    },
    undefined,
    { timeout: 15000 },
  );
}

/** Espera a cena e o desvio assentar: a primeira medida sai ~300 ms depois
 *  e a mola do translate leva 420 ms. */
async function assentar(p: Page) {
  await esperarCena(p);
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

/** Tamanho do canvas do pet em CSS e em buffer/DPR. */
async function canvasDoPet(p: Page) {
  return p.evaluate(() => {
    const cv = document.querySelector<HTMLCanvasElement>("[data-pet] canvas")!;
    const d = window.devicePixelRatio;
    return { css: [cv.offsetWidth, cv.offsetHeight].join(), buffer: [cv.width / d, cv.height / d].join() };
  });
}

const ICONES_DA_MESA = ".mesa nav a, .mesa nav button";

/**
 * O teletransporte da home (spec §5): entra, histerese, sai, tremido, página
 * aberta já rolada e navegação entre home e case. Os prints vão para OUT/tele-*.
 */
async function teletransporte(browser: Browser) {
  const w = 1440;
  const h = 900;
  {
    const c = await browser.newContext({ viewport: { width: w, height: h } });
    await modoTeste(c);
    await gravarFases(c);
    const p = await c.newPage();
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await assentar(p);

    // Entrada. A expressão é gravada desde antes de rolar: o susto dura 600 ms.
    await p.evaluate(() => {
      const ww = window as JanelaDeTeste;
      const el = document.querySelector("[data-pet]")!;
      ww.__sxExpressoes = [el.getAttribute("data-expressao") ?? ""];
      new MutationObserver(() => ww.__sxExpressoes!.push(el.getAttribute("data-expressao") ?? "")).observe(el, {
        attributes: true,
        attributeFilter: ["data-expressao"],
      });
    });
    const t0 = Date.now();
    await cortinaEm(p, 20, 0);
    let entrou = true;
    try {
      await p.locator('[data-pet][data-teleporte="dentro"] button').waitFor({ timeout: 1500 });
    } catch {
      entrou = false;
    }
    const ms = Date.now() - t0;
    ok(entrou, `entrada: com o SOUZXXX na MenuBar o pet fica dentro e com botão (${ms} ms) — fase ${await fase(p)}`);
    const seq = await fases(p);
    ok(
      seq.join() === "fora,entrando,dentro",
      `entrada: passa por fora → entrando → dentro — ${seq.join(" → ")}`,
    );
    const cv = await canvasDoPet(p);
    ok(
      cv.css === "150,150" && cv.buffer === "150,150",
      `entrada: canvas continua 150×150 depois do teletransporte — css ${cv.css}, buffer/dpr ${cv.buffer}`,
    );
    await p.waitForTimeout(300);
    const expressoes = await p.evaluate(() => (window as JanelaDeTeste).__sxExpressoes ?? []);
    ok(expressoes.includes("surpreso"), `entrada: a cara passa por surpreso — ${expressoes.join(" → ")}`);
    await p.screenshot({ path: `${OUT}/tele-dentro.png`, clip: { x: w - 260, y: h - 260, width: 260, height: 260 } });

    // Histerese, partindo de dentro: 50 px ainda está na faixa.
    await cortinaEm(p, 50);
    ok((await fase(p)) === "dentro", `histerese: com o SOUZXXX a 50 px, quem estava dentro continua — ${await fase(p)}`);

    // Saída.
    await cortinaEm(p, 120);
    const botoes = await p.locator("[data-pet] button").count();
    ok((await fase(p)) === "fora" && botoes === 0, `saída: com o SOUZXXX a 120 px o pet sai e o botão some — ${await fase(p)}, ${botoes} botão`);
    const vis = await p.evaluate(() => getComputedStyle(document.querySelector("[data-pet]")!).visibility);
    ok(vis === "hidden", `saída: fora de cena, o wrapper fica visibility hidden — ${vis}`);

    // Histerese, partindo de fora: 50 px não basta para entrar.
    await cortinaEm(p, 50);
    ok((await fase(p)) === "fora", `histerese: com o SOUZXXX a 50 px, quem estava fora continua — ${await fase(p)}`);

    // Tremido: inverte no meio do teletransporte, várias vezes.
    await cortinaEm(p, 120);
    for (const topo of [20, 70, 15, 90, 10]) await cortinaEm(p, topo, 120);
    await p.waitForTimeout(1000);
    const botaoTremido = await p.locator("[data-pet] button").count();
    ok(
      (await fase(p)) === "dentro" && botaoTremido === 1,
      `tremido (20→70→15→90→10): termina dentro e com botão — ${await fase(p)}, ${botaoTremido} botão`,
    );

    // Navegação: home rolada → case pelo link da vitrine, que já está na
    // tela (um link da mesa faria o Playwright rolar de volta ao topo antes).
    // Hoje esse link é um <a> comum, então é carga de página inteira: o pet
    // remonta no case e entra como sempre. A troca client-side, em que o Pet
    // NÃO desmonta, tem o bloco próprio logo abaixo.
    await p.evaluate(() => document.getElementById("projects")?.scrollIntoView({ behavior: "instant" }));
    await p.waitForTimeout(700);
    await p.locator('#projects a[href^="/projetos/"]').first().click();
    await p.waitForURL(/\/projetos\//);
    await p.locator("[data-pet] button").waitFor({ timeout: 5000 });
    await p.waitForTimeout(500);
    const visivel = await p.evaluate(() => {
      // A opacidade não é herdada: confere o canvas e cada ancestral até o pet.
      const ops: string[] = [];
      let el: Element | null = document.querySelector("[data-pet] canvas");
      while (el) {
        ops.push(getComputedStyle(el).opacity);
        if (el.matches("[data-pet]")) break;
        el = el.parentElement;
      }
      const pet = document.querySelector("[data-pet]")!;
      return { ops, vis: getComputedStyle(pet).visibility, fase: pet.getAttribute("data-teleporte") };
    });
    ok(
      visivel.ops.every((o) => o === "1") && visivel.vis === "visible" && visivel.fase === "dentro",
      `navegação: home rolada → case, o pet aparece inteiro — opacidades ${visivel.ops.join("/")}, ${visivel.vis}, ${visivel.fase}`,
    );

    // Voltar para a home e subir até a mesa: ele sai.
    await p.goBack();
    await p.waitForURL((u) => new URL(u).pathname === "/");
    await p.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(1000);
    const botaoVolta = await p.locator("[data-pet] button").count();
    ok(
      (await fase(p)) === "fora" && botaoVolta === 0,
      `navegação: voltar para a home com scroll 0 deixa o pet fora — ${await fase(p)}, ${botaoVolta} botão`,
    );
    await c.close();
  }

  // Troca de rota CLIENT-SIDE entre a home e um case: o Pet mora no layout e
  // NÃO desmonta, então quem decide a entrada é ele. É o que acontece no
  // voltar/avançar dentro do mesmo documento (o Link "/" do 404, por exemplo)
  // e em qualquer `next/link` futuro. Os links da home para os cases são <a>
  // comuns hoje, então o teste empurra a rota pelo roteador do Next
  // (`window.next.router`, que o Next expõe para depuração).
  {
    const c = await browser.newContext({ viewport: { width: w, height: h } });
    await modoTeste(c);
    await gravarFases(c);
    const p = await c.newPage();
    const empurrar = (rota: string) =>
      p.evaluate((r) => (window as unknown as { next: { router: { push(h: string): void } } }).next.router.push(r), rota);
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await esperarCena(p);
    await cortinaEm(p, 20);
    await p.locator('[data-pet][data-teleporte="dentro"] button').waitFor({ timeout: 5000 });
    await p.waitForTimeout(300);

    // Visível na home → case: nada de `.pet-entra`, que começa em opacidade 0.
    await zerarEntradasCss(p);
    await vigiar(p, 1500);
    await empurrar("/projetos/tecna-site");
    await p.waitForURL(/\/projetos\//);
    const logo = await p.evaluate(() => {
      const pet = document.querySelector("[data-pet]");
      if (!pet) return { op: "sem pet", petEntra: false };
      return {
        op: getComputedStyle(pet).opacity,
        petEntra: pet.getAnimations().some((a) => (a as CSSAnimation).animationName === "pet-entra" && a.playState === "running"),
      };
    });
    await p.locator("[data-pet] button").waitFor({ timeout: 5000 });
    await p.waitForTimeout(1000);
    const v = await vigia(p);
    const nEntra = await entradasCss(p);
    ok(
      logo.op === "1" && !logo.petEntra,
      `client-side: logo depois do waitForURL o pet já está inteiro, sem .pet-entra — opacidade ${logo.op}, pet-entra ${logo.petEntra}`,
    );
    ok(
      v.minOp === 1 && !v.escondido && !v.petEntra && nEntra === 0,
      `client-side: home rolada (pet dentro) → case, o pet não pisca (${v.quadros} quadros vigiados) — opacidade mínima ${v.minOp}, hidden ${v.escondido}, pet-entra rodando ${v.petEntra}, ${nEntra} início(s)`,
    );

    // Case → home no topo: ele estava visível, então sai pelo teletransporte.
    // O Chrome restaura a rolagem da home (onde o pet estava dentro) uns
    // 40 ms DEPOIS do popstate, quando o React já pintou a home. Subir antes
    // disso é corrida: no `next start` a restauração chegou depois do
    // scrollTo e deixou o pet dentro. Então espera a rolagem voltar e só
    // depois sobe ao topo.
    await p.goBack();
    await p.waitForURL((u) => new URL(u).pathname === "/");
    await p.waitForFunction(() => window.scrollY > 0, null, { timeout: 2000 }).catch(() => undefined);
    await p.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(1000);
    const seq = await fases(p);
    ok(
      seq.slice(-2).join() === "saindo,fora" && (await p.locator("[data-pet] button").count()) === 0,
      `client-side: case → home no topo, o pet sai pelo teletransporte — ${seq.join(" → ")}`,
    );

    // Fora de cena na home → case: chega invisível e entra como sempre entrou.
    await zerarEntradasCss(p);
    await empurrar("/projetos/tecna-site");
    await p.waitForURL(/\/projetos\//);
    await p.locator("[data-pet] button").waitFor({ timeout: 5000 });
    await p.waitForTimeout(500);
    const nForaCase = await entradasCss(p);
    ok(nForaCase === 1, `client-side: home no topo (pet fora) → case, a .pet-entra toca uma vez — ${nForaCase}`);
    await c.close();
  }

  // Voltar do navegador (history.back, client-side) de um case para a home.
  // O Chrome pinta a home em y = 0 e só ~10 ms depois devolve a rolagem dela:
  // medido nessa hora, o pet via a mesa e começava a sair, para voltar quando
  // a rolagem chegava (dentro → saindo → entrando → dentro). Agora ele
  // assenta direto: home devolvida depois da linha, fica; home no topo, sai
  // uma vez só. O MutationObserver do `gravarFases` não perde troca nenhuma,
  // por mais curta; a sequência é zerada logo antes do voltar.
  for (const rolada of [true, false]) {
    const c = await browser.newContext({ viewport: { width: w, height: h } });
    await modoTeste(c);
    await gravarFases(c);
    const p = await c.newPage();
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await esperarCena(p);
    if (rolada) {
      await cortinaEm(p, 20);
      await p.locator('[data-pet][data-teleporte="dentro"] button').waitFor({ timeout: 5000 });
    }
    await p.waitForTimeout(300);
    const yHome = await p.evaluate(() => window.scrollY);
    await p.evaluate(() => (window as unknown as { next: { router: { push(h: string): void } } }).next.router.push("/projetos/tecna-site"));
    await p.waitForURL(/\/projetos\//);
    await p.locator("[data-pet] button").waitFor({ timeout: 5000 });
    await p.waitForTimeout(800);
    await p.evaluate(() => {
      (window as JanelaDeTeste).__sxFasesAntes = [];
      history.back();
    });
    await p.waitForURL((u) => new URL(u).pathname === "/");
    await p.waitForTimeout(1000);
    const seq = await fases(p);
    const y = await p.evaluate(() => window.scrollY);
    const vaiEVolta = seq.some((f, i) => f === "saindo" && seq.slice(i + 1).includes("entrando"));
    if (rolada) {
      ok(
        Math.abs(y - yHome) < 2 && !vaiEVolta && seq.join() === "dentro",
        `voltar (client-side) do case para a home rolada: o pet fica, sem começar a sair — rolagem ${Math.round(y)} (era ${Math.round(yHome)}); ${seq.join(" → ")}`,
      );
    } else {
      ok(
        y === 0 && !vaiEVolta && seq.join() === "dentro,saindo,fora",
        `voltar (client-side) do case para a home no topo: o pet sai uma vez só — rolagem ${Math.round(y)}; ${seq.join(" → ")}`,
      );
    }
    await c.close();
  }

  // Página aberta já rolada: entra COM teletransporte assim que a cena fica pronta.
  {
    const c = await browser.newContext({ viewport: { width: w, height: h } });
    await modoTeste(c);
    await gravarFases(c);
    const p = await c.newPage();
    await p.goto(`${BASE}/#projects`, { waitUntil: "load" });
    await esperarCena(p);
    let chegou = true;
    try {
      await p.locator('[data-pet][data-teleporte="dentro"]').waitFor({ timeout: 2000 });
    } catch {
      chegou = false;
    }
    const seq = await fases(p);
    ok(
      chegou && seq.includes("entrando"),
      `já rolada (/#projects): o pet entra com teletransporte em até 2 s — ${seq.join(" → ")}`,
    );
    await c.close();
  }

  // Case aberto direto: o pet é o de sempre, nunca passa por outra fase.
  {
    const c = await browser.newContext({ viewport: { width: w, height: h } });
    await modoTeste(c);
    await gravarFases(c);
    const p = await c.newPage();
    await p.goto(`${BASE}/projetos/tecna-site`, { waitUntil: "networkidle" });
    await p.locator("[data-pet] button").waitFor({ timeout: 15000 });
    await p.mouse.wheel(0, 1200);
    await p.waitForTimeout(1000);
    const seq = await fases(p);
    ok(seq.join() === "dentro", `/projetos/tecna-site direto: o pet só tem a fase dentro — ${seq.join(" → ")}`);
    const nDireto = await entradasCss(p);
    ok(nDireto === 1, `/projetos/tecna-site direto: a .pet-entra toca uma vez, como antes — ${nDireto}`);
    await c.close();
  }
}

/**
 * Correções da revisão final: canvas sem escala presa (I1), botão só com a
 * cena desenhada (T8), desvio de controles (I2), janelas da mesa contidas
 * (I3). Os prints vão para OUT/final-*.
 */
async function correcoesFinais(browser: Browser) {
  // I1 + T8: cinco cargas frescas, sem rolar nada. As duas últimas passam
  // pelo Boot (sessão nova), as de índice ímpar em DPR 2. No topo da home o
  // pet está montado e com a cena pronta, mas fora de cena.
  for (let i = 0; i < 5; i++) {
    const dpr = i % 2 ? 2 : 1;
    const c = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: dpr,
    });
    if (i < 3) await modoTeste(c);
    const p = await c.newPage();
    await p.goto(`${BASE}/`, { waitUntil: "load" });
    await esperarCena(p);
    await p.waitForTimeout(700);
    const m = await p.evaluate(() => {
      const pet = document.querySelector<HTMLElement>("[data-pet]")!;
      const cv = pet.querySelector<HTMLCanvasElement>("canvas")!;
      const d = window.devicePixelRatio;
      return {
        css: [cv.offsetWidth, cv.offsetHeight],
        buffer: [cv.width / d, cv.height / d],
        rolou: window.scrollY,
        fase: pet.getAttribute("data-teleporte"),
        botao: !!pet.querySelector("button"),
        vis: getComputedStyle(pet).visibility,
      };
    });
    ok(
      m.css.join() === "150,150" && m.buffer.join() === "150,150" && m.rolou === 0,
      `carga ${i + 1} (dpr ${dpr}${i < 3 ? "" : ", com Boot"}): canvas 150×150 antes de rolar — css ${m.css.join("×")}, buffer/dpr ${m.buffer.join("×")}`,
    );
    ok(
      m.fase === "fora" && !m.botao && m.vis === "hidden",
      `carga ${i + 1}: no topo da home o pet está fora de cena, escondido e sem botão — fase ${m.fase}, ${m.vis}, botão ${m.botao}`,
    );
    await c.close();
  }

  // I2 (a): home no topo. Com a mesa à vista não há pet no canto: nenhum
  // botão, nenhum ícone coberto.
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
    const botoes = await p.locator("[data-pet] button").count();
    ok(
      total === 8 && nomes.length === 0 && botoes === 0,
      `${w}×${h} topo: sem pet no canto (${botoes} botão), nenhum dos ${total} ícones da mesa coberto${nomes.length ? " — cobertos: " + nomes.join(", ") : ""}`,
    );
    await p.screenshot({
      path: `${OUT}/final-icones-${w}x${h}.png`,
      clip: { x: w - 420, y: h - 420, width: 420, height: 420 },
    });

    // I3: em 1440×700 (mesa não sticky) o botão recebe o clique. Rolada até
    // ele entrar, que no topo ele não existe.
    if (w === 1440 && h === 700) {
      await cortinaEm(p, 20);
      let abriu = false;
      try {
        await p.locator("[data-pet] button").click({ timeout: 5000 });
        abriu = await p.locator("[data-pet-balao]").isVisible();
      } catch {}
      ok(abriu, "1440×700: com a home rolada até o pet entrar, o botão recebe o clique");
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
      await esperarCena(p);
      await p.evaluate(() => {
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await p.locator("[data-pet] button").waitFor({ timeout: 5000 });
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

  // Mesa intacta com o pet montado: 1366×650 (o caso do revisor). Arrasta o
  // Terminal, que fica na dobra em qualquer altura; depois ele responde e o
  // cursor da mesa continua o de pixel.
  {
    const w = 1366;
    const h = 650;
    const c = await browser.newContext({ viewport: { width: w, height: h } });
    await modoTeste(c);
    const p = await c.newPage();
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await assentar(p);
    const alca = p.locator('[data-janela="terminal"] .cursor-grab');
    const antes = (await alca.boundingBox())!;
    const de = { x: antes.x + 30, y: antes.y + antes.height / 2 };
    // Para cima e para a esquerda: o Terminal mora embaixo, perto da dobra,
    // e para baixo os limites da mesa o seguram.
    const para = { x: Math.max(60, de.x - 260), y: Math.max(80, de.y - 140) };
    await p.mouse.move(de.x, de.y);
    await p.mouse.down();
    for (let i = 1; i <= 20; i++) {
      await p.mouse.move(de.x + ((para.x - de.x) * i) / 20, de.y + ((para.y - de.y) * i) / 20);
    }
    await p.mouse.up();
    await p.waitForTimeout(600);
    const depois = (await alca.boundingBox())!;
    ok(
      Math.abs(depois.x - antes.x) > 50 && Math.abs(depois.y - antes.y) > 50,
      `${w}×${h}: arrastar o Terminal da mesa continua funcionando — (${Math.round(antes.x)}, ${Math.round(antes.y)}) → (${Math.round(depois.x)}, ${Math.round(depois.y)})`,
    );
    await p.screenshot({ path: `${OUT}/final-arrasto-${w}x${h}.png` });

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

  // Movimento reduzido: sem teletransporte. Ele só aparece e some, e nenhuma
  // parte do efeito ganha animação.
  {
    const c = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      reducedMotion: "reduce",
    });
    await modoTeste(c);
    const p = await c.newPage();
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await assentar(p);
    // Mede dentro da página: o ida-e-volta do Playwright comeria os 150 ms.
    const rolarAte = (topo: number, alvo: string) =>
      p.evaluate(
        async ([t, f]) => {
          document.documentElement.style.scrollBehavior = "auto";
          const pet = document.querySelector("[data-pet]")!;
          const cortina = document.querySelector("[data-cortina]")!.getBoundingClientRect();
          const t0 = performance.now();
          window.scrollTo(0, window.scrollY + cortina.top - t);
          while (pet.getAttribute("data-teleporte") !== f && performance.now() - t0 < 1000) {
            await new Promise(requestAnimationFrame);
          }
          const ms = performance.now() - t0;
          // CSSTransition não conta: com movimento reduzido o globals.css põe
          // `transition-duration: 0.01ms` em TUDO, e como `transition-property`
          // nasce `all`, a troca de `visibility` herdada vira uma transição de
          // 0.01 ms em cada filho. Não é teletransporte; o que não pode existir
          // é a animação dele (Web Animations).
          const animadas = [...pet.querySelectorAll("[data-teleporte-parte]")].filter(
            (el) => el.getAnimations().some((a) => !(a instanceof CSSTransition)),
          ).length;
          return { ms, fase: pet.getAttribute("data-teleporte"), animadas };
        },
        [topo, alvo] as const,
      );
    const entra = await rolarAte(20, "dentro");
    ok(
      entra.fase === "dentro" && entra.ms <= 150 && entra.animadas === 0,
      `movimento reduzido: entra direto, sem animação — ${entra.fase} em ${Math.round(entra.ms)} ms, ${entra.animadas} parte(s) animada(s)`,
    );
    await p.waitForTimeout(300);
    const sai = await rolarAte(120, "fora");
    ok(
      sai.fase === "fora" && sai.ms <= 150 && sai.animadas === 0,
      `movimento reduzido: sai direto, sem animação — ${sai.fase} em ${Math.round(sai.ms)} ms, ${sai.animadas} parte(s) animada(s)`,
    );
    const m = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector("[data-pet]")!).transitionDuration));
    ok(m < 0.001, `movimento reduzido: o desvio não tem transição — ${m}s`);
    await c.close();
  }
}

/**
 * Ruído conhecido do `next dev`: o Boot marca `data-boot` no <html> antes da
 * hidratação e o React de desenvolvimento reclama do atributo que o servidor
 * não mandou. Acontece também na main e some no `next start`, onde a
 * verificação final roda. Só esta mensagem é ignorada; qualquer outro erro
 * de console reprova.
 */
const RUIDO_DEV = (texto: string) => texto.includes("data-boot");

/**
 * O vídeo do teletransporte, para mostrar: 1 s no topo da home, a rodinha
 * descendo (120 px a cada 50 ms) até o SOUZXXX passar da MenuBar, 1,5 s
 * parado e a rodinha de volta ao topo. Sem `modoTeste`: o sono de 1,5 s
 * faria o pet cochilar na pausa. Vira GIF se houver ffmpeg no PATH.
 */
async function videoTeleporte(browser: Browser) {
  const tamanho = { width: 1512, height: 982 };
  const ctx = await browser.newContext({ viewport: tamanho, recordVideo: { dir: OUT, size: tamanho } });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("sx-boot", "1");
    } catch {}
  });
  await gravarFases(ctx);
  const p = await ctx.newPage();
  const t0 = Date.now();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await esperarCena(p);
  // A entrada das janelas da mesa acaba antes do vídeo começar a valer.
  await p.evaluate(async () => {
    await document.fonts.ready;
    const a = document.getAnimations().filter((x) => {
      const alvo = (x.effect as KeyframeEffect | null)?.target;
      return alvo instanceof Element && alvo.classList.contains("janela-entra");
    });
    await Promise.all(a.map((x) => x.finished.catch(() => undefined)));
  });
  const inicio = (Date.now() - t0) / 1000;
  const topoCortina = () => p.evaluate(() => document.querySelector("[data-cortina]")!.getBoundingClientRect().top);
  // A rodinha vale para o que está debaixo do mouse: aqui ele fica sobre o
  // LEIA-ME, que não rola por dentro, então a página inteira rola.
  await p.mouse.move(tamanho.width * 0.42, tamanho.height * 0.5);
  await p.waitForTimeout(1000);

  let passos = 0;
  while ((await topoCortina()) > 0 && passos < 200) {
    await p.mouse.wheel(0, 120);
    await p.waitForTimeout(50);
    passos++;
  }
  const passou = (await topoCortina()) <= 0;
  ok(passou, `vídeo: a rodinha passa o SOUZXXX da MenuBar (${passos} passos)`);
  await p.waitForTimeout(1500);
  const dentro = await fase(p);

  let volta = 0;
  while ((await p.evaluate(() => window.scrollY)) > 0 && volta < 200) {
    await p.mouse.wheel(0, -120);
    await p.waitForTimeout(50);
    volta++;
  }
  await p.waitForTimeout(1200);
  const seq = await fases(p);
  ok(
    dentro === "dentro" && seq.join() === "fora,entrando,dentro,saindo,fora",
    `vídeo: o pet entra e sai com o teletransporte — parado ${dentro}; ${seq.join(" → ")}`,
  );
  console.log(`  roteiro de ${((Date.now() - t0) / 1000 - inicio).toFixed(1)} s (${passos} passos para baixo, ${volta} para cima)`);

  const gravado = await p.video()?.path();
  await ctx.close();
  if (!gravado) {
    ok(false, "vídeo do teletransporte gravado");
    return;
  }
  const webm = `${OUT}/teleporte.webm`;
  await rename(gravado, webm);
  console.log(`  vídeo em ${webm}`);
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
  } catch {
    console.log("  sem ffmpeg no PATH: fica só o .webm");
    return;
  }
  // O site é quase 1-bit: 32 cores sem pontilhado e só o retângulo que muda
  // a cada quadro deixam o GIF em ~4 MB em vez de ~9 MB, sem perda visível.
  const gif = `${OUT}/teleporte.gif`;
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-ss",
      inicio.toFixed(2),
      "-i",
      webm,
      "-vf",
      "fps=20,scale=900:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=32:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle",
      gif,
    ],
    { stdio: "inherit" },
  );
  console.log(`  GIF em ${gif} (${((await stat(gif)).size / 1e6).toFixed(1)} MB)`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ args: GL });

  // 1. Desktop pt
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await modoTeste(ctx);
  const page = await ctx.newPage();
  const erros: string[] = [];
  let ruidoDev = 0;
  page.on("pageerror", (e) => erros.push(String(e)));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    if (RUIDO_DEV(m.text())) ruidoDev++;
    else erros.push(m.text());
  });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const pet = page.locator("[data-pet]");
  await pet.waitFor({ state: "attached", timeout: 15000 });
  await esperarCena(page);
  // O pet só existe na home depois do SOUZXXX.
  await cortinaEm(page, 0);
  await pet.locator("button").waitFor({ timeout: 5000 });
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

  // Saindo de cena com o balão aberto, o balão vai junto.
  await pet.locator("button").click();
  await cortinaEm(page, 120);
  ok((await balao.count()) === 0, "o balão fecha quando o pet sai de cena");

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
  console.log(`  ruído \`data-boot\` do next dev ignorado: ${ruidoDev} mensagem(ns)`);

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
  await pe.locator("[data-pet]").waitFor({ state: "attached", timeout: 15000 });
  await esperarCena(pe);
  await cortinaEm(pe, 0);
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
  await pr.locator("[data-pet]").waitFor({ state: "attached", timeout: 15000 });
  await pr.mouse.move(100, 100);
  await pr.mouse.wheel(0, 2500);
  await pr.waitForTimeout(60);
  const rot = await pr.evaluate(
    () => (window as Window & { __sxPet?: { rot: { x: number; y: number } } }).__sxPet?.rot,
  );
  ok(!!rot && Math.abs(rot.x) < 1e-6 && Math.abs(rot.y) < 1e-6, "reduzir movimento: corpo parado");
  await red.close();

  await teletransporte(browser);
  await correcoesFinais(browser);
  console.log("\nvídeo do teletransporte");
  await videoTeleporte(browser);
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
