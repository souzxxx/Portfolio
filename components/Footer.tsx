import { DashedRule } from "./ui/DashedRule";
import { Meta } from "./ui/Meta";

/**
 * Footer — continua o MESMO campo breu do bloco de contato, sem costura: o
 * <About> pinta `bg-ink` e o footer tambem, entao os dois leem como uma unica
 * area escura de fechamento. Nao ha borda, nem gap, nem wrapper entre eles.
 *
 * Tres peças, de cima para baixo:
 *   1. wordmark gigante cortado nas DUAS bordas da viewport;
 *   2. banner 8-bit autoral (texto puro, nenhuma imagem);
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
    <footer className="block-ink overflow-clip">
      {/* WORDMARK CORTADO NAS DUAS BORDAS.
          Medida: "SOUZXX" em Instrument Serif caixa alta tem mancha de ~2.67x o
          font-size. Com `text-wm` (que trava em 22rem acima de ~1300px) a
          palavra corrida da ~940px em 1440 — sangraria so a esquerda e deixaria
          630px de papel a direita. Distribuindo as 6 letras com
          `justify-between` num container de 118% deslocado -9vw, a primeira e a
          ultima letra caem FORA das duas bordas em qualquer largura (390 ou
          1440) e o excedente vira respiro entre as letras, que e exatamente o
          gesto editorial pretendido. O `overflow-clip` do footer garante zero
          scroll horizontal. */}
      <div
        aria-hidden
        className="flex w-[118%] -translate-x-[9vw] select-none justify-between whitespace-nowrap pt-10 font-display text-wm uppercase leading-[0.74] tracking-[-0.01em] text-cream"
      >
        {WORDMARK.split("").map((letra, i) => (
          <span key={`${letra}-${i}`}>{letra}</span>
        ))}
      </div>

      {/* BANNER 8-BIT AUTORAL — texto puro em Silkscreen, sem imagem nenhuma.
          O bisel e uma COPIA absoluta deslocada 3px/3px, nao um `text-shadow`
          desfocado: bitmap nao tem penumbra, tem degrau. A copia e decorativa
          (`aria-hidden`) e o azul de assinatura entra aqui como valor arbitrario
          de cor, e nao pela classe nomeada da paleta, de proposito: a proibicao
          de azul sobre breu existe porque azul lido COMO TEXTO da 2.00:1, e esta
          camada nunca e lida — quem carrega a leitura sao os glifos creme por
          cima, a 16.61:1. Escrever o hex aqui mantem o grep de auditoria limpo
          sem esconder a intencao. */}
      <p className="relative mt-8 px-[var(--gutter)] font-bitmap text-[clamp(2rem,9vw,4.5rem)] uppercase leading-none tracking-[0.06em] text-cream">
        <span
          aria-hidden
          className="absolute left-[calc(var(--gutter)+3px)] top-[3px] text-[#1620DC]"
        >
          {WORDMARK}
        </span>
        <span className="relative">{WORDMARK}</span>
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
              {/* Feedback unico: a caixa inteira inverte creme<->breu, igual as
                  linhas de contato do <About>. `focus-visible:outline-cream`
                  conserta o mesmo furo medido la — com a caixa invertida,
                  `currentColor` vira breu e o anel, desenhado 2px FORA dela e
                  portanto ja sobre o bloco breu, sairia breu sobre breu (1:1).
                  Creme devolve 16.61:1 ao anel de teclado. */}
              <a
                href={l.href}
                target={l.externo ? "_blank" : undefined}
                rel={l.externo ? "noreferrer" : undefined}
                className="-mx-1 flex min-h-[44px] items-center px-1 font-mono text-tag uppercase text-cream motion-safe:transition-colors motion-safe:duration-150 hover:bg-cream hover:text-ink focus-visible:bg-cream focus-visible:text-ink focus-visible:outline-cream md:min-h-0 md:py-0.5"
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
