import clsx from "clsx";

/**
 * DashedRule — o divisor UNICO do site.
 *
 * API (contrato, nao mude):
 *   <DashedRule className?={string} />
 *
 * Filete tracejado de 1px em `currentColor` a 35% de opacidade (classe `.rule`
 * em globals.css). Como usa currentColor, a mesma classe resolve os dois
 * fundos: creme sobre carvao, carvao sobre papel — nao existe variante por
 * secao, nem borda solida, nem sombra, em lugar nenhum do site.
 *
 * `aria-hidden` porque e ornamento: a separacao semantica ja vem da estrutura
 * de <section>/<h2>, e um <hr> anunciado a cada linha de tabela seria ruido
 * para leitor de tela.
 */
export function DashedRule({ className }: { className?: string }) {
  return <hr aria-hidden className={clsx("rule", className)} />;
}
