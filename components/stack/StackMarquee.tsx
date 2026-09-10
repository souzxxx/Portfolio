import { Bloco } from "../ui/Bloco";
import { Label } from "../ui/Label";
import { DashedRule } from "../ui/DashedRule";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import { stack, type Tech } from "@/lib/stack";

/**
 * StackMarquee — o NOME do export nao mudou (app/page.tsx importa
 * `StackMarquee`, e o contrato entre os itens da wave e que nenhum componente
 * exportado troque de nome), mas o conteudo deixou de ser fita rolante: agora e
 * uma tabela estatica em papel.
 *
 * O QUE SAIU, e por que:
 *   · as duas fileiras de rolagem infinita com 70 pilulas de canto arredondado
 *     e blur de fundo duplicadas — 70 caixas com blur animadas em loop era a
 *     coisa mais cara da pagina inteira;
 *   · as duas mascaras de gradiente lateral que esfumacavam as pontas da fita,
 *     e que forcavam uma camada de composicao permanente so para isso;
 *   · a bolinha COLORIDA POR TECNOLOGIA, que sozinha injetava ~20 cores fora do
 *     sistema (TypeScript azul, Java laranja, Prolog vinho, Turbo rosa…) — mais
 *     cores nessa unica secao do que no site inteiro depois desta wave;
 *   · e, de quebra, o transbordo horizontal de 390→495px que a fita de largura
 *     `w-max` causava: era esta secao que quebrava a igualdade
 *     `document.documentElement.scrollWidth === window.innerWidth` no celular.
 *
 * O terceiro campo de `lib/stack.ts` (a cor por tecnologia) DEIXA de ser lido
 * por qualquer componente do site. O arquivo de dados NAO foi alterado — nao e
 * propriedade deste item: o campo continua la, agora sem consumidor. Quem for
 * limpar `lib/stack.ts` depois, este era o unico lugar que o consumia.
 *
 * ZERO animacao aqui dentro: um unico <Reveal> no bloco todo, nenhum por item.
 * Sobre papel o dado e o rotulo de coluna sao ambos `carvao` (15.66:1) — o que
 * separa um do outro nao e mais cor, e tipografia: o rotulo e mono em caixa
 * alta com tracking de 0.18em, o dado e mono em caixa baixa. Quando o acento
 * era azul, a diferenca vinha de graca; num sistema de uma cor so ela tem que
 * ser desenhada.
 */

/** A ordem de leitura das colunas: do que ele escreve para onde ele roda. */
const CATEGORIAS: { key: Tech["category"]; titulo: string }[] = [
  { key: "language", titulo: "LINGUAGENS" },
  { key: "frontend", titulo: "FRONT-END" },
  { key: "backend", titulo: "BACK-END" },
  { key: "ml", titulo: "ML" },
  { key: "infra", titulo: "INFRA" },
];

export function StackMarquee() {
  return (
    <Bloco ground="paper" id="stack">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeader
          eyebrow="#05 · FERRAMENTAL"
          title="Tecnologias que uso"
          description="Frontend, backend, ML, infra — escolho a ferramenta certa para cada problema, não a moda."
          tone="paper"
        />

        <Reveal>
          {/* MOBILE 390: duas colunas, as cinco categorias fluindo em sequencia.
              A secao inteira passa a caber em ~1,5 tela, em vez de rolar
              sozinha para sempre. */}
          <div className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
            {CATEGORIAS.map(({ key, titulo }) => (
              <div key={key}>
                <Label className="text-carvao">{titulo}</Label>
                {/* O filete do cabecalho e o unico solido em intencao: fecha o
                    rotulo antes da primeira tecnologia. `border-carvao` sobe o
                    tracejado de currentColor para o carvao cheio. */}
                <DashedRule className="mt-2 border-carvao" />
                {stack
                  .filter((tech) => tech.category === key)
                  .map((tech) => (
                    <p
                      key={tech.name}
                      className="border-b border-dashed border-carvao/20 py-2.5 font-mono text-[15px] text-carvao md:py-2 md:text-body"
                    >
                      {tech.name}
                    </p>
                  ))}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Bloco>
  );
}
