import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Botao — o unico CTA do site. Retangulo de canto vivo, sem sombra, sem
 * gradiente, sem blur; inverte cor no hover.
 *
 * API (contrato, nao mude):
 *   <Botao
 *     href={string}
 *     variant?={"solid" | "outline" | "gold"}   // default: "outline"
 *     download?={boolean}
 *     external?={boolean}
 *     className?={string}
 *   >{children}</Botao>
 *
 * Sempre renderiza um <a>. `external` acrescenta target="_blank" rel="noreferrer".
 * NENHUM icone lucide em CTA nenhum: as setas sao as glifas ↗ e ↓, passadas
 * como children pelo call site — `Ver no GitHub ↗`, `Baixar CV ↓`.
 *
 * ── COMO A INVERSAO FUNCIONA ──────────────────────────────────────────────
 * `solid` e `outline` sao construidos em `currentColor`: a superficie do botao
 * (`bg-current` / `border-current`) usa a cor de TEXTO herdada do bloco, que a
 * matriz de contraste ja aprovou naquele fundo (creme sobre azul, breu sobre
 * papel, creme sobre breu). O que o botao NAO consegue deduzir sozinho e a cor
 * de FUNDO do bloco — e essa e exatamente a cor que o rotulo precisa ter
 * quando a superficie esta preenchida. Por isso o CALL SITE informa a cor de
 * inversao pelo `className`, um exemplo por fundo:
 *
 *   sobre azul  →  <Botao variant="solid"   className="text-blue" />
 *                  <Botao variant="outline" className="hover:text-blue" />
 *   sobre papel →  <Botao variant="solid"   className="text-cream" />
 *                  <Botao variant="outline" className="hover:text-cream" />
 *   sobre breu  →  <Botao variant="solid"   className="text-ink" />
 *                  <Botao variant="outline" className="hover:text-ink" />
 *
 * `className` e aplicado ao <span> do rotulo (nao ao <a>), porque o <a> precisa
 * manter a cor herdada do bloco para pintar `bg-current`/`border-current`. Esse
 * <span> carrega o padding e cobre o botao inteiro, entao `hover:` nele dispara
 * junto com o hover do <a> — nao existe zona morta na borda. Use `className`
 * para cor; para largura/margem, envolva o botao no layout do call site.
 *
 * `gold` traz as proprias cores e ignora a regra acima. E EXCLUSIVO de fundo
 * breu: gold #E8B23A sobre cream #F5F3EE = 1.74:1, que reprova ate o minimo
 * 3:1 de componente. Sobre breu da 9.53:1 nos dois sentidos. E o unico
 * elemento dourado do site inteiro (o CTA de curriculo).
 */
export function Botao({
  href,
  children,
  variant = "outline",
  download,
  external,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline" | "gold";
  download?: boolean;
  external?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      download={download}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={clsx(
        "inline-flex border align-middle motion-safe:transition-colors motion-safe:duration-150",
        variant === "solid" && "border-current bg-current hover:bg-transparent",
        variant === "outline" && "border-current bg-transparent hover:bg-current",
        variant === "gold" && "border-gold bg-gold text-ink hover:bg-ink hover:text-gold",
      )}
    >
      <span
        className={clsx(
          "inline-flex items-center gap-2 px-6 py-3 font-sans text-meta uppercase",
          "motion-safe:transition-colors motion-safe:duration-150",
          // Solid preenchido: o rotulo usa a cor de inversao do call site e
          // volta a cor herdada do bloco quando o fundo esvazia no hover.
          variant === "solid" && "hover:text-inherit",
          className,
        )}
      >
        {children}
      </span>
    </a>
  );
}
