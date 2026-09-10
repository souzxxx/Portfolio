import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Bloco — a unidade de composicao do site: uma <section> que pinta um dos DOIS
 * campos de cor chapada e carrega o ritmo vertical/lateral padrao.
 *
 * API:
 *   <Bloco ground="carvao" | "paper" id?={string} className?={string}>
 *
 * ERAM TRES GROUNDS: o acento saturado de assinatura e o "breu" #141414
 * viraram um so, o carvao. O acento saiu da identidade; o breu saiu por medida
 * — 1.06:1 contra o carvao, ou seja, uma secao "breu" ao lado de uma "carvao"
 * nao le como troca de campo, le como emenda mal resolvida. Com dois grounds a
 * partitura fica legivel na primeira leitura de app/page.tsx: nenhum par de
 * escuros pode encostar, porque so existe um escuro.
 *
 * O fundo fica SEMPRE na <section> e NUNCA num wrapper interno. Dois blocos
 * vizinhos que pintam o proprio fundo encostam sem costura; um fundo pintado
 * num <div> filho deixa uma linha de 1px do fundo do pai aparecendo em DPR
 * fracionario (1.25x, 1.5x), porque as bordas dos dois retangulos nao caem no
 * mesmo pixel fisico.
 *
 * `className` serve para ajuste de layout do call site (ex.: "pt-0" quando o
 * bloco encosta na NavBar que ja pinta o mesmo carvao) — nunca para trocar o
 * fundo, que e responsabilidade exclusiva de `ground`.
 */
export function Bloco({
  ground,
  id,
  className,
  children,
}: {
  ground: "carvao" | "paper";
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={clsx(
        ground === "carvao" && "block-carvao",
        ground === "paper" && "block-paper",
        "bloco",
        className,
      )}
    >
      {children}
    </section>
  );
}
