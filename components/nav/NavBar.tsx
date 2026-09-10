"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { DashedRule } from "../ui/DashedRule";

/**
 * NavBar — DUAS pecas, e nada mais.
 *
 * 1) CABECALHO EM FLUXO que pinta o PROPRIO campo azul. `app/page.tsx` renderiza
 *    <NavBar /> como irmao imediatamente acima de <Hero />, e o Hero tambem
 *    pinta `bg-blue`: os dois leem como um campo continuo, sem costura, e nenhum
 *    dos dois precisa saber a altura do outro. Por isso o azul mora aqui dentro
 *    (`block-blue`) e nao num wrapper da pagina.
 *
 * 2) BARRA STICKY DE 44px que so aparece DEPOIS do hero. Solida (`bg-ink`), sem
 *    `backdrop-filter`: filtro de fundo em elemento `position: fixed` e a causa
 *    do jank de scroll no iOS Safari que a auditoria reportou. Altura FIXA em
 *    qualquer viewport e transicao so de `transform` — zero layout shift quando
 *    ela entra.
 *
 * Nenhum icone, nenhuma pilula, nenhum blur, nenhum gradiente: a hierarquia vem
 * de caixa alta + tracking + um filete tracejado, como numa folha de rosto.
 */

const links = [
  { href: "#projects", label: "Projetos" },
  { href: "#academic", label: "Formação" },
  { href: "#stack", label: "Stack" },
  { href: "#about", label: "Contato" },
];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // 0.85 da altura da janela: a barra so entra quando o hero ja saiu de cena,
    // nunca no meio da primeira dobra.
    const onScroll = () =>
      setScrolled(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="block-blue w-full">
        <nav
          aria-label="Principal"
          className="mx-auto flex max-w-[96rem] flex-wrap items-baseline justify-between gap-4 px-[var(--gutter)] pb-5 pt-6"
        >
          {/* O feedback e a INVERSAO, nunca um fade de opacidade: e a mesma
              lingua dos links do rodape e das linhas de contato. Sobre azul,
              creme com texto azul da 8.33:1. O `-mx-1/px-1` faz a caixa creme
              nascer 4px alem do glifo sem deslocar o alinhamento do gutter. */}
          <a
            href="#top"
            className="-mx-1 px-1 font-mono text-selo uppercase text-cream motion-safe:transition-colors motion-safe:duration-150 hover:bg-cream hover:text-blue"
          >
            souzxx
          </a>

          {/* Desktop: os 4 links numa linha, unidos pelo separador do site. */}
          <ul className="hidden items-baseline md:flex">
            {links.map((l, i) => (
              <li key={l.href} className="flex items-baseline">
                {i > 0 ? (
                  <span
                    aria-hidden
                    className="px-3 font-mono text-tag text-cream-600"
                  >
                    ·
                  </span>
                ) : null}
                <a
                  href={l.href}
                  className="font-sans text-meta uppercase text-cream-600 motion-safe:transition-colors motion-safe:duration-150 hover:text-cream"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* O filete que abre a publicacao. Recolhe no mobile porque la o proprio
            indice 2x2 abre com o mesmo tracejado — duas linhas a 1px de
            distancia leriam como erro de render, nao como sistema. */}
        <div className="mx-auto hidden max-w-[96rem] px-[var(--gutter)] md:block">
          <DashedRule className="border-cream" />
        </div>

        {/* MOBILE 390: os 4 links nao cabem em uma linha. Viram uma ficha de
            indice 2x2 — sem hamburguer, sem JS, sem estado — com 44px de alvo
            de toque por celula. */}
        <div className="mx-auto max-w-[96rem] px-[var(--gutter)] md:hidden">
          <ul className="grid grid-cols-2 border-t border-dashed border-cream/30">
            {links.map((l, i) => (
              <li
                key={l.href}
                className={clsx(
                  "border-b border-dashed border-cream/30",
                  i % 2 === 1 && "border-l border-dashed border-cream/30",
                )}
              >
                <a
                  href={l.href}
                  className={clsx(
                    "flex min-h-[44px] items-center gap-2 py-3 pr-3 font-sans text-meta uppercase text-cream",
                    i % 2 === 1 && "pl-4",
                  )}
                >
                  <span
                    aria-hidden
                    className="font-mono text-tag text-cream-600"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Barra sticky. `invisible` (e nao so `-translate-y-full`) tira o
          elemento da ordem de tabulacao enquanto ela esta recolhida. */}
      <div
        className={clsx(
          "fixed inset-x-0 top-0 z-50 h-11 border-b border-cream/25 bg-ink text-cream",
          "motion-safe:transition-transform motion-safe:duration-200",
          scrolled ? "translate-y-0" : "invisible -translate-y-full",
        )}
      >
        <nav
          aria-label="Atalhos"
          className="mx-auto flex h-11 max-w-[96rem] items-center justify-between gap-4 px-[var(--gutter)]"
        >
          {/* `-my-3 py-3` leva o alvo de toque a 44px sem esticar a barra, que
              tem altura FIXA de 44px. Mesma inversao do cabecalho, agora sobre
              breu: creme com texto breu, 16.61:1. */}
          <a
            href="#top"
            className="-mx-1 -my-3 px-1 py-3 font-mono text-tag uppercase text-cream motion-safe:transition-colors motion-safe:duration-150 hover:bg-cream hover:text-ink focus-visible:bg-cream focus-visible:text-ink focus-visible:outline-cream"
          >
            souzxx
          </a>

          <div className="flex items-center gap-4">
            <ul className="hidden items-baseline md:flex">
              {links.map((l, i) => (
                <li key={l.href} className="flex items-baseline">
                  {i > 0 ? (
                    <span
                      aria-hidden
                      className="px-3 font-mono text-tag text-cream-700"
                    >
                      ·
                    </span>
                  ) : null}
                  <a
                    href={l.href}
                    className="-my-3 py-3 font-sans text-meta uppercase text-cream-600 motion-safe:transition-colors motion-safe:duration-150 hover:text-cream"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Mobile: o unico atalho que cabe numa barra de 44px. */}
            <a
              href="#about"
              className="-my-3 py-3 font-sans text-meta uppercase text-cream md:hidden"
            >
              Contato ↗
            </a>

            <a
              href="#top"
              aria-label="Voltar ao topo"
              className="-my-3 py-3 font-mono text-tag text-cream-600 motion-safe:transition-colors motion-safe:duration-150 hover:text-cream"
            >
              ↑
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
