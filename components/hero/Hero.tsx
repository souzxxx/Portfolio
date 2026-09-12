"use client";

import dynamic from "next/dynamic";
import clsx from "clsx";
import { Fragment } from "react";
import { Botao } from "../ui/Botao";
import { DashedRule } from "../ui/DashedRule";
import { Meta } from "../ui/Meta";
import { Reveal } from "../ui/Reveal";
import { StatsCounter } from "./StatsCounter";
import { TerminalLine } from "./TerminalLine";
import { stats } from "@/lib/projects";
import type { Dict } from "@/lib/dict";
import { CV_PDF } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

/**
 * A gravura da direita entra por `next/dynamic` com `ssr: false`: o chunk do
 * three nao existe no HTML, nao existe no bundle inicial e so e buscado depois,
 * ja dentro do proprio componente, em `requestIdleCallback`. `loading: () =>
 * null` porque nao ha o que mostrar enquanto carrega — o lugar dele ja e carvao.
 *
 * E este dynamic, e SO ele, que obriga o hero a ser `"use client"`: `ssr:false`
 * nao existe em componente de servidor no App Router. O idioma NAO acrescenta
 * nada a essa fronteira — ele chega como a prop `lang` e e lido de `dict[lang]`,
 * exatamente como nos blocos de servidor. O que ele acrescenta e peso: como
 * `lib/dict.ts` exporta as DUAS linguas num objeto so, o chunk deste componente
 * carrega o texto do site em portugues E em ingles. E o preco de ter o hero do
 * lado do cliente, nao do idioma ser rota — nos blocos que continuam no
 * servidor (Chapa, ProjectGrid, os cinco SectionHeader) o dicionario nao cruza
 * a rede.
 */
const EngravedObject = dynamic(
  () => import("./EngravedObject").then((m) => m.EngravedObject),
  { ssr: false, loading: () => null },
);

/**
 * Cada CTA vive dentro de um wrapper de layout, e nao com classes de layout no
 * proprio <Botao>: o `className` do primitivo pinta o <span> do rotulo (e a
 * cor de inversao), enquanto largura, altura minima e posicao na grade sao
 * responsabilidade do call site. `[&>a]:flex` troca o `inline-flex` do <a> por
 * flex de nivel de bloco, o que faz `w-full` valer; `min-h-[2.75rem]` garante
 * 44px de alvo de toque no mobile (o padding do primitivo sozinho da 42px).
 */
const cta =
  "bg-carvao [&>a]:flex [&>a]:min-h-[2.75rem] [&>a]:w-full sm:[&>a]:w-auto";
const ctaLabel = "w-full justify-center sm:w-auto sm:justify-start";

/**
 * Enfase dentro da prosa: peso + sublinhado fino de 1px em creme a 45%. Sobre
 * carvao a unica cor disponivel para enfase seria o dourado, que e exclusivo do
 * CTA do <About> — entao a enfase aqui e desenhada, nao colorida.
 *
 * Os dois blocos de prosa do site nao compartilham a string: o About sublinha
 * com `underline-offset-4` e o hero com `underline-offset-[6px]`, cada um o
 * valor que ja estava no seu arquivo antes desta wave. Extrair para const aqui
 * nao mudou pixel nenhum — so tirou a mesma classe de dentro de quatro <span>
 * do JSX, onde ela vinha sendo copiada a mao a cada trecho novo.
 */
const enfase =
  "font-medium underline decoration-cream/45 decoration-[1px] underline-offset-[6px]";

export function Hero({ lang, d }: { lang: Lang; d: Dict["hero"] }) {
  return (
    // `100svh` e nao `100vh`: no iOS a barra de endereco entra e sai da conta do
    // `vh` e o bloco inteiro pula durante o primeiro scroll. `svh` mede a
    // viewport pequena e fica parado.
    //
    // O bloco carvao chapado E o fundo: nao ha mais glow radial, grade com mask
    // nem os dois orbes de canto. Sete camadas viraram uma cor.
    <section className="block-carvao relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-[var(--gutter)] pb-[var(--block)] pt-[clamp(2rem,4vw,4rem)]">
      <div className="mx-auto grid w-full max-w-[96rem] items-center gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)] lg:gap-x-12">
        {/* COLUNA ESQUERDA — sempre alinhada a esquerda, nunca centralizada.
            `min-w-0` nao e decoracao: item de grade nasce com `min-width: auto`,
            ou seja, nunca encolhe abaixo do proprio conteudo minimo. Enquanto o
            <code> do terminal era `white-space: pre` ele media 573px e, SEM
            esta classe, esticava a coluna inteira para 573px em 390px de tela —
            e como o `html` tem `overflow-x: clip`, o navegador nao mostrava
            barra: so diminuia o zoom da pagina e o hero saia pequeno, sem
            sintoma obvio. O comando passou a quebrar linha (ver TerminalLine),
            entao o caso agudo morreu; `min-w-0` fica como rede para o proximo
            filho de conteudo minimo largo que entrar nesta coluna. */}
        <div className="min-w-0 max-w-[54ch]">
          {/* Selo de capa: os mesmos fatos da antiga linha de status, sem
              pilula, sem borda e sem o ponto verde pulsando. Nenhum ponto pulsa
              em lugar nenhum do site depois desta wave. */}
          <Meta items={d.selo} className="text-cream-600" />

          {/* LCP. Fica FORA do <Reveal> de proposito: framer-motion serializa
              `opacity: 0` no HTML do servidor, e esconder o maior elemento de
              texto da pagina ate a hidratacao adiaria o LCP sem nenhum ganho
              visual. O nome esta la no primeiro paint, com a display em
              preload; o resto da coluna e que entra.
              As duas linhas sao <span class="block"> — quebra decidida, nunca
              herdada do wrap, e por isso `nome` e uma tupla de dois no
              dicionario, nao uma frase que o navegador quebra onde couber. Em
              390px `d1` trava em 56px e "LEONARDO" ocupa ~278px dos 350px
              uteis; a medida vale nos dois idiomas porque nome proprio nao
              traduz — as duas linhas sao literalmente as mesmas strings. */}
          <h1 className="mt-8 font-display text-d1 uppercase text-cream">
            <span className="block">{d.nome[0]}</span>
            <span className="block">{d.nome[1]}</span>
          </h1>

          {/* A UNICA animacao da secao (fade + 10px, 0.45s). Eram oito. */}
          <Reveal>
            {/* O que era titulo em gradiente animado vira subtitulo de capa em
                maquina de escrever, com tracking de 0.32em. */}
            <p className="mt-6 font-mono text-selo uppercase text-cream">
              {d.subtitulo}
            </p>

            <DashedRule className="mt-6 border-cream" />
            <Meta items={d.formacao} className="mt-4 text-cream-600" />

            {/* Sobre carvao a prosa e sempre creme, entao a enfase deixa de ser
                cor e vira traco: sublinhado de 1px com offset de 6px.

                O paragrafo chega como `Trecho[]` (lib/i18n.ts) e nao como uma
                string com HTML dentro, porque a enfase NAO cai na mesma virgula
                nos dois idiomas — "vector search with pgvector" e um sintagma
                so onde o portugues precisa de "busca vetorial com pgvector"
                mais a oracao que a explica. Lista de trechos deixa o React
                montar os <span> e evita `dangerouslySetInnerHTML`.

                A key leva o TEXTO do trecho, e nao so o indice do map: a
                lista e editorial e muda de forma quando alguem reescreve a
                frase — um trecho entra no meio e todos os indices depois dele
                andam um, o que faz o React casar cada <span> com o texto do
                vizinho. Com o texto na key a identidade anda junto com o
                conteudo. (A troca de IDIOMA nao depende disso: idioma e rota,
                entao e navegacao de documento inteiro e nao ha reconciliacao
                de uma lingua para a outra.)
                A pontuacao viaja nos trechos SEM enfase (a virgula, o " e ", o
                ponto final), entao nao existe separador implicito aqui: a
                concatenacao crua da lista ja e o paragrafo. */}
            <p className="mt-8 medida font-sans text-lead text-cream">
              {d.prosa.map((trecho, i) =>
                typeof trecho === "string" ? (
                  <Fragment key={`${i}·${trecho}`}>{trecho}</Fragment>
                ) : (
                  <span key={`${i}·${trecho.em}`} className={enfase}>
                    {trecho.em}
                  </span>
                ),
              )}
            </p>

            <TerminalLine lang={lang} d={d.terminal} className="mt-8" />

            {/* CTAs. No mobile os retangulos encostam: `gap-px` sobre um fundo
                `bg-cream/30` do container preenche a fresta entre as bordas
                cremes de dois botoes vizinhos, entao a costura le como UM filete
                continuo em vez de duas linhas com carvao no meio — truque de
                prancha. Vira fila com folga a partir de `sm`.

                As setas (↓ ↗) viajam DENTRO do rotulo, no dicionario: elas sao
                vocabulario de CTA do site (ver components/ui/Botao.tsx), nao
                icone — e em ingles o rotulo inteiro muda ("Resume ↓"), entao
                separar glifa de texto so criaria um segundo lugar para as duas
                linguas discordarem. */}
            <div className="mt-8 grid grid-cols-2 gap-px bg-cream/30 sm:flex sm:flex-wrap sm:gap-3 sm:bg-transparent">
              <div className={clsx(cta, "col-span-2")}>
                <Botao
                  href="#projects"
                  variant="solid"
                  className={clsx(ctaLabel, "text-carvao")}
                >
                  {d.cta.projetos}
                </Botao>
              </div>
              <div className={cta}>
                <Botao
                  href="https://github.com/souzxxx"
                  external
                  className={clsx(ctaLabel, "hover:text-carvao")}
                >
                  {d.cta.github}
                </Botao>
              </div>
              <div className={cta}>
                <Botao
                  href="https://www.linkedin.com/in/leonardo-souzx"
                  external
                  className={clsx(ctaLabel, "hover:text-carvao")}
                >
                  {d.cta.linkedin}
                </Botao>
              </div>
              <div className={cta}>
                <Botao
                  href="mailto:leonardosouzasilva9@gmail.com"
                  className={clsx(ctaLabel, "hover:text-carvao")}
                >
                  {d.cta.email}
                </Botao>
              </div>
              {/* O PDF e o DO IDIOMA (CV_PDF[lang]): "/leonardo-souza-cv.pdf"
                  em pt, "/leonardo-souza-cv-en.pdf" em en. Os dois arquivos sao
                  obrigatorios no prebuild (scripts/check-assets.ts), entao a
                  unica forma deste CTA baixar 404 seria alguem escrever o
                  caminho a mao aqui em vez de ler a tabela. */}
              <div className={cta}>
                <Botao
                  href={CV_PDF[lang]}
                  download
                  className={clsx(ctaLabel, "hover:text-carvao")}
                >
                  {d.cta.curriculo}
                </Botao>
              </div>
            </div>

            {/* Os NUMEROS nao tem idioma e continuam vindo medidos de
                lib/projects.ts; so os rotulos sao bilingues. A assinatura do
                StatsCounter ja recebia `label` por prop, entao ele nao precisou
                aprender nada sobre idioma. */}
            <div className="mt-10 grid grid-cols-2 border-t border-dashed border-cream/35 sm:grid-cols-4">
              {/* 49.071 linhas em ml-copa/data/raw/results.csv — arredondado, sem "+" */}
              <StatsCounter
                value={stats.matchesProcessed}
                label={d.stats.partidas}
                suffix="k"
              />
              <StatsCounter value={stats.testFiles} label={d.stats.testes} />
              <StatsCounter
                value={stats.domainModules}
                label={d.stats.modulos}
              />
              <StatsCounter
                value={stats.distributedServices}
                label={d.stats.servicos}
              />
            </div>

            {/* O INDICADOR "ROLE" SAIU. MEDIDO em 1440x900: ele terminava em
                y = 1229 numa viewport de 900 — uma affordance de rolagem que so
                aparece DEPOIS de rolar e contraditoria por construcao, e ainda
                custava 70px de altura ao bloco, empurrando os numeros para
                ainda mais longe da dobra. Ancorar em `absolute bottom` nao
                resolve: o hero mede ~1150px, entao o rodape do bloco tambem
                esta abaixo da primeira tela. A referencia desta identidade nao
                tem indicador de rolagem nenhum — o corte do bloco carvao na borda
                inferior ja e o convite. */}
          </Reveal>
        </div>

        {/* COLUNA DIREITA — `aspect-square` reserva a altura ANTES de qualquer
            mount, entao o canvas nasce sem CLS. Abaixo de 1024px o componente
            devolve null e o bloco carvao fica sozinho: isso e o DESENHO do mobile,
            nao o desktop encolhido. */}
        <div
          aria-hidden
          className="pointer-events-none relative hidden aspect-square w-full lg:block"
        >
          <EngravedObject />
        </div>
      </div>
    </section>
  );
}
