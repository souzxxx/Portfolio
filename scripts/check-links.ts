/**
 * check-links — verificação de rede dos links externos declarados em
 * lib/projects.ts (`github` e `demo`).
 *
 * NÃO roda no build: rede é instável e não pode travar deploy. Roda sob demanda
 * (`npm run check:links`) e semanalmente no workflow .github/workflows/links.yml,
 * que abre uma issue quando algo cai em vez de quebrar o pipeline.
 *
 * tsconfig.json exclui scripts/, então o import é relativo (não usa o alias @/).
 */
import { projects } from "../lib/projects";

type Alvo = { origem: string; url: string };
type Resultado = Alvo & { status: number | null; ok: boolean; detalhe: string };

const TIMEOUT_MS = 15_000;

const alvos: Alvo[] = [];
for (const project of projects) {
  if (project.github) alvos.push({ origem: `${project.slug} · github`, url: project.github });
  if (project.demo) alvos.push({ origem: `${project.slug} · demo`, url: project.demo });
  if (project.writeup && /^https?:\/\//.test(project.writeup)) {
    alvos.push({ origem: `${project.slug} · writeup`, url: project.writeup });
  }
}

async function checar(alvo: Alvo): Promise<Resultado> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(alvo.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "portfolio-check-links" },
    });
    return {
      ...alvo,
      status: res.status,
      ok: res.status < 400,
      detalhe: res.status < 400 ? "" : res.statusText || "resposta de erro",
    };
  } catch (erro) {
    return {
      ...alvo,
      status: null,
      ok: false,
      detalhe: erro instanceof Error ? erro.message : String(erro),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  if (alvos.length === 0) {
    console.log("check-links: nenhum link externo declarado em lib/projects.ts.");
    return;
  }

  const resultados = await Promise.all(alvos.map(checar));

  const larguraOrigem = Math.max(...resultados.map((r) => r.origem.length), 6);
  const larguraUrl = Math.max(...resultados.map((r) => r.url.length), 3);

  console.log(`\n${"ORIGEM".padEnd(larguraOrigem)}  ${"URL".padEnd(larguraUrl)}  STATUS`);
  console.log("-".repeat(larguraOrigem + larguraUrl + 12));
  for (const r of resultados) {
    const status = r.status === null ? "ERRO" : String(r.status);
    const marca = r.ok ? "OK" : "FALHA";
    console.log(
      `${r.origem.padEnd(larguraOrigem)}  ${r.url.padEnd(larguraUrl)}  ${marca} ${status}${r.detalhe ? ` (${r.detalhe})` : ""}`,
    );
  }

  const quebrados = resultados.filter((r) => !r.ok);
  console.log(
    `\n${resultados.length} link(s) verificado(s) · ${resultados.length - quebrados.length} ok · ${quebrados.length} com problema`,
  );

  if (quebrados.length > 0) {
    console.error("\ncheck-links: links com problema:");
    for (const r of quebrados) {
      console.error(`- ${r.origem}: ${r.url} → ${r.status ?? r.detalhe}`);
    }
    process.exit(1);
  }

  console.log("check-links: todos os links externos responderam abaixo de 400.\n");
}

main();
