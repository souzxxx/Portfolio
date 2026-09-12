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
import { CV_PDF, LANGS } from "../lib/i18n";

type Check = {
  origem: string;
  caminho: string;
  ok: boolean;
  obrigatorio: boolean;
};

// Os DOIS PDFs do currículo são gerados por `npm run cv` (scripts/build-cv.ts)
// e estão versionados em public/. Dois CTAs dependem deles em cada idioma (hero
// e sobre), então a ausência é falha de build, não aviso: apagar um por acidente
// tem que derrubar o deploy em vez de publicar links quebrados.
//
// Os caminhos vêm de CV_PDF (lib/i18n.ts), o mesmo mapa que os botões do site e
// o gerador leem — repeti-los aqui criaria um terceiro lugar para o nome do
// arquivo divergir, e este é justamente o script que existe para pegar arquivo
// que não está onde alguém disse que estaria. tsconfig.json exclui scripts/,
// então o import é RELATIVO (o alias @/ não existe aqui).
//
// O INGLÊS É OBRIGATÓRIO COMO O PORTUGUÊS. Enquanto /en/cv não existia, este
// check reprovava o build de propósito — um CTA de currículo em inglês que baixa
// 404 é pior que CTA nenhum.
const CV_OBRIGATORIO = true;

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

for (const lang of LANGS) {
  checks.push({
    origem: `cv · pdf (${lang})`,
    caminho: CV_PDF[lang],
    ok: existe(CV_PDF[lang]),
    obrigatorio: CV_OBRIGATORIO,
  });
}

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
