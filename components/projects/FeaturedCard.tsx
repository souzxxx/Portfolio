"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { Reveal } from "../ui/Reveal";
import { Meta } from "../ui/Meta";
import { Label } from "../ui/Label";
import { DashedRule } from "../ui/DashedRule";
import { Botao } from "../ui/Botao";
import { StatusPill } from "../ui/StatusPill";
import { Chapa } from "../ui/Chapa";
import { Lupa, type ItemAmpliavel } from "../ui/Lupa";
import { ProjectCover } from "./ProjectCover";
import type { DictCard } from "@/lib/dict";
import type { LocalizedProject } from "@/lib/projects";

/**
 * FeaturedCard — uma faixa da fita editorial dos projetos em destaque.
 *
 * Saiu o card de vidro inteiro: canto de 24px, borda tenue, fundo translucido,
 * desfoque de fundo, sombra difusa colorida, 40px de padding, hover que acende
 * a borda, `whileHover` de escala e os seis icones de biblioteca. Entrou papel:
 * filete tracejado no topo, chapa a esquerda, texto a direita, e nada mais — a
 * separacao entre projetos e o filete, nao uma caixa.
 *
 * A ALTERNANCIA PAR/IMPAR MORREU. Nao existe mais `index % 2` nem
 * `md:order-1`/`md:order-2`: a capa fica SEMPRE a esquerda e o texto SEMPRE a
 * direita, em todos. Alternar lado e o gesto que faz uma pagina ler como
 * landing page; repeticao rigida e o que faz ler como fita/relatorio, que e a
 * tese desta identidade.
 *
 * ── MOBILE 390px, DESENHADO E NAO HERDADO ─────────────────────────────────
 * Uma coluna, e a capa em SANGRIA TOTAL: `-mx-[var(--gutter)] w-screen` cancela
 * o gutter do <Bloco> e leva a chapa de borda a borda da viewport, em 4:5
 * (retrato) para ela dominar a primeira tela de cada projeto. No desktop a
 * mesma capa volta para dentro da coluna de 22rem, quadrada. A troca de
 * proporcao viaja numa custom property (`--capa`, um numero puro: 0.8 no
 * celular, 1 a partir de md) porque `ratio` e uma prop unica de string — assim
 * uma imagem so atende as duas telas, sem segunda instancia do next/image.
 *
 * ── AS CAPAS SAEM EM COR NATURAL ──────────────────────────────────────────
 * A cianotipia (base azul + `screen` + `multiply` creme + hachura diagonal, com
 * a cor real voltando no hover e um botao `[ COR ]` no mobile) foi removida dos
 * screenshots reais. Screenshot de projeto e PROVA de que a coisa existe e
 * roda; tingir a prova e cobri-la de listras faz o leitor decodificar o efeito
 * em vez de ler a interface, e esconde justamente o que o card esta afirmando.
 * Sobrou uma moldura de 1px em carvao — no mobile so em cima e embaixo, porque
 * la a chapa sangra ate as bordas da viewport e uma moldura fechada viraria
 * dois fios colados no vidro. A gravura de duas cores continua nas capas
 * GERADAS (<ProjectCover>, projetos sem screenshot), onde ela e desenho e nao
 * registro.
 *
 * ── A LUPA: QUAL CHAPA AMPLIA E QUAL NAO ──────────────────────────────────
 * Clicar na chapa grande abre <Lupa> (o <dialog> nativo de components/ui). Tres
 * decisoes de escopo, nesta ordem de importancia:
 *
 * 1. A CAPA PROCEDURAL (<ProjectCover>) NAO AMPLIA. Ela e um desenho gerado a
 *    partir do slug, nao um registro: nao existe captura por tras dela para
 *    revelar. Um clique que so devolve a mesma gravura em 1400px promete
 *    conteudo e entrega zoom — e o visitante gasta o gesto para descobrir que
 *    nao havia nada a ver. Projeto sem screenshot fica sem lupa, e a ausencia
 *    do rotulo AMPLIAR na legenda e o que avisa isso antes do clique.
 *
 * 2. AS MINIATURAS DA FOLHA DE CONTATO NAO ABREM A LUPA. Elas ja tem uma
 *    funcao — trocar a chapa grande — e empilhar um segundo comportamento no
 *    mesmo clique tornaria as duas ambiguas: o visitante deixa de saber se o
 *    proximo toque troca a imagem ou abre a tela cheia. Quem amplia e sempre a
 *    chapa grande, uma unica superficie clicavel por card.
 *
 * 3. A LUPA COMPARTILHA O `activeIdx` COM A FOLHA DE CONTATO, em vez de ter um
 *    indice proprio. E o que faz a navegacao ← → de dentro do dialogo sair pela
 *    frente: ao fechar, a chapa grande da pagina esta na imagem que a pessoa
 *    estava olhando, e nao naquela em que ela entrou. Dois estados separados
 *    dariam o efeito contrario — navegar quatro chapas e voltar para a
 *    primeira le como se o site tivesse descartado o que ela acabou de fazer.
 *
 * A AFORDANCIA E TEXTO, nao um icone sobreposto na imagem: `AMPLIAR` entra na
 * linha de legenda que ja existe abaixo da chapa, no mesmo dialeto de metadado
 * do resto do card. Nao ha overlay semitransparente, lupa desenhada nem
 * escurecimento no hover porque nao ha nenhum deles em lugar nenhum do site.
 */

// Sangria de mobile. Ela mora no WRAPPER da chapa, e nao mais na propria
// <Chapa>: o botao invisivel da lupa e `absolute inset-0` dentro desse wrapper,
// entao a area clicavel so cobre a imagem inteira se os dois tiverem exatamente
// a mesma caixa. Com a sangria na Chapa, a imagem vazava ~var(--gutter) para
// cada lado do wrapper no celular e essas duas faixas — as mais proximas do
// polegar — ficavam mortas.
const CAPA_SANGRIA = "-mx-[var(--gutter)] w-screen md:mx-0 md:w-full";
// 100vw enquanto sangra; 22rem quando volta para a coluna do desktop.
const CAPA_SIZES = "(max-width: 768px) 100vw, 22rem";
// Moldura da chapa sobre papel: 1px de carvao (15.66:1). `border-y` no mobile,
// onde a imagem sangra; as quatro bordas a partir de `md`, onde ela volta para
// dentro da coluna de 22rem.
const CAPA_MOLDURA = "border-y border-carvao md:border";

/**
 * O botao que abre a lupa: uma lamina transparente do tamanho exato da chapa.
 *
 * POR QUE UMA LAMINA E NAO UM <button> EMBRULHANDO A CHAPA. <button> nao pode
 * conter <figure>, e a <Chapa> renderiza <figure> — a mesma armadilha que ja
 * obrigou as miniaturas da folha de contato a chamar next/image direto. Um
 * <figure> dentro de <button> nao quebra a tela, o parser HTML so o expulsa do
 * botao, e o resultado e um botao vazio de altura zero com a imagem ao lado:
 * defeito silencioso, visivel apenas no dedo.
 *
 * O ANEL DE FOCO E FIXADO EM CARVAO, nao herdado. O anel global e
 * `2px solid currentColor` com offset de 2px, ou seja, desenhado FORA da
 * lamina: ele cai sobre o papel da secao, onde carvao da 15.66:1. Sem fixar a
 * cor, `currentColor` de um botao sem texto herdaria a cor do bloco e o anel
 * ficaria da cor do proprio fundo. O offset positivo tambem e a razao de o
 * botao ficar no wrapper e nao dentro da <Chapa>, que e `overflow-hidden` e
 * recortaria o anel rente a imagem.
 */
const LAMINA_LUPA =
  "absolute inset-0 cursor-zoom-in focus-visible:outline-carvao";

export function FeaturedCard({
  project,
  index,
  d,
}: {
  project: LocalizedProject;
  index: number;
  d: DictCard;
}) {
  const gallery =
    project.gallery && project.gallery.length > 0 ? project.gallery : null;
  // O crossfade e animacao de JS: o bloco global de `prefers-reduced-motion`
  // do globals.css zera transicao e animacao de CSS, mas nao alcanca o framer.
  // Com a preferencia ligada, a troca de chapa e instantanea.
  const semMovimento = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const [lupaAberta, setLupaAberta] = useState(false);
  const active = gallery ? gallery[activeIdx] : null;

  /**
   * O que a lupa mostra — e `null` quando nao ha o que ampliar.
   *
   * Com galeria, os itens sao a galeria INTEIRA e nao so a chapa ativa: a
   * pessoa clicou na terceira captura, mas o que ela quer ver agora e o
   * projeto em tela cheia, e obriga-la a fechar, escolher a quarta miniatura e
   * ampliar de novo seria cobrar tres gestos pelo que as setas ← → fazem em um.
   *
   * So com `cover`, um item unico: o dialogo esconde sozinho o contador e as
   * setas quando `itens.length === 1`, entao nao ha navegacao prometida e
   * inerte. A legenda desse item e `card.capturaDeTela` porque e literalmente o
   * que a imagem e — e o mesmo sufixo que o `alt` da chapa ja usa, entao o
   * texto lido na pagina e o lido no dialogo nao divergem.
   */
  const itensLupa: ItemAmpliavel[] | null = gallery
    ? gallery
    : project.cover
      ? [{ src: project.cover, label: d.card.capturaDeTela }]
      : null;

  return (
    <Reveal delay={index * 0.04}>
      <article className="grid border-t border-dashed border-carvao/30 py-[clamp(2.5rem,5vw,4.5rem)] md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-x-12">
        {/* ── ESQUERDA: a chapa ───────────────────────────────────────────── */}
        <div className="[--capa:0.8] md:[--capa:1]">
          {gallery && active ? (
            <>
              {/* Empilhamento por grid (as duas camadas na mesma celula) em vez
                  de `absolute inset-0`: mantem a figura no fluxo, entao a altura
                  da celula continua vindo da propria proporcao da chapa e a
                  folha de contato continua caindo logo abaixo dela.

                  O `relative` daqui e o retangulo de referencia da lamina da
                  lupa. Ela e IRMA do crossfade e nao filha: dentro do
                  <motion.div> ela desmontaria e remontaria a cada troca de
                  chapa, e o foco do teclado cairia para o <body> no meio da
                  navegacao pela folha de contato. */}
              <div
                className={clsx(
                  "relative grid [&>*]:col-start-1 [&>*]:row-start-1",
                  CAPA_SANGRIA,
                )}
              >
                <AnimatePresence initial={false}>
                  {/* O UNICO crossfade do site. Ele nao esta aqui para enfeitar:
                      a legenda troca junto com a chapa, e os 0.35s sao o tempo
                      de perceber que a legenda mudou. */}
                  <motion.div
                    key={active.src}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: semMovimento ? 0 : 0.35,
                      ease: "linear",
                    }}
                  >
                    <Chapa
                      src={active.src}
                      alt={`${project.name} — ${active.label}`}
                      ratio="var(--capa)"
                      sizes={CAPA_SIZES}
                      // SEM `priority`, nem no primeiro card. MEDIDO em
                      // 1440x900: esta chapa nasce em y = 2239px, duas telas e
                      // meia abaixo da dobra — e `priority` emitiria no <head>
                      // um `<link rel="preload" as="image" fetchpriority="high">`
                      // com srcset ate 1920w, roubando banda e prioridade de
                      // rede da Instrument Serif do <h1>, que e o LCP. A Chapa
                      // ja cai em `loading="lazy"` sem a prop.
                      className={CAPA_MOLDURA}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* `ampliarAria` JA TERMINA em dois-pontos ("Ampliar:" /
                    "Expand:"), entao aqui entra um ESPACO e a legenda da chapa
                    ativa — "Ampliar: Luna — assistente IA financeira
                    conversacional". A legenda e o que distingue este botao dos
                    outros cinco da pagina; um "Ampliar" solto repetido seis
                    vezes na lista de controles do leitor de tela nao diz qual
                    imagem abre. */}
                <button
                  type="button"
                  onClick={() => setLupaAberta(true)}
                  aria-label={`${d.lupa.ampliarAria} ${active.label}`}
                  className={LAMINA_LUPA}
                />
              </div>

              {/* A afordancia entra como mais um item de metadado na linha que
                  ja existia — sem caixa, sem seta. ↗ e ↓ ja significam "sai do
                  site" e "baixa arquivo" neste vocabulario, e ampliar nao faz
                  nenhum dos dois. */}
              <Meta
                items={[active.label, d.lupa.ampliar]}
                className="mt-2 text-ink-700"
              />

              {/* Folha de contato: a fresta de 1px entre as miniaturas E o
                  divisor — o fundo escuro do container aparece pelo `gap-px`,
                  sem borda em nenhuma delas. */}
              <div className="mt-3 grid grid-cols-4 gap-px bg-carvao/25">
                {gallery.map((shot, i) => (
                  <button
                    key={shot.src}
                    type="button"
                    aria-label={shot.label}
                    aria-pressed={activeIdx === i}
                    // Hover NAO e o unico caminho: clique e foco fazem o mesmo,
                    // entao teclado e toque chegam a qualquer chapa. E so isso:
                    // a miniatura TROCA a chapa grande, nunca abre a lupa (ver
                    // o item 2 do cabecalho deste arquivo).
                    onMouseEnter={() => setActiveIdx(i)}
                    onFocus={() => setActiveIdx(i)}
                    onClick={() => setActiveIdx(i)}
                    className={clsx(
                      // Tambem em cor natural. O <button> nao pode conter um
                      // <figure>, entao a miniatura nao passa pela <Chapa>: o
                      // next/image com `fill` entra direto, e o `relative` daqui
                      // e o que lhe da o retangulo de referencia.
                      "relative h-14 overflow-hidden md:h-16",
                      "motion-safe:transition-opacity motion-safe:duration-150",
                      activeIdx === i
                        ? "outline outline-2 outline-carvao outline-offset-0"
                        : "opacity-75 hover:opacity-100 focus-visible:opacity-100",
                    )}
                  >
                    <Image
                      src={shot.src}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            </>
          ) : project.cover ? (
            <>
              <div className={clsx("relative", CAPA_SANGRIA)}>
                <Chapa
                  src={project.cover}
                  alt={`${project.name} — ${d.card.capturaDeTela}`}
                  ratio="var(--capa)"
                  sizes={CAPA_SIZES}
                  className={CAPA_MOLDURA}
                />
                {/* Sem galeria nao ha legenda de chapa, entao o nome do projeto
                    entra no lugar dela: "Ampliar: Sentinel — captura de tela".
                    Dentro do dialogo o nome nao se repete — a <Lupa> ja recebe
                    `titulo={project.name}` e monta o `alt` com ele. */}
                <button
                  type="button"
                  onClick={() => setLupaAberta(true)}
                  aria-label={`${d.lupa.ampliarAria} ${project.name} — ${d.card.capturaDeTela}`}
                  className={LAMINA_LUPA}
                />
              </div>

              {/* Aqui a linha de legenda NASCE com a afordancia: sem galeria nao
                  havia legenda nenhuma abaixo da chapa, e sem essa linha o unico
                  aviso de que a imagem amplia seria o cursor — que nao existe no
                  celular, onde esta capa ocupa a viewport inteira. */}
              <Meta items={[d.lupa.ampliar]} className="mt-2 text-ink-700" />
            </>
          ) : (
            // Sem screenshot: a gravura procedural de raios, carvao + creme.
            // NAO recebe lamina de lupa — e desenho, nao registro (item 1 do
            // cabecalho), e por isso tambem nao ganha a linha com AMPLIAR.
            <ProjectCover
              slug={project.slug}
              name={project.name}
              language={project.stack[0]}
              className={clsx(CAPA_SANGRIA, "aspect-[var(--capa)]")}
            />
          )}

          {/* O dialogo mora ao lado da chapa que ele amplia, e nao no fim da
              pagina: `showModal()` promove o <dialog> para a top layer, entao a
              posicao no DOM nao tem efeito de layout nenhum — e fechado ele e
              `display: none` por regra de agente de usuario, sem ocupar celula
              de grid. Ficar junto e o que mantem estado, gatilho e superficie
              lendo-se no mesmo lugar do arquivo. */}
          {itensLupa && (
            <Lupa
              itens={itensLupa}
              indice={activeIdx}
              aberta={lupaAberta}
              onFechar={() => setLupaAberta(false)}
              onIndice={setActiveIdx}
              titulo={project.name}
              d={d.lupa}
            />
          )}
        </div>

        {/* ── DIREITA: o texto ────────────────────────────────────────────── */}
        <div className="mt-5 md:mt-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Vocabulario de metadado do site — BUILD/ANO/REPO. O numero e o
                ano sao dados e nao viram texto traduzido; so o rotulo vem do
                dicionario (ANO / YEAR). */}
            <Meta
              items={[
                `${d.card.build} ${String(index + 1).padStart(3, "0")}`,
                `${d.card.ano} ${project.year}`,
                project.isPrivate && d.card.repoPrivado,
              ]}
              className="text-ink-700"
            />
            <StatusPill status={project.status} d={d.status} />
          </div>

          <h3 className="mt-5 text-balance font-display text-d2 uppercase text-carvao">
            {project.name}
          </h3>

          {/* MEDIDA PROPRIA, mais apertada que a `medida` de 68ch da prosa: em
              `text-tag` (11px, tracking 0.18em, caixa alta) a linha corria os
              ~940px da coluna inteira, ou seja ~150 caracteres na tipografia
              menos legivel do sistema. 52ch da mono param a linha antes disso, e
              `text-balance` reparte as duas linhas em vez de deixar a segunda
              orfa — era o caso do commerce-nda ("REDIS COM CIRCUIT BREAKER"). */}
          <p className="mt-3 max-w-[52ch] text-balance font-mono text-tag uppercase text-carvao">
            {project.tagline}
          </p>

          <p className="medida mt-6 font-sans text-body text-ink-600">
            {project.description}
          </p>

          {project.highlights && (
            <ul className="mt-8">
              {project.highlights.map((h, i) => (
                <li
                  key={h}
                  // No celular o numero vai ACIMA do texto: uma calha de 2.5rem
                  // sobrando de 350px espremeria a linha em duas ou tres
                  // palavras. Da md para cima ele volta para a calha.
                  className="grid grid-cols-1 gap-1 border-t border-dashed border-carvao/20 py-3 md:grid-cols-[2.5rem_1fr] md:gap-3"
                >
                  <span className="font-mono text-tag text-carvao">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* `medida` no TEXTO e nao na linha: o filete tracejado
                      atravessa a coluna inteira (e o que faz a lista ler como
                      tabela), enquanto a prosa para nas 68ch — alinhada com a
                      descricao e com a resposta de cada decisao. */}
                  <span className="medida font-sans text-body text-ink-600">
                    {h}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {project.decisions && (
            <div className="mt-10">
              {project.decisions.map((decisao, i) => (
                <div key={decisao.q} className="mt-8 first:mt-0">
                  <DashedRule className="border-carvao" />
                  <Label className="mt-4 block text-carvao">
                    {d.card.decisao} {String(i + 1).padStart(2, "0")}
                  </Label>
                  <p className="mt-2 text-balance font-display text-d3 uppercase text-carvao">
                    {decisao.q}
                  </p>
                  <p className="medida mt-2 font-sans text-body text-ink-600">
                    {decisao.a}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Meta
            items={[`${d.card.stack} ${project.stack.join(" · ")}`]}
            className="mt-8 text-ink-700"
          />

          <div className="mt-8 flex flex-wrap gap-3">
            {project.demo && (
              <Botao
                href={project.demo}
                external
                variant="solid"
                className="text-cream"
              >
                {d.card.verNoAr}
              </Botao>
            )}
            {project.github && !project.isPrivate && (
              <Botao
                href={project.github}
                external
                variant="outline"
                className="hover:text-cream"
              >
                {d.card.codigo}
              </Botao>
            )}
            {/* Repositorio fechado nao vira botao: um retangulo com a mesma
                forma dos CTAs promete um clique que nao existe. Vira metadado,
                na mesma linha, alinhado com os botoes. */}
            {project.isPrivate && (
              <Meta
                items={[d.card.repositorioPrivado]}
                className="self-center text-ink-700"
              />
            )}
            {project.writeup && (
              <Botao
                href={project.writeup}
                external
                variant="outline"
                className="hover:text-cream"
              >
                {d.card.arquitetura}
              </Botao>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}
