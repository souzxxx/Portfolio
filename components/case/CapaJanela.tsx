"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Janela } from "../os/Janela";
import { Lupa, type ItemAmpliavel } from "../ui/Lupa";
import type { Dict } from "@/lib/dict";

export type Chapa = ItemAmpliavel & { w: number; h: number; indice: number };

/**
 * CapaJanela — a captura principal do case dentro de uma janela do souzxxx OS,
 * pousada na fronteira entre a mesa (carvão) e o papel.
 *
 * É cliente só por causa da <Lupa>: a janela, a imagem e a barra de status
 * saem inteiras no HTML do servidor. Quando o projeto tem captura de celular,
 * ela entra como uma SEGUNDA janela menor, sobreposta no canto — duas janelas
 * abertas na mesma mesa, o desktop e o celular lado a lado. Só a partir de
 * `md`: em 390 a janela pequena cobriria metade da grande, e a captura de
 * celular continua na galeria logo abaixo.
 *
 * As duas abrem a MESMA Lupa, cada uma no seu índice da galeria, então as
 * setas do dialogo percorrem todas as capturas do projeto a partir dali.
 */
export function CapaJanela({
  titulo,
  nome,
  capa,
  movel,
  itens,
  barra,
  ampliar,
  d,
}: {
  titulo: string;
  nome: string;
  capa: Chapa;
  movel?: Chapa | null;
  itens: ItemAmpliavel[];
  /** O texto da esquerda da barra de status ("6 capturas"). */
  barra: string;
  ampliar: string;
  d: Dict["lupa"];
}) {
  const [aberta, setAberta] = useState(false);
  const [indice, setIndice] = useState(0);

  function abrir(i: number) {
    setIndice(i);
    setAberta(true);
  }

  return (
    <div className="relative">
      <Janela
        titulo={titulo}
        sombra="breu"
        as="div"
        acessorio={
          <span aria-hidden className="tabular-nums">
            {String(capa.indice + 1).padStart(2, "0")}/
            {String(itens.length).padStart(2, "0")}
          </span>
        }
      >
        {/* Captura mais alta que 16:10 é recortada pelo topo: um dashboard
            quase quadrado viraria uma janela de 800px de altura no hero. A
            imagem inteira continua a um clique, na Lupa. */}
        <div
          className="relative w-full"
          style={{ aspectRatio: String(Math.max(capa.w / capa.h, 1.6)) }}
        >
          <Image
            src={capa.src}
            alt={`${nome} — ${capa.label}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1440px) 90vw, 76rem"
            className="object-cover object-top"
          />
          <button
            type="button"
            onClick={() => abrir(capa.indice)}
            aria-label={`${d.ampliarAria} ${capa.label}`}
            className="absolute inset-0 cursor-zoom-in focus-visible:outline-carvao focus-visible:-outline-offset-4"
          />
        </div>

        {/* Barra de status de janela de Finder: quantos itens há e o que o
            clique faz. Bitmap, como todo cromo do sistema. */}
        <div className="flex h-[26px] items-center gap-2 border-t border-carvao px-3 font-bitmap text-[10px] uppercase leading-none tracking-[0.08em]">
          <span>{barra}</span>
          {/* A dica fica colada na contagem, à esquerda: a janela do celular
              pousa sobre o canto direito desta barra. */}
          <span aria-hidden className="hidden text-ink-700 sm:inline">
            · {ampliar} ⤢
          </span>
        </div>
      </Janela>

      {movel ? (
        <div
          className={clsx(
            "absolute z-10 hidden md:block",
            "-bottom-[clamp(2rem,5vw,4.5rem)] right-[clamp(-1rem,-1.5vw,0rem)] w-[clamp(9rem,15vw,13.5rem)]",
          )}
        >
          <Janela titulo="390 px" sombra="carvao" as="div">
            <div
              className="relative w-full"
              style={{ aspectRatio: `${movel.w} / ${movel.h}` }}
            >
              <Image
                src={movel.src}
                alt={`${nome} — ${movel.label}`}
                fill
                sizes="14rem"
                className="object-cover object-top"
              />
              <button
                type="button"
                onClick={() => abrir(movel.indice)}
                aria-label={`${d.ampliarAria} ${movel.label}`}
                className="absolute inset-0 cursor-zoom-in focus-visible:outline-carvao focus-visible:-outline-offset-4"
              />
            </div>
          </Janela>
        </div>
      ) : null}

      <Lupa
        itens={itens}
        indice={indice}
        aberta={aberta}
        onFechar={() => setAberta(false)}
        onIndice={setIndice}
        titulo={nome}
        d={d}
      />
    </div>
  );
}
