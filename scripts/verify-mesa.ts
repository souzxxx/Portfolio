/**
 * Verificação da mesa (o hero) num navegador de verdade.
 *
 * Mede as janelas pelo `data-janela` do wrapper e confere a escadinha da
 * coluna do meio: nenhuma janela por cima de outra na disposição inicial e,
 * quando a mesa é sticky (≥ 1024 × 760), RENDER, TERMINAL e AGORA inteiros
 * dentro dela — a mesa tem `overflow-hidden`, o que passa do fim some.
 *
 * Depois confere o Mac em ASCII atrás das janelas pelo `__sxMacAscii`, que o
 * MacAscii só expõe com `__sxMesaTeste`: os olhos em repouso à vista em todo
 * tamanho (e pintados de fato no canvas), o Mac fora da coluna de ícones e
 * dos rótulos, o laço rodando, o clique na mesa
 * vazia fazendo ele pular sem roubar o clique das janelas, o custo por
 * quadro, o resize de 1512 para 1024 (e de volta a 1920, com as janelas
 * voltando à escadinha) e o modo sem movimento. O laço para quando o SOUZXXX
 * cobre a mesa e volta quando ele desce; numa tela de toque, rolar a partir
 * da mesa não faz o Mac pular, e um toque faz. Grava um vídeo de ~8 s (e um
 * GIF, se houver ffmpeg).
 *
 * A escadinha e o Mac em todos os tamanhos rodam em cada rota de MESA_PATHS
 * (padrão `/,/en`): o AGORA em inglês quebra em outras linhas e muda a altura
 * da coluna do meio. O resto roda em `/`.
 *
 * Todo erro de página (`pageerror`) e todo `console.error`, de qualquer
 * contexto, reprova. Sem filtro: a verificação roda no `next start`, onde o
 * aviso de `data-boot` do React de desenvolvimento não existe.
 *
 * Uso: `next start` (ou `npm run dev`) em outro terminal e
 *   MESA_BASE_URL=http://localhost:3000 npx tsx scripts/verify-mesa.ts
 *
 * Os prints vão para MESA_OUT (padrão /tmp/mesa). Sai com código 1 se algum
 * check falhar.
 */
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdir, rename, stat } from "node:fs/promises";

const BASE = process.env.MESA_BASE_URL ?? "http://localhost:3000";
const OUT = process.env.MESA_OUT ?? "/tmp/mesa";
const CAMINHOS = (process.env.MESA_PATHS ?? "/,/en").split(",").filter(Boolean);
const GL = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
/** A linha da MenuBar, a mesma do gatilho do pet (components/pet/teleporte.ts). */
const LIMIAR_PX = 28;

/** Do notebook pequeno ao monitor 2K; 1280×720 é o único abaixo do sticky. */
const TAMANHOS = [
  [1024, 768],
  [1280, 720],
  [1280, 800],
  [1366, 768],
  [1440, 900],
  [1512, 982],
  [1680, 1050],
  [1920, 1080],
  [2560, 1440],
] as const;

/** As janelas que a mesa abre sozinha; a lixeira só abre no clique. */
const JANELAS_INICIAIS = ["leiame", "render", "terminal", "agora"];
const COLUNA_DO_MEIO = ["render", "terminal", "agora"];

/** DOMRect achatado: o DOMRect de verdade não atravessa o `evaluate`. */
type Caixa = Pick<DOMRect, "x" | "y" | "width" | "height" | "top" | "right" | "bottom" | "left">;

/** O gancho de teste do MacAscii. Os olhos vêm em coordenadas da viewport. */
type Olho = { x: number; y: number; width: number; height: number };
type MacTeste = { olhos: { esq: Olho; dir: Olho }; mac: Olho; quadros: number; msMedio: number; pulos: number };
type JanelaComMac = Window & { __sxMacAscii?: MacTeste };

let falhas = 0;
export function ok(cond: boolean, msg: string) {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
}

/** Os erros de todas as páginas de todos os contextos; o fim do main reprova se houver. */
const erros: string[] = [];
function colherErros(ctx: BrowserContext) {
  ctx.on("page", (p) => {
    p.on("pageerror", (e) => erros.push(`${p.url()} pageerror: ${e.message}`));
    p.on("console", (m) => {
      if (m.type() === "error") erros.push(`${p.url()} console.error: ${m.text()}`);
    });
  });
}

/** Todo contexto deste script passa por aqui, e é aqui que os erros são colhidos. */
export async function modoTeste(ctx: BrowserContext) {
  colherErros(ctx);
  await ctx.addInitScript(() => {
    (window as Window & { __sxMesaTeste?: boolean }).__sxMesaTeste = true;
    try {
      sessionStorage.setItem("sx-boot", "1");
    } catch {}
  });
}

/** Abre a home e espera a entrada das janelas acabar: durante a
 *  `.janela-entra` o transform desloca e encolhe os retângulos. As fontes
 *  entram na espera porque a quebra de linha do AGORA muda a altura dele. */
export async function assentarMesa(p: Page, caminho = "/") {
  await p.goto(`${BASE}${caminho}`, { waitUntil: "networkidle" });
  await p.evaluate(async () => {
    await document.fonts.ready;
    const a = document.getAnimations().filter((x) => {
      const alvo = (x.effect as KeyframeEffect | null)?.target;
      return alvo instanceof Element && alvo.classList.contains("janela-entra");
    });
    await Promise.all(a.map((x) => x.finished.catch(() => undefined)));
  });
  await p.waitForTimeout(200);
}

/** Retângulos da `section.mesa` e de cada `[data-janela]` visível. Sem
 *  função nomeada dentro do `evaluate`: o tsx embrulha nomes num `__name`
 *  que não existe na página. */
export async function retangulos(p: Page) {
  return p.evaluate(() => {
    const janelas: Record<string, Caixa> = {};
    for (const el of document.querySelectorAll<HTMLElement>("[data-janela]")) {
      const r = el.getBoundingClientRect().toJSON() as Caixa;
      if (r.width > 0 && r.height > 0) janelas[el.dataset.janela!] = r;
    }
    const mesa = document.querySelector("section.mesa")!.getBoundingClientRect().toJSON() as Caixa;
    return { mesa, janelas };
  });
}

function areaComum(a: Caixa, b: Caixa) {
  const largura = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const altura = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return Math.max(0, largura) * Math.max(0, altura);
}

const px = (n: number) => Math.round(n);
const resumo = (c: Caixa) => `${px(c.width)}×${px(c.height)} em (${px(c.left)}, ${px(c.top)})`;
const caixaDoOlho = (o: Olho): Caixa => ({
  x: o.x,
  y: o.y,
  width: o.width,
  height: o.height,
  left: o.x,
  top: o.y,
  right: o.x + o.width,
  bottom: o.y + o.height,
});

/** Uma cópia do gancho, ou null se o MacAscii não montou. */
async function lerMac(p: Page): Promise<MacTeste | null> {
  return p.evaluate(() => {
    const m = (window as JanelaComMac).__sxMacAscii;
    if (!m) return null;
    const { esq, dir } = m.olhos;
    const mac = m.mac;
    return {
      olhos: {
        esq: { x: esq.x, y: esq.y, width: esq.width, height: esq.height },
        dir: { x: dir.x, y: dir.y, width: dir.width, height: dir.height },
      },
      mac: { x: mac.x, y: mac.y, width: mac.width, height: mac.height },
      quadros: m.quadros,
      msMedio: m.msMedio,
      pulos: m.pulos,
    };
  });
}

/** Espera o chunk do MacAscii chegar e pintar o primeiro quadro. */
async function esperarMac(p: Page): Promise<MacTeste | null> {
  try {
    await p.waitForFunction(() => ((window as JanelaComMac).__sxMacAscii?.quadros ?? 0) > 0, null, {
      timeout: 10_000,
    });
  } catch {
    return null;
  }
  return lerMac(p);
}

/**
 * A coluna de ícones como ela aparece: o nav com tudo dentro, porque o rótulo
 * mais largo (CURRÍCULO.PDF) passa ~8 px de cada lado da caixa do nav.
 */
async function icones(p: Page): Promise<Caixa> {
  return p.evaluate(() => {
    const nav = document.querySelector("section.mesa nav")!;
    const r = nav.getBoundingClientRect();
    let [x0, y0, x1, y1] = [r.left, r.top, r.right, r.bottom];
    for (const el of nav.querySelectorAll("*")) {
      const q = el.getBoundingClientRect();
      if (!q.width || !q.height) continue;
      [x0, y0, x1, y1] = [Math.min(x0, q.left), Math.min(y0, q.top), Math.max(x1, q.right), Math.max(y1, q.bottom)];
    }
    return { x: x0, y: y0, width: x1 - x0, height: y1 - y0, left: x0, top: y0, right: x1, bottom: y1 };
  });
}

/**
 * As janelas como estão na tela: o filho do `[data-janela]`, o `motion.div`
 * que o framer move (no arraste e quando a tela muda de tamanho), com o
 * transform computado dele; o wrapper fica no lugar de layout. A lixeira fica
 * de fora: é um overlay do tamanho da mesa e começa fechada.
 */
async function janelasNaTela(p: Page): Promise<Record<string, { caixa: Caixa; transform: string }>> {
  return p.evaluate(() => {
    const r: Record<string, { caixa: Caixa; transform: string }> = {};
    for (const el of document.querySelectorAll<HTMLElement>("[data-janela]:not([data-janela=lixeira]) > *")) {
      const c = el.getBoundingClientRect().toJSON() as Caixa;
      if (c.width > 0 && c.height > 0) r[el.parentElement!.dataset.janela!] = { caixa: c, transform: getComputedStyle(el).transform };
    }
    return r;
  });
}

/** O que pode cobrir os olhos: as janelas abertas na tela, os ícones e a MenuBar. */
async function obstaculos(p: Page): Promise<Record<string, Caixa>> {
  const r: Record<string, Caixa> = {};
  for (const [id, j] of Object.entries(await janelasNaTela(p))) r[id] = j.caixa;
  const barra = await p.evaluate(() => document.querySelector("header.fixed")?.getBoundingClientRect().toJSON() as Caixa | undefined);
  if (barra) r.menubar = barra;
  return { ...r, icones: await icones(p) };
}

/** `none` ou uma matriz 2D sem escala, giro nem deslocamento: o arraste zerado. */
function semDeslocamento(t: string) {
  if (t === "none") return true;
  const m = /^matrix\(([^)]+)\)$/.exec(t);
  if (!m) return false;
  const [a, b, c, d, e, f] = m[1].split(",").map(Number);
  const zero = (v: number, tol = 1e-6) => Math.abs(v) < tol;
  return zero(a - 1) && zero(b) && zero(c) && zero(d - 1) && zero(e, 0.5) && zero(f, 0.5);
}

/**
 * Depois de um resize do navegador as janelas voltam à escadinha: o framer
 * reescalona por conta própria a posição de tudo que arrasta dentro dos
 * `dragConstraints`, até de janela que ninguém tocou. Mede o que o framer move
 * — nenhuma janela sobre outra, a coluna do meio inteira na mesa sticky, o
 * LEIA-ME abaixo da MenuBar e o transform de cada uma zerado.
 */
async function checarEscadinhaNaTela(p: Page, rotulo: string) {
  const { mesa } = await retangulos(p);
  const [w, h] = await p.evaluate(() => [innerWidth, innerHeight]);
  const janelas = await janelasNaTela(p);
  const ids = Object.keys(janelas);
  for (const id of ids) console.log(`  ${id.padEnd(8)} na tela ${resumo(janelas[id].caixa)} · transform ${janelas[id].transform}`);

  const faltam = JANELAS_INICIAIS.filter((id) => !janelas[id]);
  ok(faltam.length === 0, `${rotulo}: as quatro janelas medidas na tela${faltam.length ? " — faltam: " + faltam.join(", ") : ""}`);

  const cruzam: string[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const area = areaComum(janelas[ids[i]].caixa, janelas[ids[j]].caixa);
      if (area > 1) cruzam.push(`${ids[i]} × ${ids[j]} (${px(area)} px²)`);
    }
  }
  ok(cruzam.length === 0, `${rotulo}: nenhuma janela sobre outra na tela${cruzam.length ? " — cruzam: " + cruzam.join(", ") : ""}`);

  if (w >= 1024 && h >= 760) {
    const vazam = COLUNA_DO_MEIO.filter((id) => janelas[id])
      .map((id) => {
        const c = janelas[id].caixa;
        const fora = [
          mesa.top - c.top > 0.5 && `sobe ${px(mesa.top - c.top)} px`,
          c.bottom - mesa.bottom > 0.5 && `passa ${px(c.bottom - mesa.bottom)} px do fim`,
          mesa.left - c.left > 0.5 && `sai ${px(mesa.left - c.left)} px à esquerda`,
          c.right - mesa.right > 0.5 && `sai ${px(c.right - mesa.right)} px à direita`,
        ].filter(Boolean);
        return fora.length ? `${id} ${fora.join(", ")}` : null;
      })
      .filter((x): x is string => x !== null);
    ok(vazam.length === 0, `${rotulo} (sticky): RENDER, TERMINAL e AGORA na tela dentro da mesa${vazam.length ? " — " + vazam.join("; ") : ""}`);
  }

  const leiame = janelas.leiame?.caixa;
  ok(!!leiame && leiame.top >= 28, `${rotulo}: o LEIA-ME fica abaixo da MenuBar (topo ${leiame ? px(leiame.top) : "?"} px, mínimo 28)`);

  const deslocadas = ids.filter((id) => !semDeslocamento(janelas[id].transform));
  ok(
    deslocadas.length === 0,
    `${rotulo}: o arraste de toda janela volta a zero${deslocadas.length ? " — deslocadas: " + deslocadas.map((id) => `${id} (${janelas[id].transform})`).join(", ") : ""}`,
  );
}

/** Os dois olhos em repouso dentro da mesa e sem nada por cima. */
async function checarOlhos(p: Page, rotulo: string) {
  const mac = await lerMac(p);
  if (!mac) {
    ok(false, `${rotulo}: \`__sxMacAscii\` ausente`);
    return;
  }
  const { mesa } = await retangulos(p);
  const obst = await obstaculos(p);
  for (const lado of ["esq", "dir"] as const) {
    const o = caixaDoOlho(mac.olhos[lado]);
    const dentro = o.left >= mesa.left && o.right <= mesa.right && o.top >= mesa.top && o.bottom <= mesa.bottom;
    const cruza = Object.entries(obst)
      .filter(([, c]) => areaComum(o, c) > 0)
      .map(([id]) => id);
    ok(
      dentro && cruza.length === 0,
      `${rotulo}: olho ${lado} ${resumo(o)} à vista${dentro ? "" : " — fora da mesa"}${cruza.length ? " — atrás de: " + cruza.join(", ") : ""}`,
    );
  }
}

/**
 * Fração de cada retângulo de olho com tinta forte no canvas do Mac. Garante
 * que o gancho aponta para onde o rosto está desenhado de verdade (DPR,
 * origem da mesa). Algumas tentativas: uma piscada de 0.13 s fecha os olhos.
 */
async function tintaNosOlhos(p: Page): Promise<number[]> {
  let melhor = [0, 0];
  for (let k = 0; k < 6; k++) {
    const f = await p.evaluate(() => {
      const cv = document.querySelector<HTMLCanvasElement>("canvas[data-mac-ascii]");
      const m = (window as JanelaComMac).__sxMacAscii;
      const g = cv?.getContext("2d");
      if (!cv || !m || !g) return [0, 0];
      const r = cv.getBoundingClientRect();
      const kx = cv.width / r.width;
      const ky = cv.height / r.height;
      return [m.olhos.esq, m.olhos.dir].map((o) => {
        const w = Math.max(1, Math.round(o.width * kx));
        const h = Math.max(1, Math.round(o.height * ky));
        const d = g.getImageData(Math.round((o.x - r.left) * kx), Math.round((o.y - r.top) * ky), w, h).data;
        let fortes = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] > 180) fortes++;
        return fortes / (w * h);
      });
    });
    melhor = melhor.map((v, i) => Math.max(v, f[i]));
    if (melhor.every((v) => v > 0.25)) break;
    await p.waitForTimeout(150);
  }
  return melhor;
}

/**
 * As células acesas do Mac não cruzam a coluna de ícones com os rótulos.
 * Três leituras ao longo de ~0.5 s: o balanço e a respiração mexem a borda.
 */
async function checarIcones(p: Page, rotulo: string) {
  const nav = await icones(p);
  let pior = Infinity;
  let cruzou = false;
  for (let k = 0; k < 3; k++) {
    const mac = (await lerMac(p))?.mac;
    if (!mac || mac.width === undefined) {
      ok(false, `${rotulo}: caixa do Mac ausente no gancho`);
      return;
    }
    const c = caixaDoOlho(mac);
    pior = Math.min(pior, nav.left - c.right);
    if (areaComum(c, nav) > 0) cruzou = true;
    if (k < 2) await p.waitForTimeout(250);
  }
  ok(!cruzou, `${rotulo}: o Mac fica fora da coluna de ícones e dos rótulos (menor folga ${px(pior)} px)`);
}

async function checarTinta(p: Page, rotulo: string) {
  const f = await tintaNosOlhos(p);
  ok(
    f.every((v) => v > 0.25),
    `${rotulo}: os olhos estão pintados onde o gancho diz (${f.map((v) => `${Math.round(v * 100)}%`).join(" / ")} do retângulo aceso)`,
  );
}

/** O meio da faixa livre entre o RENDER e o TERMINAL. */
async function meioDaFaixa(p: Page) {
  const { janelas } = await retangulos(p);
  const r = janelas.render;
  const t = janelas.terminal;
  return {
    x: (Math.min(r.left, t.left) + Math.max(r.right, t.right)) / 2,
    y: (r.bottom + t.top) / 2,
    altura: t.top - r.bottom,
  };
}

async function pulos(p: Page) {
  return (await lerMac(p))?.pulos ?? -1;
}

async function clicarEContar(p: Page, x: number, y: number) {
  const antes = await pulos(p);
  await p.mouse.click(x, y);
  await p.waitForTimeout(120);
  return { antes, depois: await pulos(p) };
}

/** 1512×982: laço, cliques, arraste, terminal e custo por quadro. */
async function vivo(browser: Browser) {
  const [w, h] = [1512, 982];
  const rotulo = `${w}×${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await modoTeste(ctx);
  const p = await ctx.newPage();
  await assentarMesa(p);
  if (!(await esperarMac(p))) {
    ok(false, `${rotulo}: \`__sxMacAscii\` ausente`);
    await ctx.close();
    return;
  }

  // (a) o laço roda
  const q0 = (await lerMac(p))!.quadros;
  await p.waitForTimeout(500);
  const q1 = (await lerMac(p))!.quadros;
  await p.waitForTimeout(500);
  const q2 = (await lerMac(p))!.quadros;
  ok(q0 < q1 && q1 < q2, `${rotulo}: o laço roda (quadros ${q0} → ${q1} → ${q2})`);

  // (d) custo de um quadro inteiro (cena + pintura)
  const ms = (await lerMac(p))!.msMedio;
  console.log(`  msMedio ${ms.toFixed(2)} ms em ${q2} quadros`);
  ok(ms < 10, `${rotulo}: msMedio < 10 ms (${ms.toFixed(2)} ms)`);

  // (b) clique na mesa vazia pula; nas janelas e nos ícones, não
  const faixa = await meioDaFaixa(p);
  const alvoFaixa = await p.evaluate(
    ({ x, y }) => !document.elementFromPoint(x, y)?.closest("[data-janela], nav"),
    faixa,
  );
  ok(faixa.altura > 0 && alvoFaixa, `${rotulo}: há faixa livre entre RENDER e TERMINAL (${px(faixa.altura)} px)`);
  const naFaixa = await clicarEContar(p, faixa.x, faixa.y);
  ok(naFaixa.depois === naFaixa.antes + 1, `${rotulo}: clique na faixa faz o Mac pular (pulos ${naFaixa.antes} → ${naFaixa.depois})`);

  const nome = (await p.locator("#hero-nome").boundingBox())!;
  const noLeiame = await clicarEContar(p, nome.x + nome.width / 2, nome.y + nome.height / 2);
  ok(noLeiame.depois === noLeiame.antes, `${rotulo}: clique dentro do LEIA-ME não faz pular (pulos ${noLeiame.antes} → ${noLeiame.depois})`);

  const lixeira = (await p.locator("section.mesa nav button").boundingBox())!;
  const naLixeira = await clicarEContar(p, lixeira.x + lixeira.width / 2, lixeira.y + lixeira.height / 2);
  ok(naLixeira.depois === naLixeira.antes, `${rotulo}: clique no ícone da lixeira não faz pular (pulos ${naLixeira.antes} → ${naLixeira.depois})`);
  const abriu = await p.locator('[data-janela="lixeira"] [role="dialog"]').isVisible();
  ok(abriu, `${rotulo}: o ícone da lixeira ainda abre a lixeira`);
  if (abriu) {
    await p.locator('[data-janela="lixeira"] button').first().click();
    await p.waitForTimeout(150);
  }

  // (c) arrastar o TERMINAL pela alça (a conta do verify-pet) e o terminal
  // responder; o Mac não acompanha a janela nem pula com o arraste
  const alca = p.locator('[data-janela="terminal"] .cursor-grab');
  const antes = (await alca.boundingBox())!;
  const olhosAntes = (await lerMac(p))!.olhos;
  const pulosAntes = await pulos(p);
  await p.mouse.move(antes.x + 30, antes.y + antes.height / 2);
  await p.mouse.down();
  for (let i = 1; i <= 20; i++) {
    await p.mouse.move(
      antes.x + 30 + ((w - 260 - antes.x) * i) / 20,
      antes.y + antes.height / 2 + ((h - 120 - antes.y) * i) / 20,
    );
  }
  await p.mouse.up();
  await p.waitForTimeout(400);
  const depois = (await alca.boundingBox())!;
  ok(
    Math.abs(depois.x - antes.x) > 50 && Math.abs(depois.y - antes.y) > 50,
    `${rotulo}: arrastar o TERMINAL pela alça funciona (andou ${px(depois.x - antes.x)}, ${px(depois.y - antes.y)})`,
  );
  const macDepois = (await lerMac(p))!;
  const parado = (["esq", "dir"] as const).every(
    (k) =>
      Math.abs(macDepois.olhos[k].x - olhosAntes[k].x) < 0.5 &&
      Math.abs(macDepois.olhos[k].y - olhosAntes[k].y) < 0.5,
  );
  ok(parado && macDepois.pulos === pulosAntes, `${rotulo}: o Mac não segue a janela arrastada nem pula com o arraste`);

  await p.locator("#sx-terminal").fill("help");
  const textoDoTerminal = () =>
    p.locator("#sx-terminal").evaluate((el) => (el.closest("form")!.parentElement!.textContent ?? "").length);
  const antesTxt = await textoDoTerminal();
  await p.locator("#sx-terminal").press("Enter");
  await p.waitForTimeout(200);
  const depoisTxt = await textoDoTerminal();
  ok(depoisTxt > antesTxt + 20, `${rotulo}: o terminal da mesa responde a \`help\``);
  await ctx.close();
}

/** Review Focus 1: a janela do navegador encolhe de 1512 para 1024 com o hero
 *  na tela. As janelas voltam à escadinha, o Mac reancora, a grade é recriada
 *  e os olhos seguem à vista. Depois, com o TERMINAL arrastado, a janela cresce
 *  para 1920 e a escadinha volta de novo. */
async function resize(browser: Browser) {
  const ctx = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  await modoTeste(ctx);
  const p = await ctx.newPage();
  await assentarMesa(p);
  if (!(await esperarMac(p))) {
    ok(false, "1512→1024: `__sxMacAscii` ausente");
    await ctx.close();
    return;
  }
  await p.setViewportSize({ width: 1024, height: 768 });
  await p.waitForTimeout(800);
  await checarEscadinhaNaTela(p, "1512→1024");
  const { janelas } = await retangulos(p);
  const andaram = await obstaculos(p);
  for (const id of ["leiame", "render", "terminal", "agora"]) {
    if (janelas[id] && andaram[id]) console.log(`  ${id.padEnd(8)} layout ${resumo(janelas[id])} · na tela ${resumo(andaram[id])}`);
  }
  await checarOlhos(p, "1512→1024");
  await checarTinta(p, "1512→1024");
  await checarIcones(p, "1512→1024");
  const c = await p.evaluate(() => {
    const cv = document.querySelector<HTMLCanvasElement>("canvas[data-mac-ascii]")!;
    const s = document.querySelector<HTMLElement>("section.mesa")!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    return { bw: cv.width, bh: cv.height, ew: Math.round(s.clientWidth * dpr), eh: Math.round(s.clientHeight * dpr) };
  });
  ok(
    Math.abs(c.bw - c.ew) <= 1 && Math.abs(c.bh - c.eh) <= 1,
    `1512→1024: o canvas foi recriado no tamanho novo (${c.bw}×${c.bh}, esperado ${c.ew}×${c.eh})`,
  );
  await p.screenshot({ path: `${OUT}/mac-resize-1024x768.png` });

  // Quem arrastou perde a arrumação no resize: o TERMINAL sai do lugar pela
  // alça e, quando a janela cresce, volta para a escadinha com as outras.
  const alca = p.locator('[data-janela="terminal"] .cursor-grab');
  const antes = (await alca.boundingBox())!;
  await p.mouse.move(antes.x + 30, antes.y + antes.height / 2);
  await p.mouse.down();
  for (let i = 1; i <= 20; i++) await p.mouse.move(antes.x + 30 - (220 * i) / 20, antes.y + antes.height / 2 - (140 * i) / 20);
  await p.mouse.up();
  await p.waitForTimeout(300);
  const depois = (await alca.boundingBox())!;
  ok(
    Math.abs(depois.x - antes.x) > 50 && Math.abs(depois.y - antes.y) > 50,
    `1024×768: arrastar o TERMINAL pela alça funciona antes do resize (andou ${px(depois.x - antes.x)}, ${px(depois.y - antes.y)})`,
  );
  await p.setViewportSize({ width: 1920, height: 1080 });
  await p.waitForTimeout(800);
  await checarEscadinhaNaTela(p, "1024→1920");
  await p.screenshot({ path: `${OUT}/mac-resize-1920x1080.png` });
  await ctx.close();
}

/** Sem movimento: um quadro parado, sem laço e sem ouvir o mouse. */
async function reduzido(browser: Browser) {
  const rotulo = "reduzido";
  const ctx = await browser.newContext({ viewport: { width: 1512, height: 982 }, reducedMotion: "reduce" });
  await modoTeste(ctx);
  const p = await ctx.newPage();
  await assentarMesa(p);
  if (!(await esperarMac(p))) {
    ok(false, `${rotulo}: \`__sxMacAscii\` ausente`);
    await ctx.close();
    return;
  }
  await checarOlhos(p, rotulo);
  await checarTinta(p, rotulo);
  const q0 = (await lerMac(p))!.quadros;
  await p.waitForTimeout(1000);
  const q1 = (await lerMac(p))!.quadros;
  ok(q0 === q1, `${rotulo}: nenhum quadro novo em 1 s (quadros ${q0} → ${q1})`);
  const faixa = await meioDaFaixa(p);
  const clique = await clicarEContar(p, faixa.x, faixa.y);
  ok(clique.depois === clique.antes, `${rotulo}: clique na faixa não faz pular (pulos ${clique.antes} → ${clique.depois})`);
  await p.screenshot({ path: `${OUT}/mac-reduzido.png` });
  await ctx.close();
}

/**
 * Rola até a borda de cima do SOUZXXX (`[data-cortina]`) ficar em `topo` px
 * da janela, sem a rolagem suave do site (a mesma conta do verify-pet).
 */
async function cortinaEm(p: Page, topo: number, espera = 400) {
  await p.evaluate((t) => {
    document.documentElement.style.scrollBehavior = "auto";
    const r = document.querySelector("[data-cortina]")!.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - t);
  }, topo);
  if (espera) await p.waitForTimeout(espera);
}

/** Quantos quadros o laço pinta em `ms`. No headless, com o swiftshader e o
 *  pet dividindo a CPU, são ~8 a 30 por segundo: "roda" é pelo menos 2 (um
 *  quadro solto poderia ser uma remedida do ResizeObserver). */
async function quadrosEm(p: Page, ms: number) {
  const antes = (await lerMac(p))!.quadros;
  await p.waitForTimeout(ms);
  return (await lerMac(p))!.quadros - antes;
}

/**
 * Com o SOUZXXX na MenuBar a mesa está coberta e o Mac fora de cena (spec
 * §5.1): o laço para, mesmo com a section ainda cruzando a viewport (no
 * sticky, por mais ~300–420 px; fora dele, pela faixa atrás da MenuBar), e
 * volta quando o SOUZXXX desce de novo.
 */
async function coberta(browser: Browser, w: number, h: number) {
  const rotulo = `${w}×${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await modoTeste(ctx);
  const p = await ctx.newPage();
  await assentarMesa(p);
  if (!(await esperarMac(p))) {
    ok(false, `${rotulo}: \`__sxMacAscii\` ausente`);
    await ctx.close();
    return;
  }
  await cortinaEm(p, 200);
  const aVista = await quadrosEm(p, 500);
  ok(aVista >= 2, `${rotulo}: com o SOUZXXX a 200 px a mesa aparece e o laço roda (${aVista} quadros em 0.5 s)`);

  await cortinaEm(p, 20);
  const mesa = (await retangulos(p)).mesa;
  ok(mesa.bottom > 0, `${rotulo}: com o SOUZXXX a 20 px a section ainda cruza a viewport (fundo em ${px(mesa.bottom)} px) — o caso que o IntersectionObserver não pega`);
  const cobertos = await quadrosEm(p, 600);
  ok(cobertos === 0, `${rotulo}: com o SOUZXXX a 20 px (≤ ${LIMIAR_PX}) o laço para (${cobertos} quadros em 0.6 s)`);

  await cortinaEm(p, LIMIAR_PX + 10);
  const deVolta = await quadrosEm(p, 500);
  ok(deVolta >= 2, `${rotulo}: com o SOUZXXX de volta abaixo da linha (${LIMIAR_PX + 10} px) o laço volta (${deVolta} quadros em 0.5 s)`);
  await ctx.close();
}

/**
 * Numa tela de toque ≥ 1024 px (o iPad deitado) rolar a página com o dedo
 * na mesa não é clique na mesa vazia: o Mac não pula. Um toque, sim; um
 * toque numa janela, não. A rolagem é um arraste de toque de verdade pelo
 * CDP: o `pointerdown` sai no começo, como no aparelho, e o `click` não.
 */
async function toque(browser: Browser) {
  const [w, h] = [1366, 1024];
  const rotulo = `toque ${w}×${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true });
  await modoTeste(ctx);
  const p = await ctx.newPage();
  await assentarMesa(p);
  if (!(await esperarMac(p))) {
    ok(false, `${rotulo}: \`__sxMacAscii\` ausente`);
    await ctx.close();
    return;
  }
  const faixa = await meioDaFaixa(p);
  const cdp = await ctx.newCDPSession(p);

  // Rolar com o dedo começando na faixa livre (antes de qualquer toque: um
  // pulo ainda no ar engoliria o aperto da rolagem e o teste passaria à toa).
  const antes = await pulos(p);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: faixa.x, y: faixa.y }] });
  for (let i = 1; i <= 10; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: faixa.x, y: faixa.y - i * 24 }] });
    await p.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await p.waitForTimeout(700);
  const rolou = await p.evaluate(() => window.scrollY);
  const depois = await pulos(p);
  ok(rolou > 0, `${rotulo}: o arraste do dedo rolou a página (${px(rolou)} px)`);
  ok(depois === antes, `${rotulo}: rolar com o dedo a partir da mesa não faz o Mac pular (pulos ${antes} → ${depois})`);

  await p.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(300);
  const t0 = await pulos(p);
  await p.touchscreen.tap(faixa.x, faixa.y);
  await p.waitForTimeout(700);
  const t1 = await pulos(p);
  ok(t1 === t0 + 1, `${rotulo}: um toque na faixa faz o Mac pular (pulos ${t0} → ${t1})`);

  const nome = (await p.locator("#hero-nome").boundingBox())!;
  await p.touchscreen.tap(nome.x + nome.width / 2, nome.y + nome.height / 2);
  await p.waitForTimeout(300);
  const t2 = await pulos(p);
  ok(t2 === t1, `${rotulo}: um toque dentro do LEIA-ME não faz pular (pulos ${t1} → ${t2})`);
  await ctx.close();
}

/** ~8 s de vídeo: o mouse passeia pela faixa, chega perto do Mac e clica
 *  duas vezes na mesa. Vira GIF se houver ffmpeg no PATH. */
async function video(browser: Browser) {
  const tamanho = { width: 1512, height: 982 };
  const ctx = await browser.newContext({ viewport: tamanho, recordVideo: { dir: OUT, size: tamanho } });
  await modoTeste(ctx);
  const p = await ctx.newPage();
  const t0 = Date.now();
  await assentarMesa(p);
  if (!(await esperarMac(p))) {
    ok(false, "vídeo: `__sxMacAscii` ausente");
    await ctx.close();
    await p.video()?.delete();
    return;
  }
  const inicio = (Date.now() - t0) / 1000;
  const faixa = await meioDaFaixa(p);
  const { janelas } = await retangulos(p);
  const olhos = (await lerMac(p))!.olhos;
  const rosto = { x: (olhos.esq.x + olhos.dir.x + olhos.dir.width) / 2, y: olhos.esq.y + olhos.esq.height / 2 };
  // pela faixa, da borda do LEIA-ME até a direita da coluna e de volta; no
  // headless cada `move` é uma ida e volta lenta, então poucos passos
  const esq = janelas.leiame.right + 10;
  const dir = Math.max(janelas.render.right, janelas.terminal.right) - 10;
  await p.waitForTimeout(500);
  await p.mouse.move(esq, faixa.y);
  await p.mouse.move(dir, faixa.y, { steps: 24 });
  await p.mouse.move(esq + 40, faixa.y - 12, { steps: 20 });
  // chega perto do rosto: os olhos ficam atentos
  await p.mouse.move(rosto.x, rosto.y + 30, { steps: 16 });
  await p.waitForTimeout(800);
  // dois cliques na mesa: um perto (susto e pulo) e outro na faixa
  await p.mouse.click(rosto.x, rosto.y + 30);
  await p.waitForTimeout(1000);
  await p.mouse.move(faixa.x, faixa.y, { steps: 10 });
  await p.mouse.click(faixa.x, faixa.y);
  await p.waitForTimeout(1400);
  console.log(`  roteiro de ${((Date.now() - t0) / 1000 - inicio).toFixed(1)} s`);
  const gravado = await p.video()?.path();
  await ctx.close();
  if (!gravado) {
    ok(false, "vídeo gravado");
    return;
  }
  const webm = `${OUT}/mac-ascii.webm`;
  await rename(gravado, webm);
  console.log(`  vídeo em ${webm}`);
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
  } catch {
    console.log("  sem ffmpeg no PATH: fica só o .webm");
    return;
  }
  const gif = `${OUT}/mac-ascii.gif`;
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
      "fps=15,scale=900:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse",
      gif,
    ],
    { stdio: "inherit" },
  );
  console.log(`  GIF em ${gif} (cortado em ${inicio.toFixed(2)} s, ${((await stat(gif)).size / 1e6).toFixed(1)} MB)`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ args: GL });

  for (const caminho of CAMINHOS) for (const [w, h] of TAMANHOS) {
    // `/` fica com o rótulo de sempre; as outras rotas levam o nome junto
    const rotulo = caminho === "/" ? `${w}×${h}` : `${caminho} ${w}×${h}`;
    const sufixo = caminho === "/" ? "" : caminho.replace(/\//g, "-");
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await modoTeste(ctx);
    const p = await ctx.newPage();
    await assentarMesa(p, caminho);
    const { mesa, janelas } = await retangulos(p);
    const ids = Object.keys(janelas);

    console.log(`\n${rotulo} — mesa ${resumo(mesa)}`);
    for (const id of ids) console.log(`  ${id.padEnd(8)} ${resumo(janelas[id])}`);

    // Sem isto, uma mesa sem `data-janela` passaria em tudo sem medir nada.
    const faltam = JANELAS_INICIAIS.filter((id) => !janelas[id]);
    ok(faltam.length === 0, `${rotulo}: as quatro janelas iniciais medidas${faltam.length ? " — faltam: " + faltam.join(", ") : ""}`);

    const cruzam: string[] = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const area = areaComum(janelas[ids[i]], janelas[ids[j]]);
        if (area > 1) cruzam.push(`${ids[i]} × ${ids[j]} (${px(area)} px²)`);
      }
    }
    ok(cruzam.length === 0, `${rotulo}: nenhuma janela sobre outra${cruzam.length ? " — cruzam: " + cruzam.join(", ") : ""}`);

    if (w >= 1024 && h >= 760) {
      const vazam = COLUNA_DO_MEIO.filter((id) => janelas[id])
        .map((id) => {
          const c = janelas[id];
          const acima = mesa.top - c.top;
          const abaixo = c.bottom - mesa.bottom;
          if (acima > 0) return `${id} sobe ${px(acima)} px`;
          if (abaixo > 0) return `${id} passa ${px(abaixo)} px do fim`;
          return null;
        })
        .filter((x): x is string => x !== null);
      ok(vazam.length === 0, `${rotulo} (sticky): RENDER, TERMINAL e AGORA cabem na mesa${vazam.length ? " — " + vazam.join(", ") : ""}`);
    }

    // O Mac: os olhos em repouso à vista e pintados onde o gancho diz.
    const mac = await esperarMac(p);
    ok(!!mac, `${rotulo}: \`__sxMacAscii\` ${mac ? "presente" : "ausente"}`);
    if (mac) {
      await checarOlhos(p, rotulo);
      await checarTinta(p, rotulo);
      await checarIcones(p, rotulo);
    }

    await p.screenshot({ path: `${OUT}/escadinha-${w}x${h}${sufixo}.png` });
    await ctx.close();
  }

  console.log("\n1512×982 — o Mac vivo");
  await vivo(browser);
  console.log("\nresize 1512 → 1024");
  await resize(browser);
  console.log("\nprefers-reduced-motion");
  await reduzido(browser);
  console.log("\no SOUZXXX cobre a mesa");
  await coberta(browser, 1512, 982);
  await coberta(browser, 1280, 720);
  console.log("\ntela de toque");
  await toque(browser);
  console.log("\nvídeo");
  await video(browser);

  await browser.close();

  console.log("\nerros de página");
  ok(erros.length === 0, `nenhum pageerror nem console.error em todos os contextos (${erros.length})${erros.length ? ":\n    " + erros.join("\n    ") : ""}`);

  if (falhas) {
    console.error(`\n${falhas} check(s) falharam`);
    process.exit(1);
  }
  console.log("\ntudo certo");
}

main();
