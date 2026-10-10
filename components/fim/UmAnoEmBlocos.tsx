import clsx from "clsx";
import type { CSSProperties } from "react";
import { Bloco } from "../ui/Bloco";
import { DashedRule } from "../ui/DashedRule";
import { Meta } from "../ui/Meta";
import { Reveal } from "../ui/Reveal";
import { LeituraDoMapa } from "./LeituraDoMapa";
import {
  GITHUB_USER,
  getContribuicoes,
  maiorSequencia,
  niveis,
} from "@/lib/github";
import { dict } from "@/lib/dict";
import type { Lang } from "@/lib/i18n";

/**
 * UmAnoEmBlocos — o heatmap de contribuições do GitHub, faixa própria em
 * CARVÃO entre a formação e a stack.
 *
 * POR QUE AQUI. A partitura vinha com dois papéis encostados (formação e
 * stack). O heatmap precisa de carvão — o creme em opacidade é a escala, e o
 * dourado do topo só pode existir sobre carvão —, então ele entra como a faixa
 * escura que separa os dois papéis: índice (carvão) → formação (papel) → um
 * ano em blocos (carvão) → stack (papel) → contato (carvão). Alternância
 * limpa, nenhum escuro encostado em outro. E a leitura fecha: o que ele
 * estuda, o que ele entrega todo dia, com que ferramentas.
 *
 * COMPONENTE ASSÍNCRONO DE SERVIDOR. Os dados vêm de lib/github.ts no build e
 * a cada 24h (ISR). Se a busca falhar, `getContribuicoes()` devolve null e a
 * faixa inteira some — melhor nenhuma seção do que uma grade vazia dizendo
 * "zero contribuições" sobre alguém que commita todo dia.
 *
 * A ESCALA: vazio = creme a 6%; quatro degraus de creme (20 → 88%); o topo
 * (dias acima do p95) em dourado. Dourado sobre carvão dá 7.31:1 e é o único
 * acento desta tela — nenhum outro elemento da faixa usa dourado.
 *
 * MOBILE: a grade não encolhe até virar poeira (53 semanas em 350px dariam
 * blocos de 5px). Ela mantém blocos de 11px e rola na horizontal DENTRO do
 * próprio contêiner, que abre já no fim — `dir="rtl"` no rolador faz o
 * navegador ancorar o conteúdo à direita sem uma linha de JS, e o `dir="ltr"`
 * de dentro devolve a ordem cronológica. A borda esquerda some num fade para
 * dizer "tem mais para lá".
 */

// Índice = nível (0–5). Classes inteiras, escritas por extenso, para o JIT
// do Tailwind enxergá-las.
const TOM = [
  "bg-cream/[0.06]",
  "bg-cream/20",
  "bg-cream/[0.38]",
  "bg-cream/60",
  "bg-cream/[0.88]",
  "bg-gold",
];

const DIA_MS = 86400000;

function utc(data: string) {
  return new Date(`${data}T00:00:00Z`);
}

export async function UmAnoEmBlocos({ lang }: { lang: Lang }) {
  const dados = await getContribuicoes();
  if (!dados) return null;

  const t = dict[lang].contato.atividade;
  const { dias, total } = dados;
  const nivel = niveis(dias);

  // A grade é coluna = semana (domingo → sábado), como no GitHub. O primeiro
  // dia raramente é domingo; os dias que faltam viram células vazias no topo
  // da primeira coluna.
  const recuo = utc(dias[0].data).getUTCDay();
  const semanas = Math.ceil((recuo + dias.length) / 7);

  // Rótulo de mês na coluna onde o dia 1 cai. Rótulo a menos de 3 colunas do
  // anterior é descartado (acontece só na primeira coluna, quando o ano
  // começa no fim de um mês) para dois nomes não se atropelarem.
  const fmtMes = new Intl.DateTimeFormat(t.locale, {
    month: "short",
    timeZone: "UTC",
  });
  const meses: { coluna: number; nome: string }[] = [];
  dias.forEach((d, i) => {
    const dt = utc(d.data);
    if (dt.getUTCDate() !== 1) return;
    const coluna = Math.floor((recuo + i) / 7);
    const anterior = meses[meses.length - 1];
    if (anterior && coluna - anterior.coluna < 3) return;
    meses.push({ coluna, nome: fmtMes.format(dt).replace(".", "") });
  });
  if (!meses.length || meses[0].coluna >= 3) {
    meses.unshift({ coluna: 0, nome: fmtMes.format(utc(dias[0].data)).replace(".", "") });
  }

  const num = new Intl.NumberFormat(t.locale);
  const ativos = dias.filter((d) => d.n > 0).length;
  const melhor = dias.reduce((a, b) => (b.n > a.n ? b : a), dias[0]);
  const fmtDia = new Intl.DateTimeFormat(t.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  // Período em dias corridos — o rótulo "de N" precisa bater com a grade, que
  // mostra 371 dias e não 365.
  const periodo =
    Math.round((utc(dias[dias.length - 1].data).getTime() - utc(dias[0].data).getTime()) / DIA_MS) + 1;

  const colunas = { "--semanas": semanas } as CSSProperties;
  const gradeCols =
    "[grid-template-columns:repeat(var(--semanas),11px)] md:[grid-template-columns:repeat(var(--semanas),minmax(0,1fr))]";

  const legenda = (
    <div className="flex items-center gap-2 font-bitmap text-[10px] uppercase leading-none tracking-[0.08em] text-cream-600">
      <span>{t.menos}</span>
      {TOM.map((tom) => (
        <span key={tom} aria-hidden className={clsx("h-[11px] w-[11px]", tom)} />
      ))}
      <span>{t.mais}</span>
    </div>
  );

  return (
    <Bloco ground="carvao" id="atividade">
      <div className="mx-auto max-w-[96rem]">
        <Reveal>
          <DashedRule className="border-cream" />
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <Meta items={[t.eyebrow]} className="text-cream-700" />
            <a
              href={`https://github.com/${GITHUB_USER}`}
              target="_blank"
              rel="noreferrer"
              className="-my-3 inline-flex min-h-[44px] items-center font-mono text-tag uppercase text-cream underline decoration-cream/40 underline-offset-4 hover:bg-cream hover:text-carvao focus-visible:outline-cream md:min-h-0 md:py-1"
            >
              {t.perfil}
            </a>
          </div>
          <h2 className="mt-5 font-display text-d2 uppercase text-cream">
            {t.titulo}
          </h2>
          <p className="mt-4 font-bitmap text-[13px] uppercase leading-snug tracking-[0.06em] text-cream md:text-[16px]">
            {num.format(total)} {t.totalSufixo}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-[clamp(2rem,5vw,3.5rem)]">
            <LeituraDoMapa
              legenda={legenda}
              rotulos={{
                vazia: t.leituraVazia,
                contribuicao: t.contribuicao,
                locale: t.locale,
              }}
            >
              <div
                dir="rtl"
                tabIndex={0}
                role="region"
                aria-label={`${t.aria}: ${num.format(total)} ${t.totalSufixo}`}
                className="overflow-x-auto [mask-image:linear-gradient(to_right,transparent,#000_3rem)] [scrollbar-width:none] focus-visible:outline-cream md:overflow-visible md:[mask-image:none] [&::-webkit-scrollbar]:hidden"
              >
                <div dir="ltr" className="w-max md:w-full" style={colunas}>
                  {/* Linha dos meses: mesma trilha de colunas da grade, então o
                      rótulo cai exatamente sobre a semana do dia 1. */}
                  <div
                    aria-hidden
                    className={clsx("grid gap-x-[3px] lg:gap-x-1", gradeCols)}
                  >
                    {meses.map((m) => (
                      <span
                        key={`${m.coluna}-${m.nome}`}
                        style={{
                          gridColumn: `${m.coluna + 1} / span ${Math.min(3, semanas - m.coluna)}`,
                        }}
                        className="row-start-1 whitespace-nowrap font-bitmap text-[10px] uppercase leading-none tracking-[0.08em] text-cream-700"
                      >
                        {m.nome}
                      </span>
                    ))}
                  </div>

                  <div
                    aria-hidden
                    className={clsx(
                      "mt-2 grid grid-flow-col gap-[3px] [grid-template-rows:repeat(7,auto)] lg:gap-1",
                      gradeCols,
                    )}
                  >
                    {Array.from({ length: recuo }, (_, i) => (
                      <span key={`r${i}`} />
                    ))}
                    {dias.map((d, i) => (
                      <span
                        key={d.data}
                        data-d={d.data}
                        data-n={d.n}
                        className={clsx(
                          "aspect-square hover:outline hover:outline-1 hover:outline-offset-1 hover:outline-cream",
                          TOM[nivel[i]],
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </LeituraDoMapa>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          {/* Os números por extenso — é aqui que o leitor de tela recebe o
              conteúdo do mapa, e é aqui que o recrutador com pressa lê sem
              precisar decifrar tom de bloco. */}
          <dl className="mt-10 grid grid-cols-1 gap-px border border-cream/20 bg-cream/20 sm:grid-cols-3">
            {[
              [t.maiorSequencia, `${num.format(maiorSequencia(dias))} ${t.dias}`],
              [t.melhorDia, `${num.format(melhor.n)} · ${fmtDia.format(utc(melhor.data)).replace(".", "")}`],
              [t.diasAtivos, `${num.format(ativos)} ${t.de} ${num.format(periodo)}`],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="bg-carvao px-5 py-4">
                <dt className="font-bitmap text-[10px] uppercase leading-none tracking-[0.08em] text-cream-700">
                  {rotulo}
                </dt>
                <dd className="mt-3 font-mono text-[1.375rem] leading-none text-cream">
                  {valor}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Bloco>
  );
}
