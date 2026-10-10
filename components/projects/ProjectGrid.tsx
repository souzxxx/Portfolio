import Image from "next/image";
import { Bloco } from "../ui/Bloco";
import { CabecalhoPasta, contar } from "./CabecalhoPasta";
import { ProjectCover } from "./ProjectCover";
import { EspiaIndice, type Previa } from "./EspiaIndice";
import { FEATURED_COUNT } from "./FeaturedShowcase";
import { getMoreProjects, type LocalizedProject } from "@/lib/projects";
import { dict, type Dict } from "@/lib/dict";
import { hrefProjeto, type Lang } from "@/lib/i18n";

/**
 * ProjectGrid — "Mais projetos", o índice CARVÃO depois da pilha de pastas.
 *
 * Saiu a tabela de cinco colunas com miniatura de 56px e inversão creme da
 * linha inteira. Entrou uma LISTA EDITORIAL: número grande em serifa, nome
 * grande, uma linha de tagline, stack, ano e estado — e, num desktop com mouse,
 * a captura do projeto flutua junto do cursor (ver <EspiaIndice>). Cada linha
 * leva à página de case, inclusive as que não têm repositório público: o case
 * existe para todas.
 *
 * O NÚMERO CONTINUA A CONTAGEM dos destaques (FEATURED_COUNT), então o índice
 * começa em 08 quando a pilha tem sete pastas.
 *
 * O HOVER É CSS; a espiada é o único JS. Nome desliza 12px, número acende em
 * dourado (o único acento do carvão nesta tela) e as outras linhas baixam para
 * 45% — tudo via `group-hover` e só em `(hover: hover)`, para o toque não
 * ficar com hover grudado. No toque a captura entra NA linha, como miniatura.
 */

// Dimmer das vizinhas: só com ponteiro de verdade, e nunca enquanto o teclado
// navega (aí o foco já diz onde se está, e apagar o resto tiraria contexto).
const LISTA =
  "border-b border-dashed border-cream/25 " +
  "[@media(hover:hover)]:[&:hover>li:not(:hover)]:opacity-45";

function Linha({
  project,
  index,
  lang,
  status,
}: {
  project: LocalizedProject;
  index: number;
  lang: Lang;
  status: Dict["status"];
}) {
  const numero = String(index + FEATURED_COUNT + 1).padStart(2, "0");
  const stack = project.stack.slice(0, 3);

  return (
    <li
      data-previa={index}
      className="group/linha border-t border-dashed border-cream/25 motion-safe:transition-opacity motion-safe:duration-300"
    >
      <a
        href={hrefProjeto(lang, project.slug)}
        className={
          "group/link relative grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3 py-6 " +
          "focus-visible:outline-cream focus-visible:outline-offset-[-2px] " +
          "md:grid-cols-[5.5rem_minmax(0,1fr)_auto_9.5rem] md:items-center md:gap-x-6 md:py-7 " +
          "lg:grid-cols-[7rem_minmax(0,1fr)_auto_minmax(0,14rem)_4rem_8.5rem_1.5rem] lg:gap-x-8"
        }
      >
        {/* número grande, em serifa: o ritmo vertical do índice */}
        <span
          aria-hidden
          className={
            "font-display text-[2.25rem] leading-[0.85] text-cream-700 md:text-[clamp(2.75rem,4.2vw,4rem)] " +
            "motion-safe:transition-colors motion-safe:duration-300 " +
            "[@media(hover:hover)]:group-hover/linha:text-gold group-focus-visible/link:text-gold"
          }
        >
          {numero}
        </span>

        {/* nome + tagline */}
        <span className="col-span-2 row-start-2 block min-w-0 md:col-span-1 md:row-start-auto">
          <span
            className={
              "block font-display text-[1.75rem] uppercase leading-[0.98] tracking-[0.01em] md:text-[clamp(1.875rem,3vw,2.75rem)] " +
              "motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] " +
              "[@media(hover:hover)]:group-hover/linha:translate-x-3 group-focus-visible/link:translate-x-3"
            }
          >
            {project.name}
          </span>
          <span className="mt-2 block font-sans text-[0.9375rem] leading-[1.45] text-cream-600 md:line-clamp-1">
            {project.tagline}
          </span>
        </span>

        {/* miniatura: só onde não existe hover (toque). No desktop quem mostra
            a captura é a espiada que segue o cursor. */}
        <span className="col-start-3 row-span-2 row-start-1 hidden justify-self-end [@media(hover:none)]:block md:col-start-auto md:row-span-1 md:row-start-auto">
          <Miniatura project={project} />
        </span>

        {/* stack (lg) */}
        <span className="hidden font-mono text-tag uppercase text-cream-600 lg:col-start-4 lg:block">
          {stack.join(" · ")}
        </span>

        {/* ano (lg) */}
        <span className="hidden font-mono text-tag uppercase text-cream-700 lg:col-start-5 lg:block">
          {project.year}
        </span>

        {/* estado — no md ele leva o ano junto, porque a coluna do ano só
            existe a partir de lg */}
        <span className="col-span-3 row-start-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-tag uppercase text-cream-700 md:col-span-1 md:col-start-4 md:row-start-auto md:justify-self-end lg:col-start-6 lg:justify-self-start">
          <span className="inline-flex items-center gap-2 text-cream-600">
            <span aria-hidden className="h-1.5 w-1.5 bg-current" />
            {status[project.status]}
          </span>
          <span className="lg:hidden">{project.year}</span>
          <span className="md:hidden">{stack.slice(0, 2).join(" · ")}</span>
        </span>

        {/* seta (lg) */}
        <span
          aria-hidden
          className={
            "hidden justify-self-end font-sans text-lg text-cream-700 lg:col-start-7 lg:block " +
            "motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] " +
            "[@media(hover:hover)]:group-hover/linha:translate-x-1 [@media(hover:hover)]:group-hover/linha:text-cream"
          }
        >
          →
        </span>
      </a>
    </li>
  );
}

/** A miniatura da linha no toque: 4:3, em cor natural, moldura creme a 25%. */
function Miniatura({ project }: { project: LocalizedProject }) {
  return (
    <span className="block w-[4.75rem] border border-cream/25">
      {project.cover ? (
        <span className="relative block aspect-[4/3] overflow-hidden">
          <Image
            src={project.cover}
            alt=""
            fill
            sizes="76px"
            loading="lazy"
            className="object-cover object-top"
          />
        </span>
      ) : (
        <ProjectCover
          slug={project.slug}
          name={project.name}
          size="thumb"
          className="aspect-[4/3] w-full"
        />
      )}
    </span>
  );
}

export function ProjectGrid({ lang }: { lang: Lang }) {
  const projetos = getMoreProjects(lang);
  const d = dict[lang];

  // O que a espiada precisa saber de cada linha — e nada além. Vai para o
  // cliente como prop, no idioma da rota.
  const previas: Previa[] = projetos.map((p) => ({
    slug: p.slug,
    name: p.name,
    cover: p.cover,
    language: p.stack[0],
  }));

  return (
    <Bloco ground="carvao" id="more">
      <div className="mx-auto max-w-[96rem]">
        <CabecalhoPasta
          d={d.vitrine.indice}
          contagem={contar(d.vitrine.itens, projetos.length)}
          tone="carvao"
        />

        <EspiaIndice
          previas={previas}
          rotulo={d.vitrine.espiar}
          className="mt-[clamp(3rem,7vw,5.5rem)]"
        >
          <ol aria-label={d.vitrine.listaIndice} className={LISTA}>
            {projetos.map((project, i) => (
              <Linha
                key={project.slug}
                project={project}
                index={i}
                lang={lang}
                status={d.status}
              />
            ))}
          </ol>
        </EspiaIndice>
      </div>
    </Bloco>
  );
}
