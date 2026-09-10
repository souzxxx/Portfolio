/**
 * StatusPill — o estado de um projeto. API INALTERADA nesta wave; so o miolo
 * mudou.
 *
 * API (contrato, nao mude):
 *   <StatusPill status={"deployed" | "shipped" | "wip"} isPrivate?={boolean} />
 *
 * De pilula arredondada com fundo, borda, cor por estado e ponto pulsante para
 * uma linha mono em caixa alta com um quadrado solido de 6px. Sem
 * `animate-pulse`: nenhum ponto pulsa em lugar nenhum do site depois desta
 * wave. Sem cor por estado tambem — verde/ciano/ambar sao tres cores fora da
 * paleta, e o estado ja esta escrito por extenso; o quadrado herda
 * `currentColor` e por isso a mesma marcacao funciona nos tres fundos.
 *
 * O nome do componente continua "Pill" por contrato entre os itens da wave,
 * mesmo o formato tendo deixado de ser pilula (`rounded-full` = 0 na raiz do
 * tailwind.config.ts).
 *
 * Rotulos em portugues, no dialeto de metadado do site: NO AR, ENTREGUE,
 * EM CURSO — e ` · REPO: PRIVADO` no mesmo span quando o codigo e fechado.
 */
const map = {
  deployed: "NO AR",
  shipped: "ENTREGUE",
  wip: "EM CURSO",
} as const;

export function StatusPill({
  status,
  isPrivate,
}: {
  status: keyof typeof map;
  isPrivate?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-tag uppercase">
      <span aria-hidden className="h-1.5 w-1.5 bg-current" />
      {map[status]}
      {isPrivate && " · REPO: PRIVADO"}
    </span>
  );
}
