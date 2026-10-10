import type { CSSProperties } from "react";

/**
 * As tramas 1-bit do souzxxx OS — os "tons de cinza" de quem só tem duas cores.
 *
 * O Macintosh de 1984 não tinha cinza: tinha padrão. Aqui é igual — carvão
 * sobre papel, em ladrilhos SVG minúsculos (2×2, 4×4) desenhados pixel a pixel
 * e repetidos com `image-rendering: pixelated`, para o padrão cair inteiro no
 * pixel físico. Gradiente CSS borraria: o radial-gradient da `.mesa` funciona
 * porque é textura difusa; aqui a trama é INFORMAÇÃO (separa categorias, marca
 * o semestre em curso), então precisa ser nítida.
 *
 * Estilo inline e não classe do Tailwind: um `url("data:…")` dentro de uma
 * classe arbitrária exige escapar aspas e vírgulas no JIT, e o resultado vira
 * uma classe ilegível de 200 caracteres. Um objeto de estilo é só um objeto.
 */
const CARVAO = "%231C1A17";

function ladrilho(lado: number, pixels: [number, number][]): CSSProperties {
  const rects = pixels
    .map(([x, y]) => `<rect x='${x}' y='${y}' width='1' height='1'/>`)
    .join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${lado}' height='${lado}' shape-rendering='crispEdges' fill='${CARVAO}'>${rects}</svg>`;
  return {
    backgroundImage: `url("data:image/svg+xml;utf8,${svg}")`,
    backgroundSize: `${lado}px ${lado}px`,
    imageRendering: "pixelated",
  };
}

export type NomePadrao = "cheio" | "xadrez" | "diagonal" | "linhas" | "pontos";

export const PADROES: Record<NomePadrao, CSSProperties> = {
  cheio: { backgroundColor: "#1C1A17" },
  xadrez: ladrilho(2, [
    [0, 0],
    [1, 1],
  ]),
  diagonal: ladrilho(4, [
    [3, 0],
    [2, 1],
    [1, 2],
    [0, 3],
  ]),
  linhas: ladrilho(3, [
    [0, 0],
    [1, 0],
    [2, 0],
  ]),
  pontos: ladrilho(4, [
    [0, 0],
    [2, 2],
  ]),
};
