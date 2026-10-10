import clsx from "clsx";
import { Bloco } from "../ui/Bloco";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import { Janela } from "../os/Janela";
import { PixelIcon } from "../os/PixelIcon";
import { PADROES } from "../fim/padroes";
import { BarraDeCopia } from "./BarraDeCopia";
import { TOTAL_SEMESTRES, getSemestres } from "@/lib/academic";
import { dict } from "@/lib/dict";
import type { Lang } from "@/lib/i18n";

/**
 * AcademicTimeline — a formação como um diálogo de cópia do Finder, em PAPEL.
 *
 * A METÁFORA É LITERAL E É CONTÁVEL: "Copiando conhecimento… Semestre 5 de 8",
 * do disquete do Insper para o computador do souzxxx, com a barra 1-bit cheia
 * até onde o curso de fato está (4 semestres concluídos em carvão, o 5º em
 * trama xadrez, 3 na fila em papel). O número não é decorativo: sai de
 * `getSemestres().length` contra `TOTAL_SEMESTRES`, então acrescentar o 6º
 * semestre em lib/academic.ts move a barra e o rótulo juntos.
 *
 * O CONTEÚDO CONTINUA INTEIRO. O diálogo fica na coluna esquerda, preso
 * (`sticky`) enquanto a lista de semestres rola na direita — no desktop o
 * leitor sempre sabe "em que ponto da cópia" está o semestre que ele lê. A
 * lista é a mesma escada de antes (nome à esquerda, descrição à direita,
 * filete tracejado), agora com um cabeçalho de "disco" por semestre e os três
 * que faltam como vagas tracejadas na fila. No mobile o diálogo vem primeiro
 * e a lista desce embaixo dele, sem sticky.
 *
 * COMPONENTE DE SERVIDOR: a única ilha de cliente é a <BarraDeCopia>, que só
 * anima a largura que o servidor já escreveu.
 *
 * CONTRASTE (papel #F5F3EE): carvão 15.66:1 nos nomes e rótulos, ink-600
 * 10.25:1 nas descrições, ink-700 6.50:1 nas etiquetas mono. Nenhum dourado.
 */
export function AcademicTimeline({ lang }: { lang: Lang }) {
  const d = dict[lang];
  const f = d.contato.formacao;
  const semestres = getSemestres(lang);
  const atual = semestres.length;
  const restantes = TOTAL_SEMESTRES - atual;

  return (
    <Bloco ground="paper" id="academic">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeader
          eyebrow={d.secoes.academico.eyebrow}
          title={d.secoes.academico.title}
          description={d.secoes.academico.description}
          tone="paper"
        />

        <div className="mt-[clamp(2.5rem,6vw,4rem)] grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal>
              <Janela titulo={f.janela} as="div" corpoClassName="p-5 md:p-7">
                <div aria-hidden className="flex items-center gap-3">
                  <PixelIcon nome="disquete" tamanho={64} />
                  {/* O "voo" do arquivo do Finder, parado: uma trilha de
                      pontos em 1-bit entre a origem e o destino. */}
                  <span
                    className="h-[4px] flex-1"
                    style={PADROES.pontos}
                  />
                  <PixelIcon nome="documento" tamanho={32} />
                  <span
                    className="h-[4px] flex-1"
                    style={PADROES.pontos}
                  />
                  <PixelIcon nome="computador" tamanho={64} />
                </div>

                <div className="mt-6 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-sans text-lead font-medium text-carvao">
                      {f.copiando}
                    </p>
                    <p className="mt-1 font-mono text-tag uppercase text-ink-700">
                      {f.origem} → {f.destino}
                    </p>
                  </div>
                  {/* O contador grande: "5/8" é a leitura de um segundo. */}
                  <p className="shrink-0 font-display text-d2 leading-[0.8] text-carvao">
                    {atual}
                    <span className="text-ink-700">/{TOTAL_SEMESTRES}</span>
                  </p>
                </div>

                <div className="mt-5">
                  <BarraDeCopia
                    concluidos={atual - 1}
                    atual
                    total={TOTAL_SEMESTRES}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-bitmap text-[10px] uppercase leading-none tracking-[0.08em] text-carvao">
                  <span>
                    {f.semestre} {atual} {f.de} {TOTAL_SEMESTRES}
                  </span>
                  <span className="text-ink-700">
                    {f.restante.replace("{n}", String(restantes))}
                  </span>
                </div>
              </Janela>
            </Reveal>
          </div>

          <ol className="border-b border-dashed border-carvao/30">
            {semestres.map((sem) => {
              const emCurso = sem.number === atual;
              // O label do 5º traz "(atual)" no dado; aqui quem diz isso é o
              // selo EM CURSO, então o parêntese sai só da tela.
              const rotulo = sem.label.replace(/\s*\(.*\)\s*$/, "");
              return (
                <li key={sem.number}>
                  <Reveal>
                    <div className="border-t border-dashed border-carvao/30 py-[clamp(1.5rem,3vw,2.25rem)]">
                      <div className="flex items-center gap-3">
                        <PixelIcon nome="disquete" tamanho={32} />
                        <span className="font-bitmap text-[10px] uppercase leading-none tracking-[0.08em] text-ink-700">
                          S{sem.number}
                        </span>
                        <h3 className="font-display text-d3 uppercase text-carvao">
                          {rotulo}
                        </h3>
                        <span
                          className={clsx(
                            "ml-auto shrink-0 px-2 py-1 font-bitmap text-[10px] uppercase leading-none tracking-[0.08em]",
                            emCurso
                              ? "bg-carvao text-cream"
                              : "border border-carvao/30 text-ink-700",
                          )}
                        >
                          {emCurso ? f.emCurso : f.concluido}
                        </span>
                      </div>

                      <div className="mt-4 md:pl-11">
                        {sem.highlights.map((h) => (
                          <div
                            key={h.name}
                            className="grid gap-1 border-t border-dashed border-carvao/20 py-3 md:grid-cols-[1fr_1.4fr] md:gap-6"
                          >
                            <span className="font-sans text-body font-medium text-carvao">
                              {h.name}
                            </span>
                            <span className="font-sans text-body text-ink-600">
                              {h.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                </li>
              );
            })}

            {/* A fila: os semestres que ainda não começaram, sem conteúdo
                inventado — só a vaga tracejada e o número. */}
            <li className="border-t border-dashed border-carvao/30 py-6">
              <ul className="grid grid-cols-3 gap-3">
                {Array.from({ length: restantes }, (_, i) => atual + 1 + i).map(
                  (n) => (
                    <li
                      key={n}
                      className="flex items-center justify-center gap-2 border border-dashed border-carvao/40 px-2 py-3 text-ink-700 sm:justify-start sm:px-3"
                    >
                      <PixelIcon
                        nome="disquete"
                        tamanho={16}
                        className="hidden opacity-60 sm:block"
                      />
                      <span className="whitespace-nowrap font-bitmap text-[10px] uppercase leading-none tracking-[0.08em]">
                        S{n} · {f.naFila}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </Bloco>
  );
}
