import { Bloco } from "../ui/Bloco";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import { semesters } from "@/lib/academic";

/**
 * AcademicTimeline — a escada da formacao, em PAPEL.
 *
 * ELA ERA O SEGUNDO BLOCO AZUL do site, e existia com essa cor por uma razao de
 * ritmo: sem ela o azul de assinatura apareceria uma vez so, no hero, e a peca
 * leria como "uma capa azul + um site claro" em vez de uma partitura de cor.
 * Com o azul fora da identidade, essa razao caiu — e mante-la escura criaria o
 * problema oposto: ela vem logo depois do indice (carvao) e antes da stack
 * (papel), entao um bloco escuro aqui colaria dois escuros um no outro. Como so
 * existe UM escuro no sistema (carvao #1C1A17), dois escuros vizinhos nao leem
 * como troca de campo — leem como uma seccao unica com uma emenda no meio. Em
 * papel, a partitura fecha alternada: carvao → papel → papel → carvao → PAPEL →
 * papel → carvao.
 *
 * O DESENHO NAO MUDOU, so os tons: continua sendo uma escada de divisores
 * tracejados, sem cartao, sem caixa e sem sombra. O que era creme sobre azul
 * virou carvao sobre papel, na mesma hierarquia de tres degraus.
 *
 * Saiu a grade de 5 cartoes translucidos (canto arredondado, borda, blur de
 * fundo), com a pilula do numero do semestre, um icone por highlight, o filete
 * de gradiente que aparecia no hover e o deslocamento de -4px por cartao.
 * Entrou uma ESCADA: o numero do semestre num trilho a esquerda, o label em
 * serifa caixa alta, e os highlights como linhas de tabela separadas por filete
 * tracejado.
 *
 * ZERO hover na secao inteira, e nenhum icone vindo de biblioteca externa. O
 * unico movimento e um <Reveal> por semestre — cinco no total: layout estatico
 * e confiante nao desliza a cada celula.
 *
 * CONTRASTE (sobre papel #F5F3EE): `carvao` 15.66:1 nos rotulos e no nome de
 * cada disciplina, `ink-600` 10.25:1 na descricao e no numero do semestre,
 * `ink-700` 6.50:1 no rotulo de abertura da secao. Nenhum tom desta secao sai
 * da matriz do tailwind.config.ts.
 *
 * DIACRITICO: o titulo da secao e os labels de semestre usam `d2`/`d3`, cujo
 * leading minimo e 0.95/1.02. Com o `d1` de 0.88 o til de FORMACAO encostaria
 * na linha de cima.
 */
export function AcademicTimeline() {
  return (
    <Bloco ground="paper" id="academic">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeader
          eyebrow="#04 · FORMAÇÃO"
          title="Insper · BCC"
          description="Bacharelado em Ciência da Computação. Cinco semestres explorando da matemática discreta a sistemas distribuídos, IA aplicada, dados em larga escala e arquitetura de baixo nível."
          tone="paper"
        />

        {/* A borda de baixo fecha a escada: cada degrau traz a propria borda de
            cima, entao sem isto o ultimo semestre ficaria aberto. */}
        <div className="mt-[clamp(2.5rem,6vw,4rem)] border-b border-dashed border-carvao/30">
          {semesters.map((sem) => (
            <Reveal key={sem.number}>
              {/* MOBILE: duas colunas de largura automatica, o que poe S{n} e o
                  label do semestre na MESMA linha, alinhados pela base.
                  DESKTOP: a primeira trilha vira o trilho de --rail, a mesma
                  coluna de numero que o resto do site usa. O posicionamento das
                  celulas nao muda entre os dois — so a largura da trilha. */}
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 border-t border-dashed border-carvao/30 py-[clamp(1.75rem,3.5vw,3rem)] md:grid-cols-[var(--rail)_minmax(0,1fr)] md:gap-x-8">
                <span className="font-display text-[34px] leading-none text-ink-600 md:text-d3">
                  S{sem.number}
                </span>

                <h3 className="font-display text-d3 uppercase text-carvao">
                  {sem.label}
                </h3>

                <div className="col-span-2 mt-5 self-start md:col-span-1 md:col-start-2 md:mt-6">
                  {sem.highlights.map((h) => (
                    // Cada highlight e uma linha de tabela: nome a esquerda,
                    // descricao a direita, filete tracejado no lugar da borda
                    // do cartao. No mobile quebra em duas linhas e o filete
                    // continua sendo o unico separador. `py-3` + `text-body`
                    // deixa cada celula em ~50px, acima do minimo de 44.
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
          ))}
        </div>
      </div>
    </Bloco>
  );
}
