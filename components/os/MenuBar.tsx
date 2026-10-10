"use client";

import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { PixelIcon } from "./PixelIcon";
import { Relogio } from "./Relogio";
import type { Dict } from "@/lib/dict";
import { HTML_LANG, LANGS, LANG_LABEL, hrefProjeto } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

/**
 * MenuBar — a barra de menu do souzxxx OS, e a navegação do site inteiro.
 *
 * Fixa no topo, 28 px, papel creme com tinta carvão: é a barra branca do
 * Macintosh pousada sobre a mesa escura do hero. Ela substitui o cabeçalho e a
 * barra sticky antigos — uma peça só, sempre visível, em todas as páginas.
 *
 * O feedback de hover/foco é a INVERSÃO (carvão com texto creme), como nos
 * menus do Mac e como já era a língua dos links do site. Dourado não entra: a
 * barra é papel, e o dourado nunca toca papel.
 *
 * `base` existe porque a mesma barra roda na home e nas páginas de case: na
 * home as âncoras são "#projects"; num case elas precisam voltar para a home
 * ("/#projects", "/en#projects"). `outroIdioma` é o endereço da MESMA página na
 * outra língua — na home, a outra home; num case, o mesmo case.
 */
export function MenuBar({
  lang,
  nav,
  os,
  projetos,
  base = "",
  outroIdioma,
}: {
  lang: Lang;
  nav: Dict["nav"];
  os: Dict["os"]["menu"];
  projetos: { slug: string; name: string }[];
  base?: string;
  outroIdioma: string;
}) {
  const [aberto, setAberto] = useState(false);
  const menuId = useId();
  const raiz = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  const item =
    "flex h-7 items-center px-2.5 outline-none hover:bg-carvao hover:text-cream focus-visible:bg-carvao focus-visible:text-cream";

  // O primeiro link do dicionário é "Projetos": ele vira o menu suspenso, e os
  // outros três seguem como âncoras simples.
  const [, ...outros] = nav.links;

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-7 border-b border-carvao bg-cream text-carvao">
      <nav
        aria-label={nav.principal}
        className="mx-auto flex h-full max-w-[120rem] items-center justify-between pl-1 pr-2 font-bitmap text-[10px] uppercase leading-none tracking-[0.06em] sm:pl-2 sm:text-[11px]"
      >
        <ul className="flex h-full items-center">
          <li>
            <a
              href={`${base}#top`}
              className={clsx(item, "gap-2 font-bold")}
              aria-label="souzxxx — início"
            >
              <PixelIcon nome="computador" tamanho={16} />
              <span>souzxxx</span>
            </a>
          </li>

          <li ref={raiz} className="relative h-full">
            <button
              type="button"
              aria-expanded={aberto}
              aria-controls={menuId}
              onClick={() => setAberto((v) => !v)}
              className={clsx(item, aberto && "bg-carvao text-cream")}
            >
              {os.projetos}
            </button>
            {aberto ? (
              <ul
                id={menuId}
                className="absolute left-0 top-full z-50 min-w-[18rem] border border-carvao bg-cream py-1 shadow-[4px_4px_0_0_#1C1A17]"
              >
                {projetos.map((p, i) => (
                  <li key={p.slug}>
                    <a
                      href={hrefProjeto(lang, p.slug)}
                      data-zoom=""
                      onClick={() => setAberto(false)}
                      className="flex items-baseline gap-3 px-3 py-2 normal-case outline-none hover:bg-carvao hover:text-cream focus-visible:bg-carvao focus-visible:text-cream"
                    >
                      <span className="font-mono text-[11px] opacity-60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-sans text-[13px] tracking-normal">
                        {p.name}
                      </span>
                    </a>
                  </li>
                ))}
                <li aria-hidden className="mx-2 my-1 border-t border-dotted border-carvao" />
                <li>
                  <a
                    href={`${base}#projects`}
                    onClick={() => setAberto(false)}
                    className="block px-3 py-2 outline-none hover:bg-carvao hover:text-cream focus-visible:bg-carvao focus-visible:text-cream"
                  >
                    {os.todos}
                  </a>
                </li>
              </ul>
            ) : null}
          </li>

          {outros.map((l, i) => (
            <li
              key={l.href}
              // No celular só cabe o último (Contato): Formação e Stack ficam
              // a um scroll de distância e não disputam os 390 px.
              className={clsx(i < outros.length - 1 && "hidden md:block")}
            >
              <a href={`${base}${l.href}`} className={item}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex h-full items-center">
          <span className="mr-3 hidden items-center gap-2 lg:flex">
            <span
              aria-hidden
              className="h-[7px] w-[7px] bg-carvao motion-safe:animate-[piscar_1.6s_steps(2)_infinite]"
            />
            {os.disponivel}
          </span>

          <ul aria-label={nav.idioma} className="flex h-full items-center">
            {LANGS.map((l) => {
              const ativo = l === lang;
              return (
                <li key={l} className="h-full">
                  <a
                    href={ativo ? `${base}#top` : outroIdioma}
                    hrefLang={HTML_LANG[l]}
                    aria-current={ativo ? "true" : undefined}
                    aria-label={`${LANG_LABEL[l]} — ${ativo ? nav.idiomaAtual : nav.trocarIdioma}`}
                    className={clsx(item, "px-2", ativo && "bg-carvao text-cream")}
                  >
                    {LANG_LABEL[l]}
                  </a>
                </li>
              );
            })}
          </ul>

          <Relogio
            lang={lang}
            rotulo={os.relogio}
            className="ml-2 hidden tabular-nums sm:block"
          />
        </div>
      </nav>
    </header>
  );
}
