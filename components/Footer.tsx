import type { CSSProperties } from "react";
import { DashedRule } from "./ui/DashedRule";
import { Meta } from "./ui/Meta";
import { PixelIcon } from "./os/PixelIcon";
import { dict } from "@/lib/dict";
import type { Lang } from "@/lib/i18n";

/**
 * Footer — continua o MESMO campo carvão do contato, sem costura: o <About>
 * pinta `bg-carvao`, termina sem padding de baixo, e o rodapé abre com o
 * próprio respiro e um tracejado creme. Lê como a última faixa da mesma área
 * escura, não como um bloco novo.
 *
 * O WORDMARK GIGANTE EM SERIFA SAIU DAQUI. Ele já existe uma vez, logo abaixo
 * do hero (<CutWordmark>), e o fechamento agora tem o próprio gigante — o
 * "VAMOS CONVERSAR" do contato. Dois blocos de tipo de 300px encostados
 * brigariam; o rodapé fica com a assinatura 8-bit, que é a voz do sistema.
 *
 * TRÊS PEÇAS: o banner SOUZXXX em Silkscreen (texto puro, uma camada só, sem
 * imagem), o "voltar ao topo" e a linha de colofão: "Feito com Next.js · deploy
 * na Vercel · © 2026 souzxxx". O handle é souzxxx com TRÊS x — o mesmo do
 * GitHub. O ano sai de `getFullYear()` no build, não do dicionário: número não
 * tem idioma.
 *
 * "Voltar ao topo" é um <a href="#top"> (âncora do wrapper da Home): funciona
 * sem JS, e o `scroll-behavior: smooth` do <html> já cuida do deslize — que o
 * CSS de movimento reduzido desliga sozinho.
 */

const WORDMARK = "SOUZXXX";

export function Footer({ lang }: { lang: Lang }) {
  const d = dict[lang];
  const r = d.contato.rodape;

  return (
    <footer className="block-carvao px-[var(--gutter)] pb-6 pt-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[96rem]">
        <DashedRule className="border-cream" />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <p className="flex items-center gap-[0.3em] font-bitmap text-[clamp(2.25rem,10vw,5.25rem)] uppercase leading-none tracking-[0.14em] text-cream">
            {/* Miolo carvão: com o default creme, tinta creme + miolo creme
                viraria um bloco chapado sem desenho. */}
            <span
              aria-hidden
              className="hidden md:block"
              style={{ "--icon-fill": "#1C1A17" } as CSSProperties}
            >
              <PixelIcon nome="computador" tamanho={64} className="h-[0.9em] w-[0.9em]" />
            </span>
            {WORDMARK}
          </p>

          <a
            href="#top"
            className="inline-flex min-h-[44px] items-center border border-cream/50 px-4 font-bitmap text-[10px] uppercase leading-none tracking-[0.08em] text-cream hover:bg-cream hover:text-carvao focus-visible:outline-cream motion-safe:transition-colors motion-safe:duration-150"
          >
            {r.topo}
          </a>
        </div>

        <div className="mt-8 border-t border-dashed border-cream/25 pt-4">
          <Meta
            items={[...r.linha, `© ${new Date().getFullYear()} souzxxx`]}
            className="text-cream-700"
          />
        </div>
      </div>
    </footer>
  );
}
