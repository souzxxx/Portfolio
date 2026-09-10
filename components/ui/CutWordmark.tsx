/**
 * CutWordmark — a peca tipografica gigante cortada nas DUAS bordas da
 * viewport. Elemento grafico, nao conteudo: e a virada do campo azul do hero
 * para o papel das secoes editoriais.
 *
 * API (contrato, nao mude):
 *   <CutWordmark text?={string} />   // default: "SOUZXX"
 *
 * Server component: sem estado, sem motion, sem JS. Ele nao pisca, nao entra
 * com fade e nao reage ao scroll — a referencia e "estatica e confiante".
 *
 * GEOMETRIA: o <span> tem 118% da largura do container e e deslocado -9%, o
 * que abre 10.6% de sangria a esquerda e 7.4% a direita, em qualquer viewport
 * de 320 a 1920.
 *
 * MEDIDO (Instrument Serif 400, caixa alta, playwright): a mancha de tinta de
 * "SOUZXX" (6 caracteres) da 2.67x o font-size — ou seja ~71vw enquanto o
 * clamp do token `wm` esta na faixa dos 27vw, e ~65vw a partir de 1300px,
 * quando o clamp trava em 22rem. Com 6 caracteres, portanto, a palavra SANGRA
 * A ESQUERDA e sobra papel a direita; ela so encosta nas duas bordas com uma
 * string mais longa (a partir de ~10 caracteres) ou com um `wm` maior — para
 * cortar os dois lados com 6 caracteres o token precisaria ir a
 * clamp(6.5rem, 45vw, 54rem), o que tambem triplicaria a altura da faixa.
 * O token e fixado pela direcao de arte e consumido tambem pelo rodape, entao
 * fica como esta; a decisao de subir `wm` (ou de alongar o texto padrao) e de
 * la, nao daqui.
 *
 * ALTURA: determinada pelo line-height 0.74 que ja vem embutido no token
 * `text-wm`, mais os paddings em clamp — nada de altura calculada em JS,
 * entao zero CLS. NAO acrescente `leading-none` aqui: 1.0 e mais frouxo que
 * 0.74 e sobrescreveria o token, engordando o bloco e afrouxando o corte.
 *
 * ACESSIBILIDADE: a palavra visivel e `aria-hidden` porque esta cortada e em
 * caixa alta forcada; o nome legivel vai num `.sr-only` ao lado, em caixa
 * baixa, para que o leitor de tela leia "souzxx" e nao soletre.
 */
export function CutWordmark({ text = "SOUZXX" }: { text?: string }) {
  return (
    <div className="block-paper relative w-full select-none overflow-hidden pt-[clamp(2rem,5vw,4rem)] pb-[clamp(1rem,3vw,2.5rem)]">
      <span
        aria-hidden
        className="block w-[118%] -translate-x-[9%] whitespace-nowrap font-display text-wm uppercase text-blue"
      >
        {text}
      </span>
      <span className="sr-only">{text.toLowerCase()}</span>
    </div>
  );
}
