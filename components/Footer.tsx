import { DashedRule } from "./ui/DashedRule";
import { Meta } from "./ui/Meta";
import { WordmarkRow } from "./ui/CutWordmark";
import { dict } from "@/lib/dict";
import type { Lang } from "@/lib/i18n";

/**
 * Footer — continua o MESMO campo carvao do bloco de contato, sem costura: o
 * <About> pinta `bg-carvao` e o footer tambem, entao os dois leem como uma
 * unica area escura de fechamento. Nao ha borda, nem gap, nem wrapper entre
 * eles.
 *
 * Tres peças, de cima para baixo:
 *   1. wordmark gigante ajustado a medida, palavra inteira, encostando nas
 *      duas margens (a mesma peca do <CutWordmark>, em creme);
 *   2. banner 8-bit autoral (texto puro em Silkscreen, uma camada so);
 *   3. a faixa de meta: copyright, links e a linha tecnica.
 *
 * O QUE TRADUZ AQUI E POUCO, e de proposito. O rotulo do link de e-mail
 * ("Email") e a linha tecnica da direita vem de `dict[lang].rodape`. O
 * copyright continua montado NESTE arquivo porque "© 2026 Leonardo Souza" e
 * identico nos dois idiomas — poe-lo no dicionario obrigaria a duplicar o ano
 * e o nome em dois arquivos, e o ano nem e texto: sai de `getFullYear()`. Os
 * enderecos de GitHub e LinkedIn tambem ficam: o rotulo do primeiro E o
 * endereco ("github.com/souzxxx") e o do segundo e nome proprio.
 */

const WORDMARK = "SOUZXXX";

export function Footer({ lang }: { lang: Lang }) {
  const d = dict[lang];

  const links = [
    {
      label: "github.com/souzxxx",
      href: "https://github.com/souzxxx",
      externo: true,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/leonardo-souzx",
      externo: true,
    },
    { label: d.rodape.email, href: "mailto:leonardosouzasilva9@gmail.com" },
  ];

  return (
    <footer className="block-carvao overflow-clip">
      {/* WORDMARK AJUSTADO A MEDIDA — a MESMA peca do <CutWordmark>, so que em
          creme sobre carvao. Antes o bloco tinha 118% de largura e -9vw de
          deslocamento, o que jogava o "S" para fora da borda esquerda: em 1440
          e em 390 lia-se "OUZXX", que o olho registra como bug de render e nao
          como corte editorial. Agora as 7 letras de SOUZXXX sao compostas para
          a medida (`max-w-[96rem]` + goteira, igual ao resto do site) e a folga
          de 4.17% vira respiro entre elas — palavra inteira, encostando nas
          duas margens, com 11.4px de vao em 1440 e 3.0px em 390. Ganhar o
          terceiro X custou altura: em 1440 o corpo caiu de ~455px para ~371px,
          porque a largura e fixa pela medida e 7 glifos dentro dela sao
          necessariamente menores que 6. A conta NAO e a mancha da palavra em
          texto corrido — kerning nao atravessa fronteira de elemento e a peca
          compoe uma letra por <span>, entao a mancha que vale e a soma das
          sete caixas (3.478x, contra 3.284x em texto corrido). A matematica
          inteira esta documentada em CutWordmark.tsx.
          O `overflow-clip` do footer continua como rede de seguranca. */}
      <div className="mx-auto max-w-[96rem] px-[var(--gutter)] pt-10">
        <WordmarkRow text={WORDMARK} className="text-cream" />
      </div>

      {/* BANNER 8-BIT AUTORAL — texto puro em Silkscreen, sem imagem nenhuma.
          BISEL REMOVIDO (correcao de bug visual): a copia colorida deslocada
          3px/3px nao lia como degrau de bitmap, lia como franja serrilhada —
          na tela o acento de entao contra o fundo escuro dava 2.00:1, entao a
          copia nao aparecia como sombra colorida, so sujava o contorno dos
          glifos e passava impressao de render quebrado. Agora e creme puro
          sobre carvao (15.66:1), UMA camada so.
          Para o banner nao perder presenca sem a segunda camada, o corpo sobe
          de clamp(2rem,9vw,4.5rem) para clamp(2.25rem,10vw,5.25rem) e o
          tracking de 0.06em para 0.14em — peso vem de escala e de ar entre os
          glifos, nunca de sombra.

          O SETIMO GLIFO NAO EXIGIU MEXER NO CLAMP, e isso foi medido, nao
          suposto: em Silkscreen 400 com tracking 0.14em, "SOUZXXX" ocupa
          6.48x o font-size (contra 5.465x de "SOUZXX"). Nos dois extremos que
          importam a caixa continua folgada — em 390 o corpo e 39px (10vw) e a
          palavra da 253px numa largura util de 350px; em 1440 o corpo bate no
          teto de 84px e a palavra da 544px numa largura util de 1344px. O pior
          caso da faixa inteira e ~72% de ocupacao, entao nao ha transbordo em
          largura nenhuma de 320 a 1920 — e por isso NAO ha overflow escondido
          aqui: esconder transbordo e apagar o sintoma, e este nao existe. */}
      <p className="mt-8 px-[var(--gutter)] font-bitmap text-[clamp(2.25rem,10vw,5.25rem)] uppercase leading-none tracking-[0.14em] text-cream">
        {WORDMARK}
      </p>

      <DashedRule className="mt-10 border-cream" />

      {/* MOBILE 390: tres faixas empilhadas, separadas pelo mesmo tracejado,
          py-4 cada, todas comecando a esquerda. Desktop: tres colunas. */}
      <div className="grid divide-y divide-dashed divide-cream/25 px-[var(--gutter)] md:grid-cols-3 md:items-baseline md:gap-4 md:divide-y-0">
        <div className="py-4 md:py-6">
          <Meta
            items={[`© ${new Date().getFullYear()} Leonardo Souza`]}
            className="text-cream"
          />
        </div>

        <ul className="flex flex-col py-4 md:flex-row md:flex-wrap md:justify-center md:gap-x-5 md:py-6">
          {links.map((l) => (
            <li key={l.href}>
              {/* Feedback unico: a caixa inteira inverte creme<->carvao, igual
                  as linhas de contato do <About>. `focus-visible:outline-cream`
                  conserta o mesmo furo medido la — com a caixa invertida,
                  `currentColor` vira carvao e o anel, desenhado 2px FORA dela e
                  portanto ja sobre o bloco carvao, sairia carvao sobre carvao
                  (1:1). Creme devolve 15.66:1 ao anel de teclado. */}
              <a
                href={l.href}
                target={l.externo ? "_blank" : undefined}
                rel={l.externo ? "noreferrer" : undefined}
                className="-mx-1 flex min-h-[44px] items-center px-1 font-mono text-tag uppercase text-cream motion-safe:transition-colors motion-safe:duration-150 hover:bg-cream hover:text-carvao focus-visible:bg-cream focus-visible:text-carvao focus-visible:outline-cream md:min-h-0 md:py-0.5"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="py-4 md:justify-self-end md:py-6 md:text-right">
          <Meta items={d.rodape.tecnica} className="text-cream-700" />
        </div>
      </div>
    </footer>
  );
}
