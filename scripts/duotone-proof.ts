/**
 * duotone-proof — banco de provas da cianotipia, sob demanda.
 *
 *   npx tsx scripts/duotone-proof.ts
 *
 * NÃO entra no `prebuild` e não escreve nada em `public/`. É ferramenta de
 * CALIBRAÇÃO: renderiza cada screenshot de `public/projects/` dentro da pilha
 * `.duotone` real do site, nos dois presets e nas duas larguras que importam, e
 * devolve PNGs + números para uma decisão humana sobre qual preset cada capa
 * usa no seu call site.
 *
 * POR QUE ISSO PRECISA EXISTIR
 * A gravura é 100% CSS e depende de `mix-blend-mode`: não dá para prever no
 * olho se um screenshot vai sair chapado (altas-luzes coladas no creme) ou
 * lavado (tudo no meio-tom, desenho ilegível). O único jeito honesto de
 * escolher entre `light` e `dark` é rodar a pilha de verdade num navegador de
 * verdade e medir o resultado.
 *
 * A PILHA NÃO É COPIADA — É EXTRAÍDA
 * O script lê `app/globals.css` e injeta as regras `.duotone` originais na
 * página de teste. Uma cópia manual apodrece no primeiro ajuste do CSS e passa
 * a certificar uma imagem que o site não produz mais; extraindo, a prova é a
 * pilha de produção por construção. Se as regras somem do CSS, o script falha
 * em vez de mentir.
 *
 * OFFLINE POR CONSTRUÇÃO
 * Sem servidor e sem `next dev`: os PNGs entram na página como data URI, então
 * não há origem `file://`, nem porta, nem rede. Roda no avião.
 *
 * SAÍDA (sobrescreve a cada execução)
 *   /tmp/duotone-proof/<slug>__<preset>__<largura>.png   ← a prova pedida
 *   /tmp/duotone-proof/<slug>__compare.png               ← cor real | dark | light
 * Mude o destino com DUOTONE_PROOF_OUT=/outro/caminho.
 *
 * AS MÉTRICAS DA TABELA
 * Cada pixel do resultado é projetado no eixo azul→creme da cianotipia: t=0 é
 * #1620DC puro, t=1 é #F5F3EE puro. As pontas do eixo NÃO são 0 e 1 na prática
 * — a pilha empilha `screen` sobre azul, opacidade .92 e um `multiply` creme,
 * então um branco puro sai em t≈0.92 e nunca encosta no creme. Por isso o
 * script mede o TETO e o PISO reais de cada preset antes de julgar qualquer
 * asset (renderiza 1px branco e 1px preto na mesma pilha) e compara contra
 * eles, em vez de contra 0/1 fixos, que dariam LUZ% = 0.0% para sempre:
 *   LUZ%    fração colada no teto — o desenho afogou no creme, é o "lavado"
 *   SOMBRA% fração colada no piso — o desenho afundou no azul
 *   AMPL    desvio-padrão de t — quanta gravura sobrou; quanto maior, melhor
 *   NOTA    AMPL menos a penalidade de LUZ% — e SÓ de LUZ%
 *
 * A PENALIDADE É ASSIMÉTRICA DE PROPÓSITO, e essa é a única opinião embutida
 * aqui: numa cianotipia o azul é o CAMPO e o creme é a TINTA. Um campo azul
 * chapado é o efeito pretendido (a capa do sentinel é 81% azul liso e está
 * certa); um campo creme chapado é screenshot desbotado, que é o defeito. Logo
 * SOMBRA% é informação e LUZ% é falta.
 *
 * NOTA é sugestão medida, não veredito: as colunas existem para confirmar ou
 * contrariar o que os PNGs mostram, olhados por um humano.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium, type Browser, type Page } from "playwright";

/* ── Paleta fixa da identidade. Os mesmos literais de app/globals.css. ────── */
const AZUL = { r: 0x16, g: 0x20, b: 0xdc }; // #1620DC — extremo t=0 do eixo
const CREME = { r: 0xf5, g: 0xf3, b: 0xee }; // #F5F3EE — extremo t=1 do eixo
const BREU = "#141414";

/* ── Os dois presets calibrados, iguais aos de components/ui/DuotoneImage.tsx.
 *    `dark` também é o default escrito no `.duotone` do CSS; o script confere
 *    se os dois ainda batem e avisa se alguém mexeu num só dos lados. ─────── */
type Ajuste = { contrast: string; bright: string };
const PRESETS: Record<string, Ajuste> = {
  dark: { contrast: "1.28", bright: "1.06" },
  light: { contrast: "1.05", bright: "0.86" },
};

/**
 * Presets extras de teste, para quando nenhum dos dois serve e a saída é um
 * `--duo-contrast`/`--duo-bright` inline no call site — sem essa alça só dá
 * para chutar o par de números.
 *
 *   DUOTONE_PROOF_EXTRA="forte=1.9/0.80,duro=2.4/0.72" npx tsx scripts/duotone-proof.ts
 *
 * Entram na tabela ao lado dos dois oficiais e não mudam nada no repo.
 */
for (const par of (process.env.DUOTONE_PROOF_EXTRA ?? "").split(",").filter(Boolean)) {
  const m = /^\s*([\w-]+)\s*=\s*([\d.]+)\s*\/\s*([\d.]+)\s*$/.exec(par);
  if (!m) throw new Error(`DUOTONE_PROOF_EXTRA inválido em "${par}" — use nome=contraste/brilho`);
  PRESETS[m[1]] = { contrast: m[2], bright: m[3] };
}

type Preset = string;
const ORDEM_PRESET: Preset[] = Object.keys(PRESETS);

/* ── As duas larguras que decidem. 352 é a coluna útil de um mobile de 390
 *    (390 − 2×19 de gutter), que é onde o recrutador abre o site; 704 é o
 *    dobro, a fita editorial do desktop. DPR 2 nas duas porque a hachura tem
 *    passo de 1.4px: em DPR 1 ela alias e a prova mentiria a favor. ───────── */
const LARGURAS = [352, 704] as const;
const DPR = 2;

const RAIZ = path.resolve(__dirname, "..");
const DIR_PROJETOS = path.join(RAIZ, "public", "projects");
const GLOBALS_CSS = path.join(RAIZ, "app", "globals.css");
const SAIDA = process.env.DUOTONE_PROOF_OUT ?? "/tmp/duotone-proof";

type Asset = { slug: string; rel: string; abs: string; w: number; h: number };
type Medida = { luz: number; sombra: number; ampl: number; nota: number };
type Linha = Medida & { asset: Asset; preset: Preset; largura: number; prova: string };

/* ────────────────────────────────────────────────────────────────────────────
 * 1. A pilha `.duotone`, extraída de app/globals.css
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * Devolve todas as regras cujo seletor menciona `.duotone`, na ordem em que
 * aparecem no arquivo — a ordem importa, é o que resolve a especificidade
 * empatada entre `.duotone > img` e `.duotone[data-color="on"] > img`.
 *
 * Comentários saem antes para não vazarem para dentro do seletor: nenhuma
 * regra `.duotone` tem chave aninhada, então depois disso um regex sem
 * `{`/`}` no meio delimita a regra com segurança.
 */
function extrairPilhaDuotone(css: string): string {
  const semComentarios = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const regras: string[] = [];
  const re = /([^{}]*\.duotone[^{}]*)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(semComentarios)) !== null) {
    const seletor = m[1].trim().replace(/\s+/g, " ");
    const corpo = m[2].trim();
    if (seletor) regras.push(`${seletor} { ${corpo} }`);
  }
  if (regras.length < 4) {
    throw new Error(
      `duotone-proof: encontrei só ${regras.length} regra(s) .duotone em ${GLOBALS_CSS}.\n` +
        "A pilha da cianotipia sumiu ou mudou de nome — a prova seria falsa. Abortando.",
    );
  }
  return regras.join("\n");
}

/** Lê o default de `--duo-contrast` / `--duo-bright` que o CSS declara. */
function defaultDoCss(pilha: string): { contrast?: string; bright?: string } {
  return {
    contrast: /--duo-contrast:\s*([^;}\s]+)/.exec(pilha)?.[1],
    bright: /--duo-bright:\s*([^;}\s]+)/.exec(pilha)?.[1],
  };
}

/** Cor da camada de `multiply` — é ela que abre a segunda cor da cianotipia. */
function corDoMultiply(pilha: string): string {
  const regra = /\.duotone::after\s*\{([^}]*)\}/.exec(pilha)?.[1] ?? "";
  return /background:\s*([^;}]+)/.exec(regra)?.[1].trim() ?? "(não encontrada)";
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2. Descoberta dos assets
 * ─────────────────────────────────────────────────────────────────────────── */

/** Largura e altura direto do IHDR do PNG — 24 bytes, sem decodificar nada. */
function dimensoesPng(abs: string): { w: number; h: number } {
  const fd = fs.openSync(abs, "r");
  try {
    const buf = Buffer.alloc(24);
    fs.readSync(fd, buf, 0, 24, 0);
    if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`${abs} não é PNG`);
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Varre `public/projects/` recursivamente. Nada de lista fixa: capa nova
 * entra na prova sozinha. Ordenação por caminho para a saída ser idêntica
 * entre execuções e o diff de duas rodadas ser legível.
 */
function descobrirAssets(): Asset[] {
  const achados: Asset[] = [];
  const andar = (dir: string) => {
    for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entrada.name);
      if (entrada.isDirectory()) andar(abs);
      else if (entrada.isFile() && entrada.name.toLowerCase().endsWith(".png")) {
        const rel = path.relative(DIR_PROJETOS, abs).split(path.sep).join("/");
        achados.push({
          slug: rel.replace(/\.png$/i, "").replace(/\//g, "-"),
          rel,
          abs,
          ...dimensoesPng(abs),
        });
      }
    }
  };
  andar(DIR_PROJETOS);
  return achados.sort((a, b) => a.rel.localeCompare(b.rel, "en"));
}

const cache = new Map<string, string>();
function dataUri(abs: string): string {
  let uri = cache.get(abs);
  if (!uri) {
    uri = `data:image/png;base64,${fs.readFileSync(abs).toString("base64")}`;
    cache.set(abs, uri);
  }
  return uri;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3. A página de teste
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * O `<figure class="duotone">` do site com o `<img>` dentro, mais as três
 * declarações que o React entrega em runtime e não estão no CSS: a razão de
 * aspecto reservada inline (o `ratio` do componente), o `fill` do next/image
 * virando um absoluto que cobre a figura, e as duas variáveis do preset.
 *
 * A figura fica na razão nativa do PNG em vez de um 16:10 recortado: aqui se
 * julga TOM, e um crop esconderia justamente a parte do screenshot que pode
 * estar estourando.
 */
function figura(
  uri: string,
  razao: string,
  preset: Preset,
  largura: number,
  cor: boolean,
): string {
  const p = PRESETS[preset];
  const vars = `--duo-contrast:${p.contrast};--duo-bright:${p.bright}`;
  return (
    `<figure class="duotone" ${cor ? 'data-color="on" ' : ""}` +
    `style="width:${largura}px;aspect-ratio:${razao};${vars}">` +
    `<img src="${uri}" alt="">` +
    `</figure>`
  );
}

const figuraDo = (a: Asset, preset: Preset, largura: number, cor: boolean) =>
  figura(dataUri(a.abs), `${a.w} / ${a.h}`, preset, largura, cor);

/* 1×1 branco e 1×1 preto, embutidos: passados pela MESMA pilha, dão o teto e o
   piso reais do eixo azul→creme naquele preset. É a régua contra a qual LUZ% e
   SOMBRA% são medidos — sem ela os dois seriam comparados com 0 e 1, que a
   pilha nunca alcança. */
const PNG_BRANCO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP4//8/AAX+Av4zEpUUAAAAAElFTkSuQmCC";
const PNG_PRETO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mNgYGAAAAAEAAHI6uv5AAAAAElFTkSuQmCC";

function pagina(pilha: string, corpo: string, fundo = BREU): string {
  return `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:${fundo};font:12px/1.4 "Courier New",monospace;color:#F5F3EE}
/* ↓↓↓ extraído de app/globals.css em tempo de execução — não editar aqui ↓↓↓ */
${pilha}
/* ↑↑↑ fim da pilha de produção ↑↑↑ */
/* O que o React entrega e o CSS não sabe: next/image com fill, e o
   object-cover object-top que o componente aplica na img. */
.duotone{overflow:hidden;display:block}
.duotone>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top}
.tira{display:flex;align-items:flex-start;gap:12px;padding:12px}
.col{display:flex;flex-direction:column;gap:6px}
.rot{letter-spacing:.18em;text-transform:uppercase;opacity:.75}
</style>${corpo}`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 4. Medição
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * `mix-blend-mode` não é legível por canvas a partir do DOM — o blend acontece
 * na composição, depois de qualquer leitura de pixel. Então o caminho é o
 * inverso: tira-se o screenshot, ele volta para dentro do navegador como
 * imagem já composta, e AÍ o canvas lê. Custa uma volta e não custa dependência
 * nenhuma de decodificação de PNG no Node.
 */
const BALDES = 1000; // resolução do histograma de t: 0.001

type Perfil = { media: number; ampl: number; hist: number[]; n: number };

async function analisar(analisador: Page, png: Buffer): Promise<Perfil> {
  return analisador.evaluate(
    async ([uri, a, c, baldes]) => {
      const img = new Image();
      img.src = uri as string;
      await img.decode();
      const cv = document.createElement("canvas");
      cv.width = img.naturalWidth;
      cv.height = img.naturalHeight;
      const ctx = cv.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;

      const azul = a as { r: number; g: number; b: number };
      const creme = c as { r: number; g: number; b: number };
      const nb = baldes as number;
      const ex = creme.r - azul.r;
      const ey = creme.g - azul.g;
      const ez = creme.b - azul.b;
      const len2 = ex * ex + ey * ey + ez * ez;

      const hist = new Array<number>(nb + 1).fill(0);
      let n = 0;
      let soma = 0;
      let soma2 = 0;
      // Passo de 4 px em cada eixo: ~16x menos leitura, mesma estatística num
      // quadro de 700×900, e a prova sai em segundos em vez de minutos.
      for (let y = 0; y < cv.height; y += 4) {
        for (let x = 0; x < cv.width; x += 4) {
          const i = (y * cv.width + x) * 4;
          const t =
            ((d[i] - azul.r) * ex + (d[i + 1] - azul.g) * ey + (d[i + 2] - azul.b) * ez) / len2;
          const tc = t < 0 ? 0 : t > 1 ? 1 : t;
          hist[Math.round(tc * nb)]++;
          soma += tc;
          soma2 += tc * tc;
          n++;
        }
      }
      const media = soma / n;
      return { media, ampl: Math.sqrt(Math.max(0, soma2 / n - media * media)), hist, n };
    },
    [`data:image/png;base64,${png.toString("base64")}`, AZUL, CREME, BALDES] as const,
  );
}

/** Fração de pixels com t dentro de [a, b], lida do histograma. */
function fracao(p: Perfil, a: number, b: number): number {
  const de = Math.max(0, Math.ceil(a * BALDES));
  const ate = Math.min(BALDES, Math.floor(b * BALDES));
  let s = 0;
  for (let i = de; i <= ate; i++) s += p.hist[i];
  return s / p.n;
}

/** Régua do preset: teto e piso são as pontas ALCANÇÁVEIS, não 0 e 1. */
type Regua = { teto: number; piso: number };

const MARGEM_PONTA = 0.02; // "colado na ponta" = a 2% dela

function medir(p: Perfil, r: Regua): Medida {
  const luz = fracao(p, r.teto - MARGEM_PONTA, 1);
  const sombra = fracao(p, 0, r.piso + MARGEM_PONTA);
  // Só o creme afogado é falta; campo azul chapado é o efeito pretendido.
  // Tolera 8% de altas-luzes legítimas (um card branco, um selo) antes de doer.
  const nota = p.ampl - Math.max(0, luz - 0.08) * 1.2;
  return { luz, sombra, ampl: p.ampl, nota };
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5. Tabela
 * ─────────────────────────────────────────────────────────────────────────── */

function tabela(cabecalho: string[], linhas: string[][]): string {
  const larg = cabecalho.map((c, i) =>
    Math.max(c.length, ...linhas.map((l) => (l[i] ?? "").length)),
  );
  const pad = (s: string, i: number) => (i === 0 ? s.padEnd(larg[i]) : s.padStart(larg[i]));
  const linha = (cels: string[]) => "  " + cels.map(pad).join("  ");
  return [
    linha(cabecalho),
    "  " + larg.map((w) => "─".repeat(w)).join("  "),
    ...linhas.map(linha),
  ].join("\n");
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

/* ────────────────────────────────────────────────────────────────────────────
 * 6. Execução
 * ─────────────────────────────────────────────────────────────────────────── */

async function main() {
  if (!fs.existsSync(GLOBALS_CSS)) throw new Error(`não achei ${GLOBALS_CSS}`);
  const pilha = extrairPilhaDuotone(fs.readFileSync(GLOBALS_CSS, "utf8"));
  const assets = descobrirAssets();
  if (assets.length === 0) throw new Error(`nenhum .png em ${DIR_PROJETOS}`);

  fs.mkdirSync(SAIDA, { recursive: true });

  console.log("\nDUOTONE PROOF — cianotipia sobre os screenshots reais\n");
  console.log(`  pilha .duotone   ${path.relative(RAIZ, GLOBALS_CSS)} (extraída em runtime)`);
  console.log(`  camada multiply  ${corDoMultiply(pilha)}`);
  const padrao = defaultDoCss(pilha);
  const bate =
    padrao.contrast === PRESETS.dark.contrast && padrao.bright === PRESETS.dark.bright;
  console.log(
    `  default do CSS   contrast ${padrao.contrast ?? "?"} / brightness ${padrao.bright ?? "?"}` +
      (bate ? "  = preset dark" : `  ✗ DIVERGE do preset dark deste script`),
  );
  console.log(
    `  assets           ${assets.length} · presets ${ORDEM_PRESET.join(", ")}` +
      ` · larguras ${LARGURAS.join(", ")} (DPR ${DPR})`,
  );
  console.log(`  saída            ${SAIDA}\n`);

  let browser: Browser | undefined;
  const linhas: Linha[] = [];
  const comparacoes: string[] = [];

  try {
    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      deviceScaleFactor: DPR,
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    const analisador = await ctx.newPage();
    await analisador.goto("about:blank");

    /* Régua de cada preset ANTES de julgar qualquer asset: 1px branco e 1px
       preto pela mesma pilha dizem onde o eixo azul→creme realmente começa e
       termina naquele par contraste/brilho. */
    const reguas: Record<string, Regua> = {};
    for (const preset of ORDEM_PRESET) {
      await page.setViewportSize({ width: 96, height: 96 });
      const ponta = async (uri: string) => {
        await page.setContent(pagina(pilha, figura(uri, "1 / 1", preset, 64, false)));
        const alvo = page.locator("figure.duotone");
        await alvo.waitFor({ state: "visible" });
        return (await analisar(analisador, await alvo.screenshot())).media;
      };
      reguas[preset] = { teto: await ponta(PNG_BRANCO), piso: await ponta(PNG_PRETO) };
    }
    console.log(
      "  régua do eixo    " +
        ORDEM_PRESET.map(
          (p) => `${p}: piso ${reguas[p].piso.toFixed(3)} → teto ${reguas[p].teto.toFixed(3)}`,
        ).join(" · "),
    );
    // Régua achatada = a pilha não abre a segunda cor (foi o que aconteceu no
    // teste com o `multiply` em azul: branco e preto caem no mesmo ponto e a
    // imagem inteira vira chapa lisa). Sem este aviso a tabela sairia com
    // LUZ% e SOMBRA% em 100% e pareceria bug do script, não do CSS.
    for (const p of ORDEM_PRESET) {
      const faixa = reguas[p].teto - reguas[p].piso;
      if (faixa < 0.1) {
        console.log(
          `  ⚠ preset ${p}: a régua abriu só ${faixa.toFixed(3)} — branco e preto saem quase` +
            " na mesma cor. A pilha não está produzindo duotone nenhum; olhe a camada de multiply.",
        );
      }
    }
    console.log("");

    for (const a of assets) {
      /* as 4 provas pedidas: 2 presets × 2 larguras */
      for (const preset of ORDEM_PRESET) {
        for (const largura of LARGURAS) {
          await page.setViewportSize({
            width: largura + 32,
            height: Math.ceil((largura * a.h) / a.w) + 32,
          });
          await page.setContent(pagina(pilha, figuraDo(a, preset, largura, false)));
          const alvo = page.locator("figure.duotone");
          await alvo.waitFor({ state: "visible" });
          await page.evaluate(() => document.fonts.ready);

          const prova = path.join(SAIDA, `${a.slug}__${preset}__${largura}.png`);
          const png = await alvo.screenshot({ path: prova });
          const perfil = await analisar(analisador, png);
          linhas.push({ asset: a, preset, largura, prova, ...medir(perfil, reguas[preset]) });
        }
      }

      /* tríptico de decisão: a mesma capa em cor real, dark e light, lado a
         lado — 1 arquivo por asset em vez de 4 para bater o olho. */
      const larg = 352;
      const alt = Math.ceil((larg * a.h) / a.w);
      const col = (rot: string, html: string) =>
        `<div class="col"><div class="rot">${rot}</div>${html}</div>`;
      await page.setViewportSize({ width: larg * 3 + 60, height: alt + 60 });
      await page.setContent(
        pagina(
          pilha,
          `<div class="tira">${col("cor real", figuraDo(a, "dark", larg, true))}${col(
            "preset dark",
            figuraDo(a, "dark", larg, false),
          )}${col("preset light", figuraDo(a, "light", larg, false))}</div>`,
        ),
      );
      await page.locator("figure.duotone").first().waitFor({ state: "visible" });
      const cmp = path.join(SAIDA, `${a.slug}__compare.png`);
      await page.locator(".tira").screenshot({ path: cmp });
      comparacoes.push(cmp);
      console.log(`  ✓ ${a.rel}  (${a.w}×${a.h})`);
    }
  } finally {
    await browser?.close();
  }

  console.log("\nPROVAS\n");
  console.log(
    tabela(
      ["ORIGEM", "PRESET", "LARG", "LUZ%", "SOMBRA%", "AMPL", "NOTA", "PROVA"],
      linhas.map((l) => [
        l.asset.rel,
        l.preset,
        String(l.largura),
        pct(l.luz),
        pct(l.sombra),
        l.ampl.toFixed(3),
        l.nota.toFixed(3),
        l.prova,
      ]),
    ),
  );

  console.log("\nSUGESTÃO MEDIDA — maior NOTA em 352px, a largura do mobile\n");
  console.log(
    tabela(
      ["ORIGEM", "SUGERIDO", ...ORDEM_PRESET.map((p) => `NOTA ${p}`), "MARGEM", "TRÍPTICO"],
      assets.map((a, i) => {
        const notas = ORDEM_PRESET.map(
          (p) => linhas.find((l) => l.asset.rel === a.rel && l.preset === p && l.largura === 352)!.nota,
        );
        const melhor = notas.indexOf(Math.max(...notas));
        // Margem = distância para o SEGUNDO colocado: é ela que diz se a
        // sugestão é uma decisão ou um empate técnico a resolver no olho.
        const segunda = Math.max(...notas.filter((_, j) => j !== melhor));
        return [
          a.rel,
          ORDEM_PRESET[melhor],
          ...notas.map((n) => n.toFixed(3)),
          (notas[melhor] - segunda).toFixed(3),
          comparacoes[i],
        ];
      }),
    ),
  );

  console.log(
    "\nA sugestão é medida, não decidida: margem pequena (< 0.02) quer dizer" +
      "\nempate técnico e a escolha vai no tríptico, no olho. O ajuste fino de um" +
      "\ncaso isolado é --duo-contrast/--duo-bright inline no call site, NUNCA na" +
      "\nregra global de app/globals.css.\n",
  );
}

main().catch((err) => {
  console.error("\nduotone-proof falhou:", err instanceof Error ? err.message : err);
  process.exit(1);
});
