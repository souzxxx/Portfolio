import { Bloco } from "../ui/Bloco";
import { Meta } from "../ui/Meta";
import { Label } from "../ui/Label";
import { SectionHeader } from "../ui/SectionHeader";
import { DuotoneImage } from "../ui/DuotoneImage";
import { ProjectCover } from "./ProjectCover";
import { moreProjects, type Project, type ProjectStatus } from "@/lib/projects";

/**
 * ProjectGrid — o TERCEIRO campo de cor do site: BREU.
 *
 * Saiu a grade de 14 cartoes em 3 colunas (canto arredondado, blur de fundo,
 * capa 16:10, gradiente no hover e um deslocamento de -6px por cartao).
 * Entrou um INDICE TABULAR: 14 linhas numeradas #06…#19 — a numeracao continua
 * de onde os 5 destaques pararam — com as colunas No · MINIATURA · NOME · ANO ·
 * STACK/STATUS, e a linha inteira invertendo para creme solido no hover.
 *
 * SOBRE BREU O ACENTO E O CREME. O azul de assinatura sobre breu da 2.00:1, e
 * por isso nao existe uma unica classe de cor azul neste arquivo, de proposito.
 * Os tons usados sao os tres medidos contra #141414: `cream` 16.61:1,
 * `cream-600` 12.43:1 e `cream-700` 7.41:1. Quando a linha inverte, todos viram
 * os tons medidos contra #F5F3EE: `ink` 16.61:1, `ink-600` 10.25:1, `ink-700`
 * 6.50:1. Nenhum estado desta secao sai da matriz.
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

/** deployed → NO AR · shipped → ENTREGUE · wip → EM CURSO. */
const STATUS_LABEL: Record<ProjectStatus, string> = {
  deployed: "NO AR",
  shipped: "ENTREGUE",
  wip: "EM CURSO",
};

/**
 * Preset da cianotipia por projeto. So tres dos 14 tem screenshot; o criterio e
 * a luminancia da captura, nao o projeto:
 *
 *   universe-project → `dark`  UI escura, o preset padrao abre bem.
 *   ml-copa          → `dark`  o PNG e regerado em duotone azul por outro item
 *                              da wave; ate la a versao antiga sai clara.
 *   usp-fono         → `light` MEDIDO: a captura e uma UI quase branca (topo
 *                              petroleo, corpo #EAF6F8 com cartoes brancos).
 *                              Com `dark` o `screen` estoura e a miniatura vira
 *                              uma chapa creme lisa, sem desenho nenhum; com
 *                              `light` (contraste 1.05 / brilho 0.86) o
 *                              cabecalho e a grade de cartoes voltam a aparecer.
 *
 * Qualquer projeto fora do mapa cai no padrao `dark`.
 */
const DUO_PRESET: Record<string, "light" | "dark"> = {
  "usp-fono": "light",
};

/**
 * A inversao creme↔breu da linha inteira, em tres estados:
 *   `md:group-hover` — ponteiro, so no desktop (evita o hover grudado do touch);
 *   `group-focus-within` — teclado, com a mesma leitura visual do hover;
 *   `active` — toque, o unico retorno visual que o celular tem.
 *
 * Como cada celula pinta a propria cor, a inversao precisa ser repetida celula
 * a celula: `text-ink` no wrapper so resolveria o que herda `currentColor`.
 *
 * A classe `group` fica no <li> APENAS quando a linha tem destino (ver
 * `ProjectRow`). Sem essa condicao, passar o mouse por uma linha sem link
 * viraria o texto para os tons de papel mantendo o fundo breu — `ink-600` sobre
 * `ink` da 1.9:1, ou seja, texto invisivel.
 */
const ROW =
  "block motion-safe:transition-colors motion-safe:duration-150 " +
  "active:bg-cream active:text-ink " +
  "group-focus-within:bg-cream group-focus-within:text-ink " +
  "md:group-hover:bg-cream md:group-hover:text-ink " +
  // REGRA SISTEMATICA: todo elemento que INVERTE o fundo no foco precisa fixar
  // a cor do anel na cor do BLOCO, nunca deixa-la em `currentColor`. O anel
  // global (globals.css) e `2px solid currentColor` com offset de 2px, ou seja,
  // ele e desenhado FORA da caixa invertida — sobre o breu da secao. Como a
  // linha focada vira `text-ink` #141414, `currentColor` daria 1:1 contra o
  // fundo breu e o anel simplesmente nao existiria. Em creme sao 16.61:1.
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

function ProjectRow({ project, index }: { project: Project; index: number }) {
  // Continua a numeracao dos 5 destaques: o primeiro item do indice e o #06.
  const numero = `#${String(index + 6).padStart(2, "0")}`;
  const status = STATUS_LABEL[project.status];
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

      {/* 1b · status, so no mobile: no desktop ele viaja junto da stack */}
      <Label className="col-start-2 justify-self-end md:hidden">
        STATUS: {status}
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

      {/* 2 · miniatura 56x42. NAO inverte no hover — screenshot invertido fica
              sujo; o que muda e so a opacidade. Fora do mobile, onde a coluna
              inteira nao existe. */}
      <div className="hidden md:block">
        {project.cover ? (
          <DuotoneImage
            src={project.cover}
            alt=""
            ratio="4 / 3"
            sizes="56px"
            preset={DUO_PRESET[project.slug] ?? "dark"}
            interactive={false}
            className="w-full opacity-70 motion-safe:transition-opacity motion-safe:duration-150 md:group-hover:opacity-100"
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

export function ProjectGrid() {
  return (
    <Bloco ground="ink" id="more">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeader
          eyebrow="#03 · ÍNDICE"
          title="Mais projetos"
          description="Coisas que construí explorando linguagens, paradigmas e domínios — de Prolog a Python, de compilador a firmware embarcado, de jogos a automação de processos."
          tone="ink"
        />

        {/* A borda de baixo fecha o indice: cada linha traz a propria borda de
            cima, entao sem isto a ultima ficaria aberta. */}
        <ol className="mt-[clamp(2.5rem,6vw,4rem)] border-b border-dashed border-cream/25">
          {moreProjects.map((project, i) => (
            <ProjectRow key={project.slug} project={project} index={i} />
          ))}
        </ol>
      </div>
    </Bloco>
  );
}
