import { Bloco } from "../ui/Bloco";
import { Label } from "../ui/Label";
import { DashedRule } from "../ui/DashedRule";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import { stack, type Tech } from "@/lib/stack";
import { dict } from "@/lib/dict";
import type { Lang } from "@/lib/i18n";

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
 *
 * O NOME DA TECNOLOGIA NAO TRADUZ, e por isso `lib/stack.ts` fica fora do
 * `I18n<T>`: "TypeScript", "pgvector" e "Spring" sao os mesmos nos dois
 * idiomas, e duplica-los criaria um lugar onde as duas linguas podem discordar
 * sobre como a ferramenta se chama. O que traduz e o TITULO DA COLUNA
 * ("LINGUAGENS" / "LANGUAGES"), e ele agora vem de `dict[lang].categorias`.
 */

/**
 * A ordem de leitura das colunas: do que ele escreve para onde ele roda. So a
 * ORDEM mora aqui — o titulo de cada coluna vem do dicionario.
 *
 * Havia uma constante local com os cinco titulos cravados em portugues
 * ("LINGUAGENS", "FRONT-END", …), e ela era a fonte real na tela: enquanto
 * existiu, `dict.categorias` estava traduzido e ninguem lia, entao /en saia
 * com "LINGUAGENS" no cabecalho da primeira coluna. Ordem e layout, titulo e
 * texto — sao coisas diferentes e agora moram em lugares diferentes.
 *
 * O tipo `Tech["category"]` e o guard: acrescentar uma categoria em
 * lib/stack.ts sem acrescentar a chave em `Dict["categorias"]` vira erro de
 * compilacao aqui embaixo, e nao uma coluna com cabecalho vazio na tela.
 */
const ORDEM: Tech["category"][] = [
  "language",
  "frontend",
  "backend",
  "ml",
  "infra",
];

export function StackMarquee({ lang }: { lang: Lang }) {
  const d = dict[lang];

  return (
    <Bloco ground="paper" id="stack">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeader
          eyebrow={d.secoes.stack.eyebrow}
          title={d.secoes.stack.title}
          description={d.secoes.stack.description}
          tone="paper"
        />

        <Reveal>
          {/* MOBILE 390: duas colunas, as cinco categorias fluindo em sequencia.
              A secao inteira passa a caber em ~1,5 tela, em vez de rolar
              sozinha para sempre. */}
          <div className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
            {ORDEM.map((key) => (
              <div key={key}>
                <Label className="text-carvao">{d.categorias[key]}</Label>
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
