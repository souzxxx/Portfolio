/**
 * Verificação da mesa (o hero) num navegador de verdade.
 *
 * Mede as janelas pelo `data-janela` do wrapper e confere a escadinha da
 * coluna do meio: nenhuma janela por cima de outra na disposição inicial e,
 * quando a mesa é sticky (≥ 1024 × 760), RENDER, TERMINAL e AGORA inteiros
 * dentro dela — a mesa tem `overflow-hidden`, o que passa do fim some.
 *
 * Uso: `npm run dev` (ou `next start`) em outro terminal e
 *   MESA_BASE_URL=http://localhost:3000 npx tsx scripts/verify-mesa.ts
 *
 * Os prints vão para MESA_OUT (padrão /tmp/mesa). Sai com código 1 se algum
 * check falhar.
 */
import { chromium, type BrowserContext, type Page } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.MESA_BASE_URL ?? "http://localhost:3000";
const OUT = process.env.MESA_OUT ?? "/tmp/mesa";
const GL = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"];

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

let falhas = 0;
export function ok(cond: boolean, msg: string) {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
}

export async function modoTeste(ctx: BrowserContext) {
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
export async function assentarMesa(p: Page) {
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
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

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ args: GL });

  for (const [w, h] of TAMANHOS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await modoTeste(ctx);
    const p = await ctx.newPage();
    await assentarMesa(p);
    const { mesa, janelas } = await retangulos(p);
    const ids = Object.keys(janelas);

    console.log(`\n${w}×${h} — mesa ${resumo(mesa)}`);
    for (const id of ids) console.log(`  ${id.padEnd(8)} ${resumo(janelas[id])}`);

    // Sem isto, uma mesa sem `data-janela` passaria em tudo sem medir nada.
    const faltam = JANELAS_INICIAIS.filter((id) => !janelas[id]);
    ok(faltam.length === 0, `${w}×${h}: as quatro janelas iniciais medidas${faltam.length ? " — faltam: " + faltam.join(", ") : ""}`);

    const cruzam: string[] = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const area = areaComum(janelas[ids[i]], janelas[ids[j]]);
        if (area > 1) cruzam.push(`${ids[i]} × ${ids[j]} (${px(area)} px²)`);
      }
    }
    ok(cruzam.length === 0, `${w}×${h}: nenhuma janela sobre outra${cruzam.length ? " — cruzam: " + cruzam.join(", ") : ""}`);

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
      ok(vazam.length === 0, `${w}×${h} (sticky): RENDER, TERMINAL e AGORA cabem na mesa${vazam.length ? " — " + vazam.join(", ") : ""}`);
    }

    await p.screenshot({ path: `${OUT}/escadinha-${w}x${h}.png` });
    await ctx.close();
  }

  await browser.close();

  if (falhas) {
    console.error(`\n${falhas} check(s) falharam`);
    process.exit(1);
  }
  console.log("\ntudo certo");
}

main();
