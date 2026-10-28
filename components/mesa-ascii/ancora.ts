import { OLHOS_UV } from "./silhueta";

/**
 * Onde o Mac gigante fica na mesa, a partir dos retângulos medidos das janelas.
 *
 * O requisito da spec (3.3): em repouso, os dois olhos ficam inteiros à
 * vista, sem janela por cima, em todos os tamanhos de tela. O protótipo
 * centrava o Mac em 62% da largura, o que põe o rosto no vão entre o LEIA-ME
 * e o RENDER nas telas largas; em 1024 px esse vão tem só uns 12 px. Então a
 * âncora MIRA O ROSTO: escolhe primeiro onde os olhos ficam livres e só
 * depois desloca o Mac para os olhos caírem ali.
 *
 *   1. No vão LEIA-ME | RENDER, se ele cabe os dois olhos com folga.
 *   2. Senão, na faixa livre entre o RENDER e o TERMINAL (a escadinha da
 *      Task 1 deixa essa faixa de propósito). Se a faixa é baixa demais, o
 *      Mac encolhe 5% por vez até os olhos caberem ou ele chegar a
 *      ALTURA_MIN. Se nem nela os olhos cabem, o último passo fica até 5%
 *      abaixo de ALTURA_MIN e os olhos encostam nas janelas.
 *
 * Pura, sem DOM: quem mede as janelas é o componente.
 */
export interface Ret {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Ancora {
  /** x do eixo do Mac (u = 0), em px da mesa. */
  cx: number;
  /** y onde o pé encosta na mesa (v = 0.43). */
  baseY: number;
  /** Altura do Mac em px: a unidade de u e v (o Hm do protótipo). */
  altura: number;
}

/** O Mac ocupa 78% da altura da mesa, como no protótipo. */
export const ALTURA_MAC = 0.78;
/** Menor que isso e ele deixa de ser "gigante atrás das janelas". */
export const ALTURA_MIN = 0.55;
/** Respiro, em px, entre os olhos e a janela mais próxima. */
export const FOLGA_OLHOS = 8;

/** O v da base do pé (a última linha da região `pe` de `regiaoEm`). */
const V_BASE = 0.43;
/** Encolhe 5% por passo até os olhos caberem na faixa. */
const PASSO_ENCOLHE = 0.95;

/** Centro dos dois olhos juntos, em (u, v): o ponto que a âncora mira. */
const U_OLHOS = (OLHOS_UV.esq.u0 + OLHOS_UV.dir.u1) / 2;
const V_OLHOS = (OLHOS_UV.v0 + OLHOS_UV.v1) / 2;

/** Os retângulos dos olhos `normal`, olhando para a frente, em px da mesa. */
export function olhosEmRepouso(a: Ancora): { esq: Ret; dir: Ret } {
  const y = a.baseY + (OLHOS_UV.v0 - V_BASE) * a.altura;
  const h = (OLHOS_UV.v1 - OLHOS_UV.v0) * a.altura;
  const olho = ({ u0, u1 }: { u0: number; u1: number }): Ret => ({
    x: a.cx + u0 * a.altura,
    y,
    w: (u1 - u0) * a.altura,
    h,
  });
  return { esq: olho(OLHOS_UV.esq), dir: olho(OLHOS_UV.dir) };
}

export function ancorarMac(
  mesa: { w: number; h: number },
  j: { leiame: Ret; render: Ret; terminal: Ret },
): Ancora {
  const { leiame, render, terminal } = j;
  let altura = ALTURA_MAC * mesa.h;
  const olhosW = (OLHOS_UV.dir.u1 - OLHOS_UV.esq.u0) * altura;
  const olhosH = (h: number) => (OLHOS_UV.v1 - OLHOS_UV.v0) * h;

  const vaoX0 = leiame.x + leiame.w;
  const vaoX1 = render.x;
  let ex: number;
  let ey: number;
  if (vaoX1 - vaoX0 >= olhosW + 2 * FOLGA_OLHOS) {
    // rosto no vão LEIA-ME | RENDER, na altura do meio do RENDER
    ex = (vaoX0 + vaoX1) / 2;
    ey = render.y + 0.45 * render.h;
  } else {
    // rosto na faixa RENDER / TERMINAL. Aqui quem aperta é a altura: a faixa
    // vai do LEIA-ME à borda direita da coluna, bem mais larga que os olhos
    const fy0 = render.y + render.h;
    const fy1 = terminal.y;
    while (olhosH(altura) + 2 * FOLGA_OLHOS > fy1 - fy0 && altura > ALTURA_MIN * mesa.h) {
      altura *= PASSO_ENCOLHE;
    }
    ex = (vaoX0 + Math.max(render.x + render.w, terminal.x + terminal.w)) / 2;
    ey = (fy0 + fy1) / 2;
  }

  // desloca o Mac para o centro dos olhos cair em (ex, ey)
  return {
    cx: ex - U_OLHOS * altura,
    baseY: ey + (V_BASE - V_OLHOS) * altura,
    altura,
  };
}
