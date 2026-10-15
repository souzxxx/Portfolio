import type { Expressao } from "./maquina";

/**
 * A tela do Mac do pet: uma grade de 16×12 pixels 1-bit.
 *
 * É a mesma ideia do PixelIcon: o desenho é DADO, não imagem. Cada expressão é
 * uma função pura que diz quais pixels estão acesos (carvão) sobre o creme da
 * tela, e a PetCena só copia essa grade para uma textura de 16×12 com filtro
 * Nearest. Assim o rosto continua nítido em qualquer DPR e a lógica de olhar
 * é testável sem WebGL.
 *
 * O olhar anda em DEGRAUS INTEIROS de pixel (±2 em x, ±1 em y). Meio pixel não
 * existe numa tela 1-bit, e arredondar aqui evita que a textura seja
 * redesenhada a cada movimento de mouse que não muda nada na tela.
 */
export const COLUNAS = 16;
export const LINHAS = 12;

/** `[linha][coluna]`; `true` é pixel carvão. */
export type Grade = boolean[][];

const OLHO_ESQ = 5;
const OLHO_DIR = 10;
const OLHO_LINHA = 4;
const BOCA_LINHA = 8;

const limitar = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** `+ 0` normaliza o -0 que `Math.round(-0.2)` devolve. */
export function olharEmPixels(olhar: { x: number; y: number }) {
  return {
    dx: Math.round(limitar(olhar.x, -1, 1) * 2) + 0,
    dy: Math.round(limitar(olhar.y, -1, 1) * 1) + 0,
  };
}

function vazia(): Grade {
  return Array.from({ length: LINHAS }, () =>
    Array<boolean>(COLUNAS).fill(false),
  );
}

function bloco(g: Grade, col: number, lin: number, w: number, h: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const l = lin + y;
      const c = col + x;
      if (l >= 0 && l < LINHAS && c >= 0 && c < COLUNAS) g[l][c] = true;
    }
  }
}

/** Um "z" de 3×3: topo, diagonal pelo centro, base. */
const Z: [number, number][] = [
  [0, 0], [1, 0], [2, 0],
  [1, 1],
  [0, 2], [1, 2], [2, 2],
];

export function desenharGrade(
  expressao: Expressao,
  olhar: { x: number; y: number },
  zFase: number,
): Grade {
  const g = vazia();
  const { dx, dy } = olharEmPixels(olhar);
  const bocaX = Math.round(dx / 2);

  switch (expressao) {
    case "normal":
      bloco(g, OLHO_ESQ - 1 + dx, OLHO_LINHA - 1 + dy, 2, 2);
      bloco(g, OLHO_DIR - 1 + dx, OLHO_LINHA - 1 + dy, 2, 2);
      bloco(g, 6 + bocaX, BOCA_LINHA, 4, 1);
      break;
    case "piscando":
      bloco(g, OLHO_ESQ - 1 + dx, OLHO_LINHA + dy, 2, 1);
      bloco(g, OLHO_DIR - 1 + dx, OLHO_LINHA + dy, 2, 1);
      bloco(g, 6 + bocaX, BOCA_LINHA, 4, 1);
      break;
    case "atento":
      bloco(g, OLHO_ESQ - 1 + dx, OLHO_LINHA - 1 + dy, 3, 3);
      bloco(g, OLHO_DIR - 1 + dx, OLHO_LINHA - 1 + dy, 3, 3);
      bloco(g, 6 + bocaX, BOCA_LINHA, 4, 1);
      break;
    case "surpreso":
      bloco(g, OLHO_ESQ - 1 + dx, OLHO_LINHA - 1 + dy, 3, 3);
      bloco(g, OLHO_DIR - 1 + dx, OLHO_LINHA - 1 + dy, 3, 3);
      bloco(g, 7 + bocaX, BOCA_LINHA, 2, 2);
      break;
    case "dormindo": {
      bloco(g, OLHO_ESQ - 1, OLHO_LINHA, 2, 1);
      bloco(g, OLHO_DIR - 1, OLHO_LINHA, 2, 1);
      bloco(g, 7, BOCA_LINHA, 2, 1);
      const zLinha = 6 - (((zFase % 6) + 6) % 6);
      for (const [x, y] of Z) bloco(g, 12 + x, zLinha + y, 1, 1);
      break;
    }
  }
  return g;
}

/** Assinatura da grade, para a PetCena só redesenhar a textura quando muda. */
export function chaveDaGrade(g: Grade): string {
  return g.map((l) => l.map((b) => (b ? "1" : "0")).join("")).join("/");
}
