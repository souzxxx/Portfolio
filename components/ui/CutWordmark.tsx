import clsx from "clsx";

/**
 * CutWordmark — a peca tipografica gigante que faz a virada do campo azul do
 * hero para o papel das secoes editoriais.
 *
 * API (contrato, nao mude):
 *   <CutWordmark text?={string} />   // default: "SOUZXX"
 *   <WordmarkRow text?={string} className?={string} />  // usado tambem no rodape
 *
 * Server component: sem estado, sem motion, sem JS. Ele nao pisca, nao entra
 * com fade e nao reage ao scroll — a referencia e "estatica e confiante".
 *
 * O CORTE VIROU AJUSTE (correcao de bug visual). A versao anterior punha o
 * <span> a 118% da largura e o deslocava -9%, o que jogava a PRIMEIRA LETRA
 * para fora da borda esquerda: em 1440 e em 390 o leitor via "OUZXX" e lia
 * como falha de render, nao como gesto grafico. Agora a palavra e composta
 * para a MEDIDA do site — nenhum glifo cortado, e a escala fica MAIOR do que
 * era (455px em 1440 contra os 352px do teto antigo de `text-wm`), entao a
 * peca ganha presenca em vez de perder.
 *
 * MATEMATICA DO AJUSTE (medido no proprio site, Instrument Serif 400, caixa
 * alta, tracking -0.01em, playwright):
 *   - a mancha de "SOUZXX" (6 caracteres) da 2.828x o font-size;
 *   - logo o font-size que preenche a medida e larguraDaMedida / 2.828, ou
 *     seja 35.4% dela. Usamos 33.9% (divisor 2.95), que deixa ~4% de folga;
 *   - essa folga vai para os vaos entre as letras via `justify-between`
 *     (~11px por vao em 1440, ~3px em 390): a palavra encosta nas duas
 *     margens da medida sem nunca estourar, em qualquer largura de 320 a
 *     1920, sem media query.
 *
 * POR QUE `cqw` E NAO `vw`: `100vw` inclui a barra de rolagem e ignora o
 * `max-w-[96rem]` do site — os dois erros empurrariam a ultima letra para
 * fora justamente nas larguras grandes. `cqw` mede o container real, entao o
 * ajuste vale tanto dentro da medida de 96rem quanto no mobile. O elemento
 * que declara `container-type` NAO tem padding proprio de proposito: assim a
 * caixa consultada e exatamente a mesma que a linha de letras ocupa.
 *
 * O `-ml-[0.04em]` e correcao OPTICA, nao layout: o "S" tem 0.041em de
 * sidebearing esquerdo, que a 455px vira 19px de recuo visivel contra os
 * titulos alinhados na goteira. O negativo devolve a tinta a linha da grade;
 * a direita ja cai naturalmente a ~4px, pelo tracking negativo da ultima
 * letra.
 *
 * ALTURA: line-height 0.74 (a mesma proporcao do token `wm`) mais os paddings
 * em clamp — nada de altura calculada em JS, entao zero CLS.
 *
 * ACESSIBILIDADE: a linha de letras e `aria-hidden` (esta quebrada em 6
 * <span> e em caixa alta forcada, o que faz leitor de tela soletrar); o nome
 * legivel vai num `.sr-only` ao lado, em caixa baixa.
 */

const WORDMARK = "SOUZXX";

/**
 * A linha de letras, sem fundo e sem padding: quem chama e que escolhe o
 * campo de cor, a goteira e a medida. Cor tambem vem de fora (`text-blue` no
 * papel, `text-cream` no breu) — o componente nunca decide contraste.
 */
export function WordmarkRow({
  text = WORDMARK,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={clsx("select-none [container-type:inline-size]", className)}
    >
      <div className="-ml-[0.04em] flex justify-between whitespace-nowrap font-display text-[33.9cqw] uppercase leading-[0.74] tracking-[-0.01em]">
        {text.split("").map((letra, i) => (
          <span key={`${letra}-${i}`}>{letra}</span>
        ))}
      </div>
    </div>
  );
}

export function CutWordmark({ text = WORDMARK }: { text?: string }) {
  return (
    <div className="block-paper relative w-full overflow-hidden pb-[clamp(1rem,3vw,2.5rem)] pt-[clamp(2rem,5vw,4rem)]">
      <div className="mx-auto max-w-[96rem] px-[var(--gutter)]">
        <WordmarkRow text={text} className="text-blue" />
      </div>
      <span className="sr-only">{text.toLowerCase()}</span>
    </div>
  );
}
