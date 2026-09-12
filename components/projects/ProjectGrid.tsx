import { Bloco } from "../ui/Bloco";
import { Meta } from "../ui/Meta";
import { Label } from "../ui/Label";
import { SectionHeader } from "../ui/SectionHeader";
import { Chapa } from "../ui/Chapa";
import { ProjectCover } from "./ProjectCover";
import { FEATURED_COUNT } from "./FeaturedShowcase";
import { getMoreProjects, type LocalizedProject } from "@/lib/projects";
import { dict } from "@/lib/dict";
import type { Lang } from "@/lib/i18n";

/**
 * ProjectGrid — a volta ao CARVAO, depois de dois blocos de papel seguidos.
 *
 * Saiu a grade de cartoes em 3 colunas (canto arredondado, blur de fundo,
 * capa 16:10, gradiente no hover e um deslocamento de -6px por cartao).
 * Entrou um INDICE TABULAR: uma linha por projeto "more", numerada a partir de
 * onde os destaques pararam (ver FEATURED_COUNT), com as colunas No ·
 * MINIATURA · NOME · ANO · STACK/STATUS, e a linha inteira invertendo para
 * creme solido no hover.
 *
 * O IDIOMA E UMA PROP, NAO UM ESTADO. `lang` chega da rota (pt em "/", en em
 * "/en") e desce por `getMoreProjects(lang)` e `dict[lang]`. Nada aqui vira
 * `"use client"` por causa disso: a secao inteira — cabecalho, 14 linhas e as
 * 14 miniaturas — continua sendo HTML de servidor, que era o ponto de ter
 * gastado uma wave tirando JavaScript desta pagina.
 *
 * NAO HA MAIS UM `STATUS_LABEL` AQUI. Este arquivo mantinha uma tabela de tres
 * linhas (deployed/shipped/wip) em portugues, e o <StatusPill> mantinha OUTRA,
 * identica, do outro lado do repositorio — duas copias que so podiam divergir.
 * Os dois passaram a ler `dict[lang].status`, e o prefixo do rotulo mobile saiu
 * do JSX para `dict[lang].status.prefixo` ("STATUS:" nos dois idiomas, mas no
 * dicionario, onde o tradutor consegue ve-lo).
 *
 * SOBRE CARVAO O ACENTO E O CREME — e nao ha um segundo escuro para disputar
 * com ele. Os tons usados sao os tres medidos contra #1C1A17: `cream` 15.66:1,
 * `cream-600` 11.72:1 e `cream-700` 6.99:1. Quando a linha inverte, todos viram
 * os tons medidos contra #F5F3EE: `carvao` 15.66:1, `ink-600` 10.25:1,
 * `ink-700` 6.50:1. Nenhum estado desta secao sai da matriz.
 *
 * UM markup, DOIS layouts. E uma <ol> semantica e nao uma <table> justamente
 * para que as mesmas celulas se reorganizem por posicionamento de grid em vez
 * de duplicarem conteudo: nome, tagline e miniatura existem uma unica vez no
 * DOM. So os dois rotulos de metadado — que mudam de composicao entre os
 * layouts — tem variante por breakpoint.
 *
 * MOBILE 390 e DESENHADO, nao herdado: a coluna da miniatura sai do fluxo e a
 * linha vira um bloco de quatro linhas de texto com o alvo de toque sangrando
 * ate as bordas da viewport. A secao que ocupava ~14 telas de cartao com imagem
 * passa a ser um indice varrivel de ~4.
 */

/**
 * O MAPA DE PRESET DA CIANOTIPIA MORREU COM ELA. Ele existia porque o duotone
 * reagia a luminancia da captura: a UI quase branca do usp-fono estourava no
 * `screen` e a miniatura saia como uma chapa creme lisa, sem desenho, entao
 * cada screenshot precisava de uma calibracao propria. Em cor natural nao ha
 * calibracao a fazer — a captura e ela mesma, clara ou escura.
 */

/**
 * A inversao creme↔carvao da linha inteira, em tres estados:
 *   `md:group-hover` — ponteiro, so no desktop (evita o hover grudado do touch);
 *   `group-focus-within` — teclado, com a mesma leitura visual do hover;
 *   `active` — toque, o unico retorno visual que o celular tem.
 *
 * Como cada celula pinta a propria cor, a inversao precisa ser repetida celula
 * a celula: `text-carvao` no wrapper so resolveria o que herda `currentColor`.
 *
 * A classe `group` fica no <li> APENAS quando a linha tem destino (ver
 * `ProjectRow`). Sem essa condicao, passar o mouse por uma linha sem link
 * viraria o texto para os tons de papel mantendo o fundo carvao — `ink-600`
 * sobre carvao da 1.53:1, ou seja, texto invisivel.
 */
const ROW =
  "block motion-safe:transition-colors motion-safe:duration-150 " +
  "active:bg-cream active:text-carvao " +
  "group-focus-within:bg-cream group-focus-within:text-carvao " +
  "md:group-hover:bg-cream md:group-hover:text-carvao " +
  // REGRA SISTEMATICA: todo elemento que INVERTE o fundo no foco precisa fixar
  // a cor do anel na cor do BLOCO, nunca deixa-la em `currentColor`. O anel
  // global (globals.css) e `2px solid currentColor` com offset de 2px, ou seja,
  // ele e desenhado FORA da caixa invertida — sobre o carvao da secao. Como a
  // linha focada vira `text-carvao` #1C1A17, `currentColor` daria 1:1 contra o
  // fundo carvao e o anel simplesmente nao existiria. Em creme sao 15.66:1.
  // Mesmo ajuste ja aplicado em About.tsx, Footer.tsx e NavBar.tsx.
  "focus-visible:outline-cream";
const INV_600 =
  "text-cream-600 motion-safe:transition-colors motion-safe:duration-150 " +
  "group-active:text-ink-600 group-focus-within:text-ink-600 md:group-hover:text-ink-600";
const INV_700 =
  "text-cream-700 motion-safe:transition-colors motion-safe:duration-150 " +
  "group-active:text-ink-700 group-focus-within:text-ink-700 md:group-hover:text-ink-700";

/**
 * Sangria lateral: no mobile a faixa invertida atravessa o gutter, para o alvo
 * de toque ir de borda a borda da viewport; no desktop ela volta a coincidir
 * exatamente com a largura dos filetes tracejados, para o indice ler como uma
 * grade de celulas e nao como uma fileira de botoes. Os dois valores se anulam,
 * entao a coluna do numero fica alinhada com o rotulo da secao nos dois casos.
 */
const SANGRIA = "-mx-[var(--gutter)] px-[var(--gutter)] py-4 md:mx-0 md:px-0";

function ProjectRow({
  project,
  index,
  lang,
}: {
  project: LocalizedProject;
  index: number;
  lang: Lang;
}) {
  const d = dict[lang];
  // Continua a numeracao dos destaques: o primeiro item do indice e o numero
  // seguinte ao ultimo card do FeaturedShowcase. O deslocamento vem de
  // FEATURED_COUNT, e nao de um numero cravado aqui — promover um projeto para
  // destaque mudava a numeracao de 14 linhas sem nada falhar.
  const numero = `#${String(index + FEATURED_COUNT + 1).padStart(2, "0")}`;
  // O rotulo do estado, no idioma da rota. O mais largo dos seis e o ingles
  // "IN PROGRESS": 11 caracteres a 0.6875rem em Courier Prime (avanco 0.6em)
  // mais 0.18em de tracking dao ~94px, e a coluna de status do desktop tem
  // 9rem = 144px — ou seja, o ingles cabe na mesma trilha sem reflow.
  const status = d.status[project.status];
  // Demo tem prioridade sobre repositorio: o que esta no ar vale mais que o
  // codigo. Sem nenhum dos dois a linha continua existindo — so nao e link.
  const href = project.demo ?? project.github;

  const conteudo = (
    <div
      className={
        // MOBILE: 3 colunas — numero · status · seta — com o titulo e o
        // metadado sangrando pelas tres.
        // DESKTOP: as 5 colunas do indice. As celulas exclusivas do mobile
        // saem do fluxo (`display: none` nao gera caixa de grid), entao os
        // cinco filhos restantes caem exatamente nas cinco trilhas, sem
        // posicionamento explicito.
        "grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 " +
        "md:grid-cols-[3rem_3.5rem_minmax(0,1fr)_5rem_9rem] md:gap-4 md:gap-y-0"
      }
    >
      {/* 1 · numero de indice */}
      <Label className={INV_700}>{numero}</Label>

      {/* 1b · status, so no mobile: no desktop ele viaja junto da stack.
              O "STATUS:" e um rotulo de metadado como qualquer outro e por
              isso mora no dicionario, e nao aqui — mesmo saindo igual nas duas
              linguas, um rotulo invisivel ao tradutor e um rotulo que a
              proxima lingua esquece. */}
      <Label className="col-start-2 justify-self-end md:hidden">
        {d.status.prefixo} {status}
      </Label>

      {/* 1c · alvo de 44x44 para o toque. A margem vertical negativa devolve a
              altura visual da linha sem encolher a area clicavel.
              A celula existe mesmo quando a linha nao tem destino: sem ela a
              trilha `auto` colapsaria e o `STATUS:` das duas linhas sem link
              avancaria 44px a direita das outras doze, serrilhando a coluna. */}
      <span
        aria-hidden
        className="col-start-3 -my-2.5 flex h-11 w-11 items-center justify-center text-lg md:hidden"
      >
        {href ? "↗" : ""}
      </span>

      {/* 2 · miniatura 56x42, em COR NATURAL como as capas dos destaques. NAO
              inverte no hover — screenshot invertido fica sujo; o que muda e so
              a opacidade. A moldura e creme a 20% (e nao carvao) porque aqui a
              chapa cai sobre o carvao da secao: uma borda escura sobre fundo
              escuro nao existiria. Fora do mobile, onde a coluna inteira nao
              existe.
              E NAO GANHA LUPA. As chapas dos destaques ampliam porque vivem
              soltas no card; estas vivem DENTRO do <a> da linha, e um clique
              que as vezes navega para o projeto e as vezes abre um dialogo e
              pior que qualquer um dos dois sozinho — o visitante perde a
              previsibilidade do alvo, que e a unica coisa que um indice
              tabular tem a oferecer. */}
      <div className="hidden md:block">
        {project.cover ? (
          <Chapa
            src={project.cover}
            alt=""
            ratio="4 / 3"
            sizes="56px"
            className="w-full border border-cream/20 opacity-70 motion-safe:transition-opacity motion-safe:duration-150 md:group-hover:opacity-100"
          />
        ) : (
          // O wrapper carrega a proporcao 4/3 e o recorte: assim a capa
          // procedural preenche a celula por altura, sem depender de qual
          // proporcao ela declara internamente.
          <div className="aspect-[4/3] w-full overflow-hidden opacity-70 motion-safe:transition-opacity motion-safe:duration-150 md:group-hover:opacity-100">
            <ProjectCover
              slug={project.slug}
              name={project.name}
              size="thumb"
              className="aspect-[4/3] h-full w-full"
            />
          </div>
        )}
      </div>

      {/* 3 · nome + tagline */}
      <div className="col-span-3 md:col-span-1">
        <h3 className="font-display text-[22px] uppercase leading-[1.12] tracking-alta md:text-[1.35rem]">
          {project.name}
        </h3>
        <p
          className={`mt-1 line-clamp-2 font-sans text-[14px] leading-[1.45] md:mt-0.5 md:line-clamp-1 md:text-[13px] ${INV_600}`}
        >
          {project.tagline}
        </p>
      </div>

      {/* 4 · ano (desktop) */}
      <Label className="hidden md:block">{project.year}</Label>

      {/* 5 · status + stack (desktop) */}
      <Meta
        items={[status, project.stack.slice(0, 2).join(" · ")]}
        className={`hidden md:block ${INV_600}`}
      />

      {/* 5b · no mobile o ano entra no metadado, porque o status ja subiu para
              a primeira linha */}
      <Meta
        items={[project.year, ...project.stack.slice(0, 2)]}
        className={`col-span-3 md:hidden ${INV_700}`}
      />
    </div>
  );

  return (
    <li
      className={`border-t border-dashed border-cream/25${href ? " group" : ""}`}
    >
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className={`${ROW} ${SANGRIA}`}>
          {conteudo}
        </a>
      ) : (
        // Sem destino nao ha inversao: o codigo e fechado (ou nao existe
        // repositorio publico), e prometer um clique que nao acontece e pior
        // do que a linha ficar estatica.
        <div className={`block ${SANGRIA}`}>{conteudo}</div>
      )}
    </li>
  );
}

export function ProjectGrid({ lang }: { lang: Lang }) {
  // A lista ja chega achatada no idioma da rota: `getMoreProjects` devolve
  // `LocalizedProject`, onde nome e tagline sao `string`. Este componente nunca
  // ve um `I18n`, e por isso nao ha um `pick()` perdido no meio do JSX.
  const projetos = getMoreProjects(lang);
  const d = dict[lang];

  return (
    <Bloco ground="carvao" id="more">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeader
          eyebrow={d.secoes.indice.eyebrow}
          title={d.secoes.indice.title}
          description={d.secoes.indice.description}
          tone="carvao"
        />

        {/* A borda de baixo fecha o indice: cada linha traz a propria borda de
            cima, entao sem isto a ultima ficaria aberta. */}
        <ol className="mt-[clamp(2.5rem,6vw,4rem)] border-b border-dashed border-cream/25">
          {projetos.map((project, i) => (
            <ProjectRow
              key={project.slug}
              project={project}
              index={i}
              lang={lang}
            />
          ))}
        </ol>
      </div>
    </Bloco>
  );
}
