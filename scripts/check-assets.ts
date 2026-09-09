/**
 * check-assets — verificação determinística de arquivos em disco.
 *
 * Roda no `prebuild`: se um `cover` ou uma imagem de `gallery` declarada em
 * lib/projects.ts não existir em public/, o build falha aqui em vez de publicar
 * um card quebrado. É checagem de disco, sem rede — a verificação de links
 * externos vive em scripts/check-links.ts e nunca entra no build.
 *
 * tsconfig.json exclui scripts/, então o import é relativo (não usa o alias @/).
 */
import fs from "node:fs";
import path from "node:path";
import { projects } from "../lib/projects";

type Check = {
  origem: string;
  caminho: string;
  ok: boolean;
  obrigatorio: boolean;
};

// O PDF do currículo é gerado por `npm run cv` (scripts/build-cv.ts) e ainda não
// está versionado. Enquanto isso a ausência é AVISO, não falha de build. Quando
// o arquivo entrar no repositório, basta virar esta constante para true.
const CV_OBRIGATORIO = false;
const CV_PATH = "/leonardo-souza-cv.pdf";

const publicDir = path.join(process.cwd(), "public");

function existe(src: string): boolean {
  return fs.existsSync(path.join(publicDir, src.replace(/^\//, "")));
}

const checks: Check[] = [];

for (const project of projects) {
  if (project.cover) {
    checks.push({
      origem: `${project.slug} · cover`,
      caminho: project.cover,
      ok: existe(project.cover),
      obrigatorio: true,
    });
  }

  project.gallery?.forEach((shot, i) => {
    checks.push({
      origem: `${project.slug} · gallery[${i}]`,
      caminho: shot.src,
      ok: existe(shot.src),
      obrigatorio: true,
    });
  });

  if (project.video) {
    checks.push({
      origem: `${project.slug} · video`,
      caminho: project.video,
      ok: existe(project.video),
      obrigatorio: true,
    });
  }
}

checks.push({
  origem: "cv · pdf",
  caminho: CV_PATH,
  ok: existe(CV_PATH),
  obrigatorio: CV_OBRIGATORIO,
});

const larguraOrigem = Math.max(...checks.map((c) => c.origem.length), 6);
const larguraCaminho = Math.max(...checks.map((c) => c.caminho.length), 7);

function status(check: Check): string {
  if (check.ok) return "OK";
  return check.obrigatorio ? "FALTA" : "AVISO";
}

console.log(
  `\n${"ORIGEM".padEnd(larguraOrigem)}  ${"CAMINHO".padEnd(larguraCaminho)}  STATUS`,
);
console.log("-".repeat(larguraOrigem + larguraCaminho + 12));
for (const check of checks) {
  console.log(
    `${check.origem.padEnd(larguraOrigem)}  ${check.caminho.padEnd(larguraCaminho)}  ${status(check)}`,
  );
}

const faltando = checks.filter((c) => !c.ok && c.obrigatorio);
const avisos = checks.filter((c) => !c.ok && !c.obrigatorio);

console.log(
  `\n${checks.length} asset(s) declarado(s) · ${checks.length - faltando.length - avisos.length} ok · ${avisos.length} aviso(s) · ${faltando.length} faltando`,
);

if (avisos.length > 0) {
  for (const aviso of avisos) {
    console.warn(`aviso: ${aviso.caminho} não existe em public/ (${aviso.origem})`);
  }
}

if (faltando.length > 0) {
  console.error("\ncheck-assets: build interrompido — asset declarado sem arquivo em public/.");
  process.exit(1);
}

console.log("check-assets: todos os assets obrigatórios existem em public/.\n");
