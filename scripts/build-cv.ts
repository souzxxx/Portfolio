/**
 * Gera public/leonardo-souza-cv.pdf a partir da rota /cv.
 *
 * Uso:
 *   npm run dev            (em outro terminal)
 *   npx tsx scripts/build-cv.ts
 *
 * O script NÃO sobe servidor: ele assume o dev server em http://localhost:3000
 * e falha com mensagem clara se não encontrar ninguém ouvindo.
 *
 * tsconfig.json exclui scripts/, então aqui só entram imports relativos e de
 * pacote — nada de alias @/.
 */
import { chromium } from "playwright";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.CV_BASE_URL ?? "http://localhost:3000";
const CV_URL = `${BASE_URL}/cv`;

const OUT_DIR = path.resolve(process.cwd(), "public");
const OUT_FILE = path.join(OUT_DIR, "leonardo-souza-cv.pdf");

const MARGIN = {
  top: "14mm",
  right: "14mm",
  bottom: "14mm",
  left: "14mm",
} as const;

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

/** Confere que o dev server está de pé antes de subir o Chromium. */
async function assertServerIsUp(): Promise<void> {
  try {
    const res = await fetch(CV_URL, { method: "GET" });
    if (!res.ok) {
      fail(
        `${CV_URL} respondeu ${res.status}. A rota /cv existe? ` +
          `Confira app/cv/page.tsx e o log do dev server.`,
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
  await assertServerIsUp();
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();

    console.log(`[cv] abrindo ${CV_URL}`);
    await page.goto(CV_URL, { waitUntil: "networkidle", timeout: 45000 });

    // page.pdf() já renderiza com a media query de impressão.
    await page.pdf({
      path: OUT_FILE,
      format: "A4",
      printBackground: true,
      margin: MARGIN,
    });
  } finally {
    await browser.close();
  }

  const { size } = await stat(OUT_FILE);
  const pages = readPageCount(await readFile(OUT_FILE));

  console.log(`[cv] gerado ${OUT_FILE} (${(size / 1024).toFixed(1)} kB)`);

  if (pages === null) {
    console.warn(
      "[cv] não consegui contar as páginas do PDF — confira à mão que cabe em uma.",
    );
    return;
  }

  if (pages > 1) {
    fail(
      `O PDF saiu com ${pages} páginas e o currículo tem que caber em UMA. ` +
        `Corte conteúdo ou reduza a tipografia em app/cv/page.tsx e rode de novo.`,
    );
  }

  console.log("[cv] ✓ 1 página, dentro do formato A4");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
