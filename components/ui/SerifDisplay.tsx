import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * SerifDisplay — a voz de titulo do site. Toma o lugar do antigo primitivo
 * de texto em gradiente animado, apagado nesta wave.
 *
 * API (contrato, nao mude):
 *   <SerifDisplay as?={"span"|"h1"|"h2"|"h3"|"p"|"div"} className?={string}>
 *
 * Aplica so a familia display (Instrument Serif) em caixa alta; o TAMANHO vem
 * do call site pelos tokens da escala — `text-d1` (linha do nome), `text-d2`
 * (titulo de secao), `text-d3` (titulo de item), `text-wm` (wordmark cortado).
 * Separar familia de tamanho e o que permite o mesmo primitivo servir do <h1>
 * ao rotulo de uma linha de tabela.
 *
 * REGRA DE DIACRITICO: `text-d1` tem leading 0.88 e e EXCLUSIVO da linha do
 * nome, que nao tem acento. Titulo que possa carregar C/A/O acentuado
 * (FORMACAO, DECISOES, SAO PAULO) usa `text-d2`/`text-d3`, cujo leading minimo
 * e 0.95 — abaixo disso o til encosta na linha de cima.
 *
 * Sem gradiente, sem clip de texto, sem animacao: a cor e sempre a herdada do
 * bloco (creme sobre azul/breu, breu sobre papel), ou uma da paleta passada
 * explicitamente pelo `className`.
 */
export function SerifDisplay({
  children,
  as: Tag = "span",
  className,
}: {
  children: ReactNode;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
}) {
  return (
    <Tag className={clsx("font-display uppercase", className)}>{children}</Tag>
  );
}
