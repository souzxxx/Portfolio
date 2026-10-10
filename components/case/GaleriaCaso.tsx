"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Janela } from "../os/Janela";
import { Lupa, type ItemAmpliavel } from "../ui/Lupa";
import type { Chapa } from "./CapaJanela";
import type { Dict } from "@/lib/dict";

/**
 * GaleriaCaso — as capturas do projeto como janelas empilhadas em duas colunas.
 *
 * Colunas CSS (`columns-2`) e não grid: cada captura entra na proporção DELA
 * (as dimensões vêm do cabeçalho do arquivo, lidas no servidor por
 * lib/dimensoes.ts), e o grid alinharia as linhas pela mais alta, deixando um
 * buraco embaixo de cada captura de desktop ao lado da de celular. Coluna de
 * jornal encaixa as alturas diferentes sem buraco nenhum.
 *
 * O título de cada janela é o NOME DO ARQUIVO — `construtora.webp` —, que é o
 * que o Finder mostraria; a legenda em prosa fica na barra de baixo, onde cabe
 * uma frase inteira. Captura em retrato não ocupa a largura toda da coluna:
 * com 2 colunas em 1440 ela sairia com ~1400px de altura.
 */
export function GaleriaCaso({
  nome,
  itens,
  mostrar,
  d,
}: {
  nome: string;
  /** Todas as capturas, na ordem do projeto — o que a Lupa percorre. */
  itens: ItemAmpliavel[];
  /** As que aparecem aqui (a capa já está no topo da página). */
  mostrar: Chapa[];
  d: Dict["lupa"];
}) {
  const [aberta, setAberta] = useState(false);
  const [indice, setIndice] = useState(0);

  return (
    <>
      <ul
        className={clsx(
          "gap-x-[clamp(1.5rem,3vw,2.5rem)]",
          mostrar.length > 1 && "md:columns-2",
        )}
      >
        {mostrar.map((chapa) => {
          const retrato = chapa.h > chapa.w;
          const arquivo = chapa.src.split("/").pop() ?? chapa.src;
          return (
            <li
              key={chapa.src}
              className="mb-[clamp(1.5rem,3vw,2.5rem)] break-inside-avoid pb-1 pr-1"
            >
              <Janela
                titulo={arquivo}
                as="div"
                className={clsx(retrato && "mx-auto max-w-[19rem]")}
                acessorio={
                  <span aria-hidden className="tabular-nums">
                    {String(chapa.indice + 1).padStart(2, "0")}
                  </span>
                }
              >
                <button
                  type="button"
                  onClick={() => {
                    setIndice(chapa.indice);
                    setAberta(true);
                  }}
                  aria-label={`${d.ampliarAria} ${chapa.label}`}
                  className="group relative block w-full cursor-zoom-in overflow-hidden focus-visible:outline-carvao focus-visible:-outline-offset-4"
                  style={{ aspectRatio: `${chapa.w} / ${chapa.h}` }}
                >
                  <Image
                    src={chapa.src}
                    alt=""
                    fill
                    sizes={
                      retrato
                        ? "19rem"
                        : "(max-width: 768px) 100vw, (max-width: 1440px) 45vw, 42rem"
                    }
                    className="object-cover object-top motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.015]"
                  />
                </button>
                <p className="border-t border-carvao px-3 py-2 font-mono text-[0.75rem] leading-snug text-ink-600">
                  {chapa.label}
                </p>
              </Janela>
            </li>
          );
        })}
      </ul>

      <Lupa
        itens={itens}
        indice={indice}
        aberta={aberta}
        onFechar={() => setAberta(false)}
        onIndice={setIndice}
        titulo={nome}
        d={d}
      />
    </>
  );
}
