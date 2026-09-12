/**
 * Gera os DOIS PDFs do currículo, um por idioma:
 *
 *   /cv     → public/leonardo-souza-cv.pdf
 *   /en/cv  → public/leonardo-souza-cv-en.pdf
 *
 * Uso:
 *   npm run dev            (em outro terminal)
 *   npx tsx scripts/build-cv.ts
 *
 * O script NÃO sobe servidor: ele assume o dev server em http://localhost:3000
 * e falha com mensagem clara se não encontrar ninguém ouvindo.
 *
 * POR QUE OS DOIS SEMPRE, E NUNCA UM SÓ. As duas rotas renderizam o MESMO
 * componente (components/cv/CvDocument.tsx) com o mesmo CSS; só o texto muda.
 * Isso significa que uma linha acrescentada em qualquer um dos idiomas pode
 * empurrar o OUTRO para a segunda página — e um PDF gerado sozinho esconderia
 * exatamente esse efeito até o dia do deploy, onde ele volta como um currículo
 * de duas páginas na mão do recrutador. Gerar os dois de uma vez faz o guard de
 * "uma página A4" valer para o par, que é a unidade real.
 *
 * Os caminhos dos arquivos vêm de CV_PDF (lib/i18n.ts), que é o MESMO mapa que
 * o botão de currículo do site e o prebuild (scripts/check-assets.ts) leem —
 * três consumidores, uma verdade. tsconfig.json exclui scripts/, então aqui o
 * import é RELATIVO; o alias @/ não existe neste arquivo.
 */
import { chromium } from "playwright";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { CV_PDF, LANGS, prefixo, type Lang } from "../lib/i18n";

const BASE_URL = process.env.CV_BASE_URL ?? "http://localhost:3000";

const OUT_DIR = path.resolve(process.cwd(), "public");

const MARGIN = {
  top: "14mm",
  right: "14mm",
  bottom: "14mm",
  left: "14mm",
} as const;

type Alvo = {
  lang: Lang;
  /** A rota que o Chromium abre: /cv ou /en/cv. */
  url: string;
  /** O arquivo em disco, derivado de CV_PDF. */
  arquivo: string;
};

const ALVOS: Alvo[] = LANGS.map((lang) => ({
  lang,
  url: `${BASE_URL}${prefixo(lang)}/cv`,
  arquivo: path.join(OUT_DIR, CV_PDF[lang].replace(/^\//, "")),
}));

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

/**
 * Confere que o dev server está de pé E que as DUAS rotas respondem, antes de
 * pagar o custo de subir o Chromium. Uma rota que voltou 404 aqui é um erro de
 * caminho de arquivo (app/(pt)/cv/page.tsx ou app/(en)/en/cv/page.tsx), e
 * descobrir isso depois de um `goto` significa ler um stack trace de Playwright
 * no lugar de uma frase.
 */
async function assertRotasNoAr(): Promise<void> {
  for (const alvo of ALVOS) {
    try {
      const res = await fetch(alvo.url, { method: "GET" });
      if (!res.ok) {
        fail(
          `${alvo.url} respondeu ${res.status}. A rota existe? ` +
            `Confira app/(pt)/cv/page.tsx e app/(en)/en/cv/page.tsx, ` +
            `e o log do dev server.`,
        );
      }
    } catch {
      fail(
        `Não consegui falar com ${BASE_URL}. Suba o dev server antes:\n` +
          `    npm run dev\n` +
          `  e rode este script em outro terminal ` +
          `(ou aponte outra origem com CV_BASE_URL=...).`,
      );
    }
  }
}

/**
 * Conta as páginas do PDF pelo nó /Pages do catálogo. Playwright grava esse
 * objeto sem compressão, então o regex é suficiente para o guard de "cabe em
 * uma página". Retorna null quando não dá para determinar — nesse caso o
 * script não reprova, só avisa.
 */
function readPageCount(pdf: Buffer): number | null {
  const raw = pdf.toString("latin1");
  const counts = [...raw.matchAll(/\/Type\s*\/Pages\b[^>]*?\/Count\s+(\d+)/g)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (counts.length === 0) return null;
  return Math.max(...counts);
}

async function main(): Promise<void> {
  await assertRotasNoAr();
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();

    for (const alvo of ALVOS) {
      console.log(`[cv] abrindo ${alvo.url}`);
      await page.goto(alvo.url, { waitUntil: "networkidle", timeout: 45000 });

      // page.pdf() já renderiza com a media query de impressão.
      await page.pdf({
        path: alvo.arquivo,
        format: "A4",
        printBackground: true,
        margin: MARGIN,
      });
    }
  } finally {
    await browser.close();
  }

  // O guard roda DEPOIS de gravar os dois, e não entre um e outro: reprovar no
  // primeiro deixaria o segundo PDF desatualizado em disco sem ninguém avisar,
  // e o autor perderia a informação de que os DOIS estouraram a página.
  const estourados: string[] = [];

  for (const alvo of ALVOS) {
    const { size } = await stat(alvo.arquivo);
    const pages = readPageCount(await readFile(alvo.arquivo));

    console.log(
      `[cv] ${alvo.lang}: gerado ${alvo.arquivo} (${(size / 1024).toFixed(1)} kB)`,
    );

    if (pages === null) {
      console.warn(
        `[cv] ${alvo.lang}: não consegui contar as páginas do PDF — confira à mão que cabe em uma.`,
      );
      continue;
    }

    if (pages > 1) {
      estourados.push(`${alvo.lang} (${alvo.url}) saiu com ${pages} páginas`);
      continue;
    }

    console.log(`[cv] ${alvo.lang}: ✓ 1 página, dentro do formato A4`);
  }

  if (estourados.length > 0) {
    fail(
      `O currículo tem que caber em UMA página e ${estourados.join(" e ")}. ` +
        `Corte conteúdo em components/cv/CvDocument.tsx e rode de novo — ` +
        `lembre que o CSS é um só, então mexer num idioma mexe no outro.`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
