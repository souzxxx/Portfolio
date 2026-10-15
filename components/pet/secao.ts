"use client";

import { useEffect, useState } from "react";
import type { ChaveDica } from "@/lib/dict";

/**
 * De onde a dica do balão vem.
 *
 * Fora da home a resposta é a ROTA (case ou erro). Na home é a seção que mais
 * ocupa a janela agora — medida em pixels visíveis (`intersectionRect.height`),
 * não em razão: uma seção alta com 30% na tela pode estar ocupando mais tela
 * que uma baixa com 100%.
 */
export type Rota = "home" | "caso" | "cv" | "erro";

/**
 * As seções da home que o observer mede. "top" NÃO entra: `#top` é o wrapper
 * da página inteira (Home.tsx), mais alto que qualquer seção, e venceria
 * sempre. "top" é o que sobra — nenhuma destas visível = o visitante está na
 * mesa, acima de #projects.
 */
export const SECOES_DA_HOME: readonly ChaveDica[] = [
  "projects",
  "more",
  "atividade",
  "academic",
  "stack",
  "about",
];

export function rotaDoPet(pathname: string): Rota {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/" || p === "/en") return "home";
  if (p === "/cv" || p === "/en/cv") return "cv";
  if (/^\/(projetos|en\/projects)\/[^/]+$/.test(p)) return "caso";
  return "erro";
}

/**
 * A seção com mais pixels visíveis; "top" quando nenhuma tem altura > 0.
 * Alturas abaixo de `minimo` não contam: uma faixa fina de #projects no pé da
 * mesa não deve roubar a dica dela. Pura, para o teste: o hook só alimenta o mapa.
 */
export function escolherSecao(
  visivel: ReadonlyMap<string, number>,
  minimo = 0,
): ChaveDica {
  let melhor: ChaveDica = "top";
  let maior = 0;
  for (const [id, altura] of visivel) {
    if (altura < minimo) continue;
    if (altura > maior) {
      maior = altura;
      melhor = id as ChaveDica;
    }
  }
  return melhor;
}

const LIMIARES = Array.from({ length: 21 }, (_, i) => i / 20);

export function useSecaoAtual(pathname: string): ChaveDica {
  const rota = rotaDoPet(pathname);
  const [secao, setSecao] = useState<ChaveDica>("top");

  useEffect(() => {
    if (rota !== "home") return;
    const visivel = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          visivel.set(e.target.id, e.isIntersecting ? e.intersectionRect.height : 0);
        }
        // 20% da janela, lido a cada callback para acompanhar um resize.
        setSecao(escolherSecao(visivel, window.innerHeight * 0.2));
      },
      { threshold: LIMIARES },
    );
    for (const id of SECOES_DA_HOME) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [rota]);

  if (rota === "caso") return "caso";
  if (rota === "home") return secao;
  return "erro";
}
