import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Label — um rotulo mono em caixa alta, inline.
 *
 * API (contrato, nao mude):
 *   <Label className?={string}>{children}</Label>
 *
 * E o irmao inline do <Meta>: mesma tipografia (font-mono + text-tag +
 * uppercase), mas um <span> unico, para quando o rotulo entra dentro de uma
 * linha de tabela, de um cabecalho de coluna ou ao lado de um valor — e nao
 * como paragrafo de metadado. Herda `currentColor`, funciona nos tres fundos.
 */
export function Label({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={clsx("font-mono text-tag uppercase", className)}>
      {children}
    </span>
  );
}
