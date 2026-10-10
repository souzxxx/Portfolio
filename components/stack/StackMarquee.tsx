import { Bloco } from "../ui/Bloco";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import { Janela } from "../os/Janela";
import { PixelIcon, type NomeIcone } from "../os/PixelIcon";
import { PADROES, type NomePadrao } from "../fim/padroes";
import { stack, type Tech } from "@/lib/stack";
import { dict } from "@/lib/dict";
import type { Lang } from "@/lib/i18n";

/**
 * StackMarquee — o nome do export ficou (o call site em components/Home.tsx
 * importa `StackMarquee`), mas há muito tempo não é fita rolante: agora é a
 * janela "Sobre este computador" do souzxxx OS, em PAPEL.
 *
 * TRÊS ANDARES, do mais lúdico ao mais escaneável:
 *   1. a ficha da máquina — ícone de computador, "SOUZXXX OS", e três linhas no
 *      dialeto do "Sobre este Mac" (processador, memória, disco de
 *      inicialização) cujos VALORES são verdade: as frentes, o semestre, a
 *      cidade;
 *   2. a barra de ARMAZENAMENTO: as cinco categorias como fatias proporcionais
 *      ao número de ferramentas de cada uma, cada fatia numa trama 1-bit
 *      diferente — o "gráfico de disco" do Mac sem nenhuma cor nova;
 *   3. a tabela de verdade: cinco colunas, cada uma aberta pela amostra da
 *      trama da sua fatia (é a legenda da barra e o cabeçalho da coluna ao
 *      mesmo tempo), um ícone de pixel e o rótulo em bitmap.
 *
 * O que separa rótulo de dado continua sendo tipografia, não cor: rótulo em
 * Silkscreen caixa alta, dado em Courier Prime caixa baixa — tudo carvão sobre
 * papel (15.66:1). Os nomes de tecnologia não traduzem (ver lib/stack.ts); os
 * títulos de coluna vêm de `dict[lang].categorias`.
 */

/**
 * A ordem de leitura das colunas — do que ele escreve para onde ele roda — e,
 * para cada categoria, a trama da fatia e o ícone do cabeçalho. O tipo
 * `Tech["category"]` é o guard: categoria nova em lib/stack.ts sem entrada
 * aqui vira erro de compilação, não coluna sem cabeçalho.
 */
const CATEGORIAS: {
  chave: Tech["category"];
  padrao: NomePadrao;
  icone: NomeIcone;
}[] = [
  { chave: "language", padrao: "cheio", icone: "documento" },
  { chave: "frontend", padrao: "xadrez", icone: "globo" },
  { chave: "backend", padrao: "diagonal", icone: "terminal" },
  { chave: "ml", padrao: "linhas", icone: "grafico" },
  { chave: "infra", padrao: "pontos", icone: "disquete" },
];

export function StackMarquee({ lang }: { lang: Lang }) {
  const d = dict[lang];
  const s = d.contato.stack;
  const grupos = CATEGORIAS.map((c) => ({
    ...c,
    itens: stack.filter((t) => t.category === c.chave),
  }));
  const total = stack.length;

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
          <Janela
            titulo={s.janela}
            className="mt-[clamp(2.5rem,6vw,4rem)]"
            corpoClassName="p-5 md:p-10"
            as="div"
          >
            {/* 1 · A ficha da máquina */}
            <div className="grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)] md:gap-10">
              <PixelIcon nome="computador" tamanho={96} className="hidden sm:block" />
              <div>
                <p className="font-display text-d2 uppercase text-carvao">
                  {s.sistema}
                </p>
                <p className="mt-2 font-mono text-tag uppercase text-ink-700">
                  {s.versao}
                </p>
                <dl className="mt-5 grid gap-x-8 gap-y-2 md:grid-cols-3">
                  {s.ficha.map(([rotulo, valor]) => (
                    <div key={rotulo}>
                      <dt className="font-bitmap text-[10px] uppercase leading-tight tracking-[0.08em] text-ink-700">
                        {rotulo}
                      </dt>
                      <dd className="mt-1 font-sans text-body text-carvao">
                        {valor}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* 2 · Armazenamento */}
            <div className="mt-10 border-t border-dashed border-carvao/30 pt-6">
              <div className="flex items-baseline justify-between font-bitmap text-[10px] uppercase leading-none tracking-[0.08em] text-carvao">
                <span>{s.armazenamento}</span>
                <span className="text-ink-700">
                  {total} {s.ferramentas}
                </span>
              </div>
              <div
                aria-hidden
                className="mt-3 flex h-6 border border-carvao bg-cream"
              >
                {grupos.map((g) => (
                  <span
                    key={g.chave}
                    className="h-full border-r border-carvao last:border-r-0"
                    style={{
                      ...PADROES[g.padrao],
                      width: `${(g.itens.length / total) * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 3 · A tabela */}
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
              {grupos.map((g) => (
                <div key={g.chave}>
                  <div className="flex items-center gap-2 border-b border-carvao pb-2">
                    <span
                      aria-hidden
                      className="h-3 w-3 shrink-0 border border-carvao"
                      style={PADROES[g.padrao]}
                    />
                    <PixelIcon nome={g.icone} tamanho={16} className="hidden lg:block" />
                    <span className="min-w-0 font-bitmap text-[10px] uppercase leading-none tracking-[0.08em] text-carvao">
                      {d.categorias[g.chave]}
                    </span>
                    <span className="ml-auto pl-1 font-mono text-tag text-ink-700">
                      {String(g.itens.length).padStart(2, "0")}
                    </span>
                  </div>
                  <ul>
                    {g.itens.map((tech) => (
                      <li
                        key={tech.name}
                        className="border-b border-dashed border-carvao/20 py-2.5 font-mono text-[15px] text-carvao md:py-2 md:text-body"
                      >
                        {tech.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Janela>
        </Reveal>
      </div>
    </Bloco>
  );
}
