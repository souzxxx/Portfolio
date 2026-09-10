import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Bloco — a unidade de composicao do site: uma <section> que pinta um dos tres
 * campos de cor chapada e carrega o ritmo vertical/lateral padrao.
 *
 * API (contrato, nao mude):
 *   <Bloco ground="blue" | "paper" | "ink" id?={string} className?={string}>
 *
 * O fundo fica SEMPRE na <section> e NUNCA num wrapper interno. Dois blocos
 * vizinhos que pintam o proprio fundo encostam sem costura; um fundo pintado
 * num <div> filho deixa uma linha de 1px do fundo do pai aparecendo em DPR
 * fracionario (1.25x, 1.5x), porque as bordas dos dois retangulos nao caem no
 * mesmo pixel fisico.
 *
 * `className` serve para ajuste de layout do call site (ex.: "pt-0" quando o
 * bloco encosta na NavBar que ja pinta o mesmo azul) — nunca para trocar o
 * fundo, que e responsabilidade exclusiva de `ground`.
 */
export function Bloco({
  ground,
  id,
  className,
  children,
}: {
  ground: "blue" | "paper" | "ink";
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={clsx(
        ground === "blue" && "block-blue",
        ground === "paper" && "block-paper",
        ground === "ink" && "block-ink",
        "bloco",
        className,
      )}
    >
      {children}
    </section>
  );
}
