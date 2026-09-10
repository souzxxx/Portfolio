import { DashedRule } from "./ui/DashedRule";
import { Meta } from "./ui/Meta";
import { WordmarkRow } from "./ui/CutWordmark";

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
 */

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
  { label: "Email", href: "mailto:leonardosouzasilva9@gmail.com" },
];

const WORDMARK = "SOUZXX";

export function Footer() {
  return (
    <footer className="block-carvao overflow-clip">
      {/* WORDMARK AJUSTADO A MEDIDA — a MESMA peca do <CutWordmark>, so que em
          creme sobre carvao. Antes o bloco tinha 118% de largura e -9vw de
          deslocamento, o que jogava o "S" para fora da borda esquerda: em 1440
          e em 390 lia-se "OUZXX", que o olho registra como bug de render e nao
          como corte editorial. Agora as 6 letras sao compostas para a medida
          (`max-w-[96rem]` + goteira, igual ao resto do site) e a folga de ~4%
          vira respiro entre elas — palavra inteira, encostando nas duas
          margens. A matematica do ajuste esta documentada em CutWordmark.tsx.
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
          glifos, nunca de sombra. */}
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
          <Meta
            items={[
              "Next.js 14 (App Router)",
              "conteúdo tipado em lib/",
              "deploy na Vercel",
              "São Paulo",
            ]}
            className="text-cream-700"
          />
        </div>
      </div>
    </footer>
  );
}
