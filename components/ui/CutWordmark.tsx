import clsx from "clsx";

/**
 * CutWordmark — a peca tipografica gigante que faz a virada do campo carvao
 * do hero para o papel das secoes editoriais.
 *
 * API (contrato, nao mude):
 *   <CutWordmark text?={string} />   // default: "SOUZXXX"
 *   <WordmarkRow text?={string} className?={string} />  // usado tambem no rodape
 *
 * Server component: sem estado, sem motion, sem JS. Ele nao pisca, nao entra
 * com fade e nao reage ao scroll — a referencia e "estatica e confiante".
 *
 * O CORTE VIROU AJUSTE (correcao de bug visual). A versao anterior punha o
 * <span> a 118% da largura e o deslocava -9%, o que jogava a PRIMEIRA LETRA
 * para fora da borda esquerda: em 1440 e em 390 o leitor via "OUZXX" e lia
 * como falha de render, nao como gesto grafico. Agora a palavra e composta
 * para a MEDIDA do site — nenhum glifo cortado, em nenhuma largura.
 *
 * A PALAVRA TEM 7 LETRAS: SOUZXXX, tres X. Nunca dois. O nome se escreve com
 * um X ou com tres, e o site compunha SOUZXX (seis) — errado nas duas
 * leituras. A troca nao e cosmetica: como a palavra e dimensionada pela
 * MEDIDA e nao por um corpo fixo, ganhar uma letra na mesma largura so pode
 * sair da altura de glifo. Isso e aritmetica, nao escolha de escala.
 *
 * MATEMATICA DO AJUSTE (medido no proprio site, Instrument Serif 400, caixa
 * alta, tracking -0.01em, playwright):
 *
 *   ATENCAO AO QUE SE MEDE. A palavra e composta em SETE <span>, um por letra,
 *   porque e o `justify-between` entre eles que faz a linha encostar nas duas
 *   margens. E KERNING NAO ATRAVESSA FRONTEIRA DE ELEMENTO: o navegador so
 *   aplica o par cinetico dentro de um mesmo run de texto. Logo a mancha que
 *   importa aqui NAO e a de "SOUZXXX" escrito de uma vez — e a SOMA das sete
 *   caixas:
 *     texto corrido .... 3.284x o font-size
 *     sete <span> ...... 3.478x o font-size   <- esta e a que renderiza
 *   Os 0.194x de diferenca sao seis pares de kern perdidos, e o caro deles e
 *   XX: sozinho vale -0.080x. Por isso o problema PIOROU ao passar de 6 para 7
 *   letras — a letra que entrou foi justamente um X, que traz mais um par XX.
 *   Medir a palavra em texto corrido da um corpo 5.9% maior do que cabe, e o
 *   sintoma e exato: a ultima letra cruza a margem direita e o
 *   `justify-between` fica sem folga para distribuir, entao os vaos zeram.
 *
 *   Somando o `-ml-[0.04em]`, que devolve 0.04x de largura a linha:
 *     - a caixa util e 1 + 0.04k da medida; a mancha ocupa 3.478k dela;
 *     - com k = 27.6% (divisor 3.623, folga de 4.17% sobre 3.478) sobra 5.24%
 *       da medida para os seis vaos;
 *     - medido: em 1440 o corpo da 371px, os vaos dao 11.4px e a ultima letra
 *       cai EXATAMENTE na margem direita (0px de sobra, 0px de estouro); em
 *       390 o corpo da 97px e os vaos dao 3.0px. Sem media query, de 320 a
 *       1920.
 *
 * O QUE ISSO CUSTA, em pixel: na medida de 1344px (viewport 1440 menos as
 * duas goteiras de 48px), o corpo cai de ~455px para ~371px. A peca perde 85px
 * de altura de glifo e ganha uma letra. Nao ha como ter os dois: a largura e
 * fixa pela medida do site, e 7 glifos dentro dela sao necessariamente menores
 * que 6.
 *
 * E A VERSAO DE 6 LETRAS VIVIA NO FIO. Pela mesma conta, "SOUZXX" composto
 * dava 2.942x contra o divisor de 2.95 — 0.27% de folga, nao os 4.31% que
 * este comentario anunciava, porque o 4.31% era calculado contra a mancha de
 * texto corrido (2.828x) que a peca nunca chegou a renderizar. Na tela os
 * vaos saiam a 4.3px em 1440 e 1.1px em 390, nao aos ~11px/~3px prometidos.
 * O numero acima e o primeiro que torna a promessa verdadeira.
 *
 * POR QUE `cqw` E NAO `vw`: `100vw` inclui a barra de rolagem e ignora o
 * `max-w-[96rem]` do site — os dois erros empurrariam a ultima letra para
 * fora justamente nas larguras grandes. `cqw` mede o container real, entao o
 * ajuste vale tanto dentro da medida de 96rem quanto no mobile. O elemento
 * que declara `container-type` NAO tem padding proprio de proposito: assim a
 * caixa consultada e exatamente a mesma que a linha de letras ocupa.
 *
 * O `-ml-[0.04em]` e correcao OPTICA, nao layout, e CONTINUA valendo: a
 * primeira letra nao mudou, e o "S" tem 0.041em de sidebearing esquerdo — que
 * ao corpo novo de 371px vira 15px de recuo visivel contra os titulos
 * alinhados na goteira. O negativo devolve a tinta a linha da grade; a
 * direita ja cai naturalmente a ~4px, pelo tracking negativo da ultima letra.
 *
 * ALTURA: line-height 0.74 (a mesma proporcao do token `wm`) mais os paddings
 * em clamp — nada de altura calculada em JS, entao zero CLS.
 *
 * ACESSIBILIDADE: a linha de letras e `aria-hidden` (esta quebrada em 7
 * <span> e em caixa alta forcada, o que faz leitor de tela soletrar); o nome
 * legivel vai num `.sr-only` ao lado, em caixa baixa.
 */

const WORDMARK = "SOUZXXX";

/**
 * A linha de letras, sem fundo e sem padding: quem chama e que escolhe o
 * campo de cor, a goteira e a medida. Cor tambem vem de fora (`text-carvao`
 * no papel, `text-cream` no carvao) — o componente nunca decide contraste.
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
      <div className="-ml-[0.04em] flex justify-between whitespace-nowrap font-display text-[27.6cqw] uppercase leading-[0.74] tracking-[-0.01em]">
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
        <WordmarkRow text={text} className="text-carvao" />
      </div>
      <span className="sr-only">{text.toLowerCase()}</span>
    </div>
  );
}
