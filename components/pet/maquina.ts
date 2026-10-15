/**
 * A máquina de expressões do pet. Pura: recebe a expressão atual e um evento,
 * devolve a próxima. Os TIMERS (quando piscar, quando dormir) moram em
 * usePetEventos.ts; aqui só mora a regra, para ela ser testável sem relógio.
 *
 * Regra de ouro: um evento que não muda a expressão devolve a MESMA expressão.
 * Quem chama usa isso para não repetir efeito colateral — é o que impede, por
 * exemplo, uma segunda `inatividade` de armar um segundo intervalo de "z".
 */
export type Expressao = "normal" | "piscando" | "atento" | "dormindo" | "surpreso";

export type EventoPet =
  | { tipo: "atividade" }
  | { tipo: "inatividade" }
  | { tipo: "hover"; ativo: boolean }
  | { tipo: "piscar" }
  | { tipo: "fimPiscar" }
  | { tipo: "fimSurpresa" };

export const SONO_MS = 20_000;
export const PISCADA_MS = 120;
export const SURPRESA_MS = 600;
export const Z_PASSO_MS = 500;

export function transicao(atual: Expressao, ev: EventoPet): Expressao {
  switch (ev.tipo) {
    case "inatividade":
      return "dormindo";
    case "atividade":
      return atual === "dormindo" ? "surpreso" : atual;
    case "fimSurpresa":
      return atual === "surpreso" ? "normal" : atual;
    case "hover":
      if (ev.ativo) return atual === "dormindo" ? atual : "atento";
      return atual === "atento" ? "normal" : atual;
    case "piscar":
      return atual === "normal" ? "piscando" : atual;
    case "fimPiscar":
      return atual === "piscando" ? "normal" : atual;
  }
}

/** `sorteio` em [0, 1) → 3000–7000 ms. Fora do intervalo, é limitado. */
export function intervaloPiscada(sorteio: number): number {
  const s = Math.min(1, Math.max(0, sorteio));
  return 3000 + s * 4000;
}
