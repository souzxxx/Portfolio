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

export const SECOES_DA_HOME: readonly ChaveDica[] = [
  "top",
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
        let melhor: string | null = null;
        let maior = 0;
        for (const [id, altura] of visivel) {
          if (altura > maior) {
            maior = altura;
            melhor = id;
          }
        }
        if (melhor) setSecao(melhor as ChaveDica);
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
