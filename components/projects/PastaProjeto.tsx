import Image from "next/image";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { Janela } from "../os/Janela";
import { PixelIcon } from "../os/PixelIcon";
import { ProjectCover } from "./ProjectCover";
import type { Dict } from "@/lib/dict";
import type { LocalizedProject } from "@/lib/projects";
import { hrefProjeto, type Lang } from "@/lib/i18n";

/**
 * PastaProjeto — um destaque desenhado como pasta de arquivo do souzxxx OS:
 * aba em cima, corpo embaixo, captura real numa janela 1-bit de um lado e o
 * essencial do projeto do outro. O texto longo (decisões, galeria, arquitetura)
 * saiu da home e mora na página de case; a pasta só precisa convencer alguém a
 * abri-la.
 *
 * As ABAS ESCALONAM na horizontal: a pasta `i` põe a aba em
 * `i / (n - 1)` da largura útil, da esquerda para a direita. Empilhadas (ver
 * <Pilha>), as abas de quem ficou embaixo formam uma fileira legível — o
 * índice do arquivo de aço. No celular, sem pilha, o mesmo escalonamento faz
 * a lista ler como pastas numa gaveta em vez de cards repetidos.
 *
 * O PREENCHIMENTO ALTERNA papel / carvão. Duas pastas vizinhas da mesma cor
 * virariam um bloco só quando empilhadas; alternando, cada aba e cada fatia de
 * pasta embaixo tem um contorno que o olho separa sem filete nenhum. O dourado
 * aparece num lugar só — o quadrado de "no ar" das pastas CARVÃO — porque o
 * dourado nunca toca papel.
 *
 * `--coberto` (0→1) é escrito pela <Pilha> no `<li>` e lido aqui no CSS: os
 * filetes da aba apagam e a trama 1-bit sobe no corpo. Sem JS, ou com
 * movimento reduzido, a variável não existe e a pasta fica no estado ativo.
 *
 * SERVIDOR: nada aqui tem estado. A imagem da primeira pasta é `eager` (é a
 * que aparece quando alguém clica em "Projetos"); as outras, `lazy`.
 */

// A aba precisa de um nome curto: o `name` completo ("E-commerce transacional
// (sob NDA)") não cabe em 12rem de bitmap. Nome próprio não traduz, então o
// mapa vale para as duas línguas; slug fora dele cai na primeira palavra.
const ABA: Record<string, string> = {
  "tecna-site": "TECNA",
  financehub: "FINANCEHUB",
  "quintoandar-precificacao": "QUINTOANDAR",
  "portal-tecna": "PORTAL TECNA",
  "portal-construtora": "PORTAL",
  wraeclast: "WRAECLAST",
  "commerce-nda": "E-COMMERCE",
  sentinel: "SENTINEL",
};

function rotuloAba(p: LocalizedProject) {
  return ABA[p.slug] ?? p.name.split(/\s+/)[0].toUpperCase();
}

// O título da janela da captura: o endereço no ar quando existe — é o que a
// pessoa veria na barra do navegador —, senão o nome do arquivo. A capa gerada
// (sem screenshot) se apresenta como PICT, o formato de imagem do Mac clássico.
function tituloJanela(p: LocalizedProject) {
  if (p.demo) {
    try {
      return new URL(p.demo).host;
    } catch {
      /* cai no nome do arquivo */
    }
  }
  return p.cover ? `${p.slug}.png` : `${p.slug}.pict`;
}

const dois = (n: number) => String(n).padStart(2, "0");

// Classes literais da media query da pilha (Tailwind precisa ver a string
// inteira no código-fonte). Mesma condição de PILHA_MQ em Pilha.tsx.
const NA_PILHA_ALTURA =
  "[@media(min-width:1024px)_and_(min-height:700px)]:h-[var(--pasta-h)]";

export function PastaProjeto({
  project,
  index,
  total,
  lang,
  d,
  status,
}: {
  project: LocalizedProject;
  index: number;
  total: number;
  lang: Lang;
  d: Dict["vitrine"];
  status: Dict["status"];
}) {
  const escuro = index % 2 === 1;
  const href = hrefProjeto(lang, project.slug);
  const destaques = (project.highlights ?? []).slice(0, 2);
  const stack = project.stack.slice(0, 5);
  const numero = `${d.numero} ${dois(index + 1)}`;

  // Cores por preenchimento — todas da matriz de contraste do tailwind.config.
  const t = escuro
    ? {
        corpo: "bg-carvao text-cream",
        aba: "#1C1A17",
        filetes: "rgba(245,243,238,0.6)",
        suave: "text-cream-600",
        fraco: "text-cream-700",
        regua: "border-cream/25",
        chip: "border-cream/30",
        trama: "#0F0E0C",
      }
    : {
        corpo: "bg-cream text-carvao",
        aba: "#F5F3EE",
        filetes: "#1C1A17",
        suave: "text-ink-600",
        fraco: "text-ink-700",
        regua: "border-carvao/30",
        chip: "border-carvao/35",
        trama: "#1C1A17",
      };

  return (
    <article aria-labelledby={`pasta-${project.slug}`}>
      {/* ── A ABA ─────────────────────────────────────────────────────── */}
      {/* Largura da aba numa variável: o `left` escalonado precisa dela para
          a última aba terminar rente à borda direita. */}
      <div className="relative z-[1] h-[var(--aba-h,2.125rem)] [--aba-w:12.75rem] lg:[--aba-w:clamp(11.5rem,15vw,14rem)]">
        <div
          className="absolute bottom-[-1px] top-0 w-[var(--aba-w)]"
          style={{
            left:
              total > 1
                ? `calc(${index} * (100% - var(--aba-w) - 14px) / ${total - 1})`
                : 0,
          }}
        >
          <div
            className={clsx(
              "flex h-full items-center gap-2 border-l border-t border-carvao pl-2.5 pr-1",
              escuro ? "text-cream" : "text-carvao",
            )}
            style={{ background: t.aba }}
          >
            {/* O ícone sai no desktop: com sete abas lado a lado, os 24px dele
                são o que separa o rótulo inteiro do rótulo cortado pela aba
                seguinte. A forma da aba já diz "pasta". */}
            <PixelIcon
              nome="pasta"
              tamanho={16}
              className={clsx("lg:hidden", escuro && "[--icon-fill:#1C1A17]")}
            />
            <span className="whitespace-nowrap font-bitmap text-[10px] uppercase leading-none tracking-[0.06em] lg:text-[11px] lg:tracking-[0.03em]">
              {numero} · {rotuloAba(project)}
            </span>
            {/* Filetes de janela ativa: apagam quando a pasta é coberta. */}
            <span
              aria-hidden
              className="h-[13px] min-w-[1rem] flex-1"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, ${t.filetes} 0 1px, transparent 1px 3px)`,
                opacity: "calc(1 - var(--coberto, 0))",
              }}
            />
          </div>
          {/* O chanfro do lado direito, o desenho clássico de aba de pasta.
              SVG de tamanho fixo em px para a diagonal sair nítida. */}
          <svg
            aria-hidden
            width="14"
            height="100%"
            viewBox="0 0 14 35"
            preserveAspectRatio="none"
            className="absolute -right-[14px] top-0 h-full"
          >
            <polygon points="0,0 0.5,0 14,35 0,35" fill={t.aba} />
            <line
              x1="0"
              y1="0.5"
              x2="13.5"
              y2="35"
              stroke="#1C1A17"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      {/* ── O CORPO ───────────────────────────────────────────────────── */}
      <div
        className={clsx(
          "relative overflow-hidden border border-carvao shadow-[4px_4px_0_0_#1C1A17]",
          t.corpo,
          NA_PILHA_ALTURA,
        )}
      >
        <div className="grid h-full gap-x-[clamp(2rem,4vw,4rem)] gap-y-7 p-[clamp(1.25rem,3vw,2.75rem)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
          {/* Esquerda: a captura numa janela 1-bit. */}
          <div className="relative">
            <Janela
              as="div"
              titulo={tituloJanela(project)}
              sombra={escuro ? "breu" : "nenhuma"}
              className={clsx(
                "group/capa",
                // Sobre carvão a borda carvão da janela some; o contorno vem do
                // `outline`, que não disputa a cor da borda com a Janela.
                escuro && "outline outline-1 outline-cream/30",
              )}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {project.cover ? (
                  <Image
                    src={project.cover}
                    alt={`${project.name} — ${d.captura}`}
                    fill
                    sizes="(min-width: 1536px) 820px, (min-width: 1024px) 52vw, 92vw"
                    loading={index === 0 ? "eager" : "lazy"}
                    className="object-cover object-top motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/capa:scale-[1.025]"
                  />
                ) : (
                  <ProjectCover
                    slug={project.slug}
                    name={project.name}
                    language={project.stack[0]}
                    className="h-full w-full"
                  />
                )}
              </div>
            </Janela>
            {/* Clique na captura também abre o case. Fora da ordem de tab e
                do leitor de tela: o link de verdade é o CTA, e anunciar o
                mesmo destino duas vezes seguidas é ruído. */}
            <a
              href={href}
              tabIndex={-1}
              aria-hidden
              className="absolute inset-0 top-[22px] cursor-pointer"
            />
          </div>

          {/* Direita: o essencial. */}
          <div className="flex min-h-0 flex-col">
            <div
              className={clsx(
                "flex items-center justify-between font-bitmap text-[10px] uppercase leading-none tracking-[0.08em]",
                t.fraco,
              )}
            >
              <span>
                {numero} / {dois(total)}
              </span>
              <span>{project.year}</span>
            </div>

            <h3
              id={`pasta-${project.slug}`}
              className="mt-4 text-balance font-display text-[clamp(2.375rem,4.3vw,4.5rem)] uppercase leading-[0.95] tracking-[0.01em]"
            >
              {project.name}
            </h3>

            <p
              className={clsx(
                "mt-4 line-clamp-4 font-sans text-[1.0625rem] leading-[1.5] lg:line-clamp-3",
                t.suave,
              )}
            >
              {project.tagline}
            </p>

            {destaques.length > 0 && (
              <ul
                className={clsx(
                  "mt-5 space-y-2.5 border-t border-dashed pt-5",
                  t.regua,
                )}
              >
                {destaques.map((h) => (
                  <li
                    key={h}
                    className={clsx(
                      "grid grid-cols-[0.75rem_minmax(0,1fr)] font-sans text-[0.875rem] leading-[1.5]",
                      t.suave,
                    )}
                  >
                    <span aria-hidden className="mt-[0.55em] h-[5px] w-[5px] bg-current" />
                    <span className="line-clamp-3 lg:line-clamp-2">{h}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 lg:mt-auto lg:pt-6">
              <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
                {stack.map((s) => (
                  <li
                    key={s}
                    className={clsx(
                      "border px-1.5 py-[5px] font-bitmap text-[10px] uppercase leading-none tracking-[0.04em]",
                      t.chip,
                    )}
                  >
                    {s}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-4">
                <span className="inline-flex items-center gap-2 font-mono text-tag uppercase">
                  <span
                    aria-hidden
                    className={clsx(
                      "h-1.5 w-1.5",
                      escuro && project.status === "deployed"
                        ? "bg-gold"
                        : "bg-current",
                    )}
                  />
                  {status[project.status]}
                </span>
                <div className="flex w-full flex-wrap gap-3 sm:ml-auto sm:w-auto">
                  <a
                    href={href}
                    className={clsx(
                      CTA,
                      "flex-1 sm:flex-none",
                      escuro
                        ? "border-cream bg-cream text-carvao shadow-[3px_3px_0_0_#0F0E0C] hover:bg-carvao hover:text-cream focus-visible:outline-cream"
                        : "border-carvao bg-carvao text-cream shadow-[3px_3px_0_0_#A8A49B] hover:bg-cream hover:text-carvao focus-visible:outline-carvao",
                    )}
                  >
                    {d.abrirCase}
                  </a>
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noreferrer"
                      className={clsx(
                        CTA,
                        "flex-1 sm:flex-none",
                        escuro
                          ? "border-cream/60 text-cream hover:border-cream hover:bg-cream hover:text-carvao"
                          : "border-carvao text-carvao hover:bg-carvao hover:text-cream",
                      )}
                    >
                      {d.verNoAr}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* A trama da janela de trás: xadrez 1-bit de 2px (o "cinza" do Mac
            sem cinza nenhum), subindo com `--coberto`. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={
            {
              backgroundImage: `repeating-conic-gradient(${t.trama} 0 25%, transparent 0 50%)`,
              backgroundSize: "2px 2px",
              opacity: "calc(var(--coberto, 0) * 0.35)",
            } as CSSProperties
          }
        />
      </div>
    </article>
  );
}

// CTA da pasta: 44px de alvo, canto vivo, sombra dura que "afunda" no clique.
const CTA =
  "inline-flex min-h-[44px] items-center justify-center whitespace-nowrap border px-5 font-sans text-meta uppercase " +
  "motion-safe:transition-[transform,box-shadow,background-color,color] motion-safe:duration-150 " +
  "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";
