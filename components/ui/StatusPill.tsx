import type { Dict } from "@/lib/dict";
import type { ProjectStatus } from "@/lib/projects";

/**
 * StatusPill — o estado de um projeto.
 *
 * API (mudou nesta wave — o `lang` e obrigatorio):
 *   <StatusPill status={"deployed" | "shipped" | "wip"} d={Dict["status"]} />
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
 * POR QUE `lang` E NAO O MAPA LOCAL. Os tres rotulos moravam num `const map`
 * aqui dentro, em portugues, e o ProjectGrid mantinha uma SEGUNDA copia deles
 * — dois arquivos com a mesma tabela de tres linhas, que ja nasceram iguais e
 * so podiam divergir. Agora os dois leem `dict[lang].status`, que e a unica
 * tabela: NO AR/ENTREGUE/EM CURSO em pt, LIVE/SHIPPED/IN PROGRESS em en.
 *
 * O `isPrivate?` SAIU da assinatura na integracao. Ele acrescentava
 * ` · REPO: PRIVADO` depois do estado, mas o unico call site do repositorio
 * (FeaturedCard.tsx) ja publica essa mesma string pelo <Meta> que fica na
 * MESMA linha, dois elementos a esquerda deste — passar a prop imprimiria
 * "REPO: PRIVADO" duas vezes lado a lado, e nunca passa-la deixava um ramo
 * que nenhuma rota alcanca. O repositorio fechado e metadado (BUILD/ANO/REPO),
 * nao estado de entrega: ele pertence ao <Meta>, e e la que ficou.
 *
 * Ler o dicionario aqui dentro em vez de receber a string pronta mantem o
 * componente de SERVIDOR: `lang` e uma prop de dado, nao um estado de cliente,
 * entao nada nesta arvore precisa de `"use client"` para trocar de idioma.
 *
 * `status` e tipado por `ProjectStatus` (lib/projects.ts) e nao por
 * `keyof Dict["status"]`: a chave `prefixo` mora no mesmo objeto do dicionario
 * — e ela e o rotulo "STATUS:", nao um estado — entao derivar o tipo dali
 * aceitaria `<StatusPill status="prefixo" />` sem erro de compilacao.
 */
export function StatusPill({
  status,
  d,
}: {
  status: ProjectStatus;
  d: Dict["status"];
}) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-tag uppercase">
      <span aria-hidden className="h-1.5 w-1.5 bg-current" />
      {d[status]}
    </span>
  );
}
