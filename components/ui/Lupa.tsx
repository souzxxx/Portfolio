"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Meta } from "./Meta";
import { DashedRule } from "./DashedRule";
import type { Dict } from "@/lib/dict";

/**
 * Lupa — a chapa de um projeto ampliada em tela cheia.
 *
 * API (contrato, nao mude):
 *   <Lupa itens={{src,label}[]} indice={number} aberta={boolean}
 *         onFechar={() => void} onIndice={(i:number) => void}
 *         titulo={string} d={Dict["lupa"]} />
 *
 * ── POR QUE <dialog> NATIVO E NAO UM DIV COM position: fixed ───────────────
 * `showModal()` entrega de graca as quatro coisas que uma lightbox feita a mao
 * quase sempre erra: (1) o resto da pagina fica INERTE, entao o leitor de tela
 * nao vaza para o conteudo atras; (2) o foco fica preso dentro do dialogo sem
 * um unico event listener de Tab; (3) Esc fecha, no comportamento que o sistema
 * operacional ja ensinou ao visitante; (4) ao fechar, o foco VOLTA sozinho para
 * o botao que abriu — que e exatamente a chapa que a pessoa estava olhando, e
 * nao o topo da pagina. Reimplementar isso em React daria mais codigo, mais
 * bugs e nenhuma vantagem.
 *
 * O travamento do scroll de tras NAO mora aqui: e uma regra de CSS em
 * globals.css (`html:has(dialog[open])`), porque e comportamento de documento,
 * nao de componente — e assim nao ha efeito colateral a desfazer se este
 * componente desmontar com o dialogo aberto.
 *
 * ── ZERO ANIMACAO, DE PROPOSITO ───────────────────────────────────────────
 * O unico crossfade do site e a troca de chapa dentro do <FeaturedCard>, e ele
 * existe porque a LEGENDA muda junto — o movimento e o aviso de que o texto
 * mudou. Aqui nada disso acontece: o dialogo abre cheio, no lugar. Fade de
 * entrada em lightbox e o gesto que faz uma pagina editorial parecer uma
 * galeria de tema de WordPress, e esta identidade e "estatica e confiante".
 *
 * ── CONTRASTE ──────────────────────────────────────────────────────────────
 * O campo e carvao CHAPADO. Ele comecou em `bg-carvao/95` — 5% de transparencia
 * para o visitante perceber que a pagina continua atras — e isso foi REPROVADO
 * na captura, por dois motivos que so aparecem sobre um bloco de PAPEL:
 *
 * 1. O fantasma e legivel. Cream #F5F3EE sob 95% de carvao compoe #272523,
 *    enquanto o texto carvao da secao compoe #1C1A17 — os dois quase iguais no
 *    numero, mas a diferenca cai toda em borda de glifo, que e exatamente o
 *    sinal que o olho melhor detecta. Em 390px a captura mostrava o titulo da
 *    secao e o paragrafo inteiro atras da imagem, competindo com ela.
 * 2. A legenda saia DUPLICADA. A legenda da chapa vive logo abaixo da imagem na
 *    pagina, e cai quase na mesma altura da legenda do dialogo: duas linhas com
 *    o mesmo texto a ~20px uma da outra lem como defeito de render, nao como
 *    profundidade.
 *
 * E o campo chapado tambem e o que o resto do sistema ja faz: fora de bordas,
 * esta era a UNICA superficie com alfa no site inteiro. Nada de blur em momento
 * nenhum — `backdrop-filter` e a causa medida do jank de scroll no iOS que a
 * auditoria ja reportou na NavBar.
 *
 * Sobre o carvao valem os tres tons medidos contra #1C1A17: `cream` 15.66:1 no
 * rotulo dos botoes, `cream-600` 11.72:1 na legenda, `cream-700` 6.99:1 no
 * contador.
 *
 * A imagem entra em `object-contain`, nunca `cover`: aqui o ponto e VER a
 * captura inteira — recortar a prova no exato momento em que o visitante pediu
 * para amplia-la seria o oposto do que o clique dele pediu.
 */

export type ItemAmpliavel = { src: string; label: string };

export function Lupa({
  itens,
  indice,
  aberta,
  onFechar,
  onIndice,
  titulo,
  d,
}: {
  itens: ItemAmpliavel[];
  indice: number;
  aberta: boolean;
  onFechar: () => void;
  onIndice: (i: number) => void;
  titulo: string;
  d: Dict["lupa"];
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const total = itens.length;
  const atual = itens[indice];
  const temNavegacao = total > 1;

  /**
   * AS DIMENSOES REAIS DA CAPTURA, lidas do proprio <img> depois que ele
   * carrega (`naturalWidth`/`naturalHeight`).
   *
   * Elas existem por causa de um defeito de geometria que `object-contain`
   * sozinho NAO resolve: com `<Image fill>`, a CAIXA do <img> ocupa o container
   * inteiro mesmo quando a TINTA ocupa so uma faixa no meio dele. A area vazia
   * ao redor continua sendo o proprio <img> para efeito de clique — e "clicar
   * no vazio para fechar", que e o gesto que toda lightbox ensinou, nunca
   * dispararia. O bug seria invisivel no olho e so apareceria no dedo.
   *
   * Sabendo as dimensoes, o <img> deixa de ser `fill` e passa a ser um elemento
   * substituido normal com `max-width`/`max-height` de 100% e `width`/`height`
   * em auto — que e a MESMA conta que o `contain` faria, so que executada pelo
   * elemento em vez de por dentro dele. A partir dai a caixa e a tinta
   * coincidem, e o vazio ao redor volta a pertencer ao container, que e quem
   * fecha. O resultado visual e identico nos dois caminhos, entao a troca nao
   * pisca.
   *
   * Volta a `null` a cada troca de chapa: medida de uma imagem aplicada a
   * outra deformaria a seguinte por um quadro.
   */
  const [medida, setMedida] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    setMedida(null);
  }, [atual?.src]);

  // `showModal()` em dialogo ja aberto lanca InvalidStateError, e `close()` em
  // dialogo ja fechado dispara um evento `close` extra — as duas guardas abaixo
  // sao o que mantem o estado do React e o estado do DOM em acordo.
  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberta && !dialogo.open) dialogo.showModal();
    if (!aberta && dialogo.open) dialogo.close();
  }, [aberta]);

  const anterior = useCallback(() => {
    if (total > 0) onIndice((indice - 1 + total) % total);
  }, [indice, total, onIndice]);

  const proxima = useCallback(() => {
    if (total > 0) onIndice((indice + 1) % total);
  }, [indice, total, onIndice]);

  // Setas do teclado. Esc nao esta aqui: e nativo do <dialog> e chega pelo
  // evento `close`, entao duplicar o tratamento so criaria dois caminhos para
  // o mesmo fechamento.
  useEffect(() => {
    if (!aberta || !temNavegacao) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        anterior();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        proxima();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aberta, temNavegacao, anterior, proxima]);

  if (!atual) return null;

  const contador = `${String(indice + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  const contadorAria = `${indice + 1} ${d.de} ${total}`;

  // O dialeto de botao desta superficie: rotulo mono em caixa alta que INVERTE
  // creme<->carvao, o mesmo feedback das linhas de contato do <About> e dos
  // links do rodape. `min-h-[2.75rem]` garante os 44px de ALTURA de toque.
  //
  // `focus-visible:outline-cream` nao e enfeite e nao pode sair: o anel global
  // (globals.css) e `2px solid currentColor`, e no foco este botao ja inverteu
  // para `text-carvao` — o anel sairia carvao desenhado 2px FORA da caixa, ou
  // seja, sobre o campo carvao do dialogo, a 1:1. Em creme sao 15.66:1.
  const botao =
    "inline-flex min-h-[2.75rem] items-center px-3 font-mono text-tag uppercase text-cream " +
    "motion-safe:transition-colors motion-safe:duration-150 " +
    "hover:bg-cream hover:text-carvao " +
    "focus-visible:bg-cream focus-visible:text-carvao focus-visible:outline-cream";

  /**
   * A LARGURA das setas, que o `botao` sozinho NAO resolve.
   *
   * "FECHAR ✕" tem rotulo por extenso e mede 92.7px em 390 — folgado. As setas
   * nao: `←` em Courier Prime a 11px da ~17px de glifo, e com os 24px do `px-3`
   * a caixa fechava em 40.8 x 44 (medido em 390 e em 1440). Faltavam 3.2px de
   * largura para o quadrado de 44px que esta identidade exige no celular, e
   * numa lightbox esse e o alvo mais caro de errar: ele fica no rodape, e o
   * dedo que passa dele encosta no campo vazio — que FECHA o dialogo. Ou seja,
   * o erro de 3px nao custava um toque perdido, custava a imagem que a pessoa
   * tinha acabado de abrir.
   *
   * `min-w` em vez de `px-4`: o padding maior tambem serviria (40.8 + 8 =
   * 48.8), mas ele mora no `botao`, que e compartilhado com o FECHAR — e ali o
   * `-mr-3` que alinha o rotulo na goteira passaria a estar 4px errado. Com
   * `min-w-[2.75rem]` + `justify-center` a caixa vai a exatamente 44 e o glifo
   * fica no meio dela, sem tocar no outro botao.
   */
  const seta = "min-w-[2.75rem] justify-center bg-carvao";

  return (
    <dialog
      ref={ref}
      aria-label={`${d.titulo}: ${titulo}`}
      // `onClose` cobre TODOS os caminhos de fechamento que nao passam pelo
      // nosso botao — Esc, o gesto de voltar do navegador, `dialog.close()`
      // chamado por qualquer outro lugar. Sem ele o React continuaria achando
      // que a lupa esta aberta depois de o visitante apertar Esc.
      onClose={onFechar}
      // Clicar no campo vazio ao redor da imagem fecha. A comparacao e com o
      // proprio <dialog> justamente porque ele e o unico elemento que ocupa a
      // area de fora: clique em qualquer filho tem esse filho como `target`.
      onClick={(e) => {
        if (e.target === ref.current) onFechar();
      }}
      className={clsx(
        // Os `max-*` e a borda existem para APAGAR o estilo de agente de
        // usuario do <dialog>, que nasce com borda solida, padding de 1em,
        // largura de conteudo e margem automatica.
        "fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 p-0",
        "bg-carvao text-cream backdrop:bg-transparent",
      )}
    >
      <div className="flex h-full w-full flex-col px-[var(--gutter)] py-4">
        {/* ── topo: contador a esquerda, fechar a direita ─────────────── */}
        <div className="flex items-center justify-between gap-4">
          {/* O contador NAO passa pelo <Meta> — e a unica exceção do site, e
              tem motivo: "02 / 04" lido em voz alta vira "zero dois barra zero
              quatro". A barra e sinal grafico, entao a versao vista e
              `aria-hidden` e a falada e uma frase ("2 de 4"), o que <Meta>, que
              so aceita `items` e `className`, nao permite expressar. A
              tipografia e a MESMA do <Meta>, copiada de proposito: mono, caixa
              alta, text-tag. */}
          {temNavegacao ? (
            <p className="font-mono text-tag uppercase tabular-nums text-cream-700">
              <span aria-hidden>{contador}</span>
              <span className="sr-only">{contadorAria}</span>
            </p>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onFechar}
            className={clsx(botao, "-mr-3")}
          >
            {d.fechar} ✕
          </button>
        </div>

        {/* ── O GRUPO: filete, chapa, filete, legenda ──────────────────
            Ele OCUPA a altura que sobra (`flex-1`) mas nao a PREENCHE: o que
            estica e o espaco vazio de cima e de baixo, via `justify-center`.

            A diferenca aparece no celular e foi o que a captura em 390px
            reprovou. Uma captura de desktop (1920x1200) contida numa viewport
            retrato vira uma faixa de ~244px de altura; com a chapa esticando,
            a legenda e as setas iam parar coladas na borda inferior, a 600px da
            imagem que descrevem — a pessoa lia a legenda de uma foto que estava
            do outro lado da tela. Com o grupo centrado, legenda e navegacao
            ficam logo abaixo da chapa em qualquer proporcao de imagem, e o
            vazio se reparte igual em cima e embaixo.

            No desktop nada muda de lugar: la a chapa cresce ate o teto e o
            vazio some sozinho. */}
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <DashedRule className="mt-3 border-cream" />

          {/* O clique aqui so fecha quando cai no PROPRIO container — ou seja,
              no vazio ao redor da moldura. Clicar na captura nao fecha: a
              pessoa abriu a lupa justamente para olhar a imagem, e fechar no
              toque dela e o jeito mais rapido de tirar da tela o que ela pediu
              para ver.

              `min-h-0` e o que permite o item flex encolher abaixo do proprio
              conteudo — sem ele o <Image fill> do primeiro quadro esticaria a
              celula e empurraria a legenda para fora da viewport. */}
          {/* SEM `flex-1` AQUI. Esta foi a correcao que fez o `justify-center`
              do grupo valer: enquanto a celula da chapa esticava, ela sozinha
              consumia toda a folga e nao sobrava nada para centralizar — a
              legenda continuava colada na borda de baixo, exatamente como
              antes. O teto de altura vem de `svh` (viewport pequena do iOS,
              que nao pula quando a barra de endereco entra), descontando a
              altura do cromo: ~15rem no celular, onde a legenda ocupa duas
              linhas e as setas caem abaixo dela, e ~12rem a partir de `sm`,
              onde legenda e setas dividem a mesma linha. */}
          <div
            className="flex min-h-0 items-center justify-center py-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) onFechar();
            }}
          >
            {medida ? (
              // Com as dimensoes reais em maos, a caixa do <img> passa a ser
              // EXATAMENTE a area pintada: `max-*` de 100% nos dois eixos com
              // `width/height: auto` e a propria conta que o `contain` faria, so
              // que feita pelo elemento substituido em vez de por dentro dele.
              // E por isso que o vazio ao redor volta a ser o container.
              <Image
                src={atual.src}
                alt={`${titulo} — ${atual.label}`}
                width={medida.w}
                height={medida.h}
                sizes="100vw"
                className="max-h-[calc(100svh-15rem)] max-w-full object-contain sm:max-h-[calc(100svh-12rem)]"
                style={{ width: "auto", height: "auto" }}
              />
            ) : (
              // Primeiro quadro, antes de `naturalWidth` existir: a caixa precisa
              // de altura DEFINIDA para o `fill` ter contra o que se medir — sem
              // `flex-1`, um `h-full` aqui resolveria em zero.
              <div className="relative h-[calc(100svh-15rem)] w-full sm:h-[calc(100svh-12rem)]">
                <Image
                  src={atual.src}
                  alt={`${titulo} — ${atual.label}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth && img.naturalHeight) {
                      setMedida({ w: img.naturalWidth, h: img.naturalHeight });
                    }
                  }}
                />
              </div>
            )}
          </div>

          <DashedRule className="border-cream" />

          {/* ── rodape: legenda e, quando ha mais de uma chapa, a navegacao ──
            Empilha no celular: a legenda e uma frase inteira e, lado a lado
            com dois botoes em 390px, ela ficaria com duas palavras por linha. */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <Meta items={[atual.label]} className="text-cream-600" />

            {temNavegacao && (
              // `gap-px` sobre um fundo creme a 30% preenche a fresta entre os
              // dois retangulos: a costura le como UM filete, o mesmo truque dos
              // CTAs do hero no mobile.
              <div className="flex shrink-0 gap-px self-start bg-cream/30 sm:self-auto">
                <button
                  type="button"
                  onClick={anterior}
                  aria-label={d.anterior}
                  className={clsx(botao, seta)}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={proxima}
                  aria-label={d.proxima}
                  className={clsx(botao, seta)}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
