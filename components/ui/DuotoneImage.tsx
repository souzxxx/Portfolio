"use client";

import Image from "next/image";
import clsx from "clsx";
import { useState, type CSSProperties } from "react";

/**
 * DuotoneImage — cianotipia autoral sobre os screenshots reais do repo.
 *
 * API (contrato, nao mude):
 *   <DuotoneImage
 *     src={string} alt={string}
 *     ratio={string}        // "16 / 10", "4 / 3" — vai direto no aspect-ratio
 *     sizes={string}        // media query de larguras para o next/image
 *     priority?={boolean}
 *     preset?={"light" | "dark"}   // default: "dark"
 *     interactive?={boolean}       // default: true
 *     className?={string}
 *   />
 *
 * A gravura e 100% CSS (classe `.duotone` em globals.css): base azul → imagem
 * dessaturada em `mix-blend-mode: screen` → creme em `multiply` → hachura
 * diagonal de 1.4px a cada 6px, a 35 graus. Nenhum PNG pre-processado, nenhum
 * canvas: o mesmo arquivo serve a versao gravada e a versao em cor real.
 *
 * DOIS PRESETS, calibrados na imagem real:
 *   `dark`  (padrao) contrast 1.28 / brightness 1.06 — screenshot de UI escura.
 *   `light`          contrast 1.05 / brightness 0.86 — screenshot de UI clara,
 *                    que estoura em `screen` com o preset padrao.
 *
 * INTERACAO: no desktop a cor real volta no hover (e no foco, para quem navega
 * por teclado); no mobile, onde hover nao existe, o botao `[ COR ]` logo abaixo
 * alterna o estado. E por isso que o toggle e um <button> de verdade e nao um
 * `:hover` puro — sem ele, metade dos visitantes nunca veria a foto original.
 *
 * `aspectRatio` inline reserva a altura antes de o primeiro byte da imagem
 * chegar → zero CLS, com ou sem `priority`.
 *
 * SE O DUOTONE SAIR LAVADO: o culpado e um contexto de empilhamento
 * intermediario (um ancestral com `filter`, `transform`, `opacity` < 1 ou
 * `will-change`), que quebra a mesclagem — nao a regra CSS. O
 * `isolation: isolate` do `.duotone` ja impede o caminho contrario, o blend
 * vazar para a pagina.
 */
export function DuotoneImage({
  src,
  alt,
  ratio,
  sizes,
  priority,
  preset = "dark",
  interactive = true,
  className,
}: {
  src: string;
  alt: string;
  ratio: string;
  sizes: string;
  priority?: boolean;
  preset?: "light" | "dark";
  interactive?: boolean;
  className?: string;
}) {
  const [on, setOn] = useState(false);
  const colorOn = interactive && on;

  const style = {
    aspectRatio: ratio,
    ...(preset === "light"
      ? { "--duo-contrast": "1.05", "--duo-bright": "0.86" }
      : {}),
  } as CSSProperties;

  return (
    <>
      <figure
        className={clsx("duotone overflow-hidden", className)}
        style={style}
        data-color={colorOn ? "on" : undefined}
        onMouseEnter={interactive ? () => setOn(true) : undefined}
        onMouseLeave={interactive ? () => setOn(false) : undefined}
        onFocus={interactive ? () => setOn(true) : undefined}
        onBlur={interactive ? () => setOn(false) : undefined}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover object-top"
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />
      </figure>
      {interactive && (
        <button
          type="button"
          aria-pressed={on}
          onClick={() => setOn((v) => !v)}
          className="mt-2 border border-current px-3 py-1.5 font-mono text-tag uppercase md:hidden"
        >
          {on ? "[ DUOTONE ]" : "[ COR ]"}
        </button>
      )}
    </>
  );
}
