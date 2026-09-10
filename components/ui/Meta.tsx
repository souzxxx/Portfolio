import clsx from "clsx";

/**
 * Meta — o sistema de rotulos de metadado do site.
 *
 * API (contrato, nao mude):
 *   <Meta items={(string | false | null | undefined)[]} className?={string} />
 *
 * Rende uma unica linha mono em caixa alta com os itens unidos por " · ".
 * Valores falsy sao filtrados, entao o call site pode escrever condicional
 * inline sem ternario: `items={["ANO 2026", isPrivate && "REPO: PRIVADO"]}`.
 *
 * Sem caixa, sem borda, sem bolinha: herda `currentColor` e por isso funciona
 * identico nos dois fundos (carvao e papel). Para baixar o tom, passe a cor
 * pelo `className` respeitando a matriz de contraste — `text-ink-700` no
 * papel, `text-cream-700`/`text-cream-600` no carvao.
 *
 * Vocabulario do site (mantenha o dialeto): `BUILD nnn`, `STATUS: NO AR |
 * ENTREGUE | EM CURSO`, `STACK: …`, `ANO 2026`, `REPO: PRIVADO`, `DESDE 2026`.
 */
export function Meta({
  items,
  className,
}: {
  items: (string | false | null | undefined)[];
  className?: string;
}) {
  return (
    <p className={clsx("font-mono text-tag uppercase", className)}>
      {items.filter(Boolean).join(" · ")}
    </p>
  );
}
