"use client";

import { useState, type ReactNode } from "react";

/**
 * LeituraDoMapa — a barra de status do heatmap: passa o cursor num bloco e ela
 * diz o dia e quantas contribuições houve nele.
 *
 * A GRADE NÃO MORA AQUI. Ela chega pronta do servidor como `children`, e cada
 * bloco carrega o próprio dado em `data-d` (dia) e `data-n` (contagem). Este
 * componente só escuta `pointerover` no contêiner e lê o atributo do alvo —
 * delegação de evento, um listener para 371 blocos. Assim os dias não viajam
 * duas vezes (no HTML e de novo como prop no payload do RSC), e o idioma
 * chega como uma fatia de rótulos, nunca como o `dict` inteiro.
 *
 * É ornamento, não conteúdo: o total, a maior sequência e o melhor dia estão
 * escritos por extenso logo abaixo, no HTML do servidor. Por isso a leitura é
 * `aria-hidden` e os blocos não entram na ordem de tabulação — 371 paradas de
 * Tab para ler um número por vez seria hostil a quem navega por teclado.
 */
export function LeituraDoMapa({
  children,
  legenda,
  rotulos,
}: {
  children: ReactNode;
  legenda: ReactNode;
  rotulos: {
    vazia: string;
    contribuicao: [string, string];
    locale: string;
  };
}) {
  const [leitura, setLeitura] = useState<string | null>(null);

  function ler(alvo: EventTarget | null) {
    const el = alvo instanceof HTMLElement ? alvo : null;
    const dia = el?.dataset.d;
    if (!dia) return;
    const n = Number(el.dataset.n) || 0;
    const data = new Intl.DateTimeFormat(rotulos.locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${dia}T00:00:00Z`));
    const palavra = rotulos.contribuicao[n === 1 ? 0 : 1];
    setLeitura(`${data.replace(/\./g, "")} · ${n} ${palavra}`);
  }

  return (
    <div>
      <div
        onPointerOver={(e) => ler(e.target)}
        onPointerLeave={() => setLeitura(null)}
      >
        {children}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-dashed border-cream/25 pt-4">
        <p
          aria-hidden
          className="min-h-[1em] font-bitmap [@media(pointer:coarse)]:invisible text-[10px] uppercase leading-none tracking-[0.08em] text-cream-600"
        >
          {leitura ?? rotulos.vazia}
        </p>
        {legenda}
      </div>
    </div>
  );
}
