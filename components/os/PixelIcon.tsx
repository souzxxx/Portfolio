import clsx from "clsx";

/**
 * PixelIcon — os ícones do souzxxx OS, desenhados à mão em grade 16×16.
 *
 * Cada ícone é um mapa de caracteres, uma string por linha:
 *   "#"  tinta  → `currentColor` (carvão sobre papel, creme sobre carvão)
 *   "o"  miolo  → `--icon-fill` (default: o papel creme)
 *   " "  vazio  → transparente
 *
 * Renderizado como UM <path> por cor, com uma corrida horizontal por retângulo
 * e `shape-rendering: crispEdges`: em 32px ou 48px os pixels caem inteiros no
 * pixel físico e o ícone não borra, que é a razão de não usar PNG nem fonte.
 * Sem imagem externa, sem request, sem marca de terceiro.
 */
const ICONES = {
  pasta: [
    "                ",
    "                ",
    " ####           ",
    "#oooo#          ",
    "############### ",
    "#ooooooooooooo# ",
    "#ooooooooooooo# ",
    "#ooooooooooooo# ",
    "#ooooooooooooo# ",
    "#ooooooooooooo# ",
    "#ooooooooooooo# ",
    "#ooooooooooooo# ",
    "#ooooooooooooo# ",
    "############### ",
    "                ",
    "                ",
  ],
  documento: [
    "                ",
    "  #########     ",
    "  #ooooooo##    ",
    "  #ooooooo#o#   ",
    "  #ooooooo####  ",
    "  #oooooooooo#  ",
    "  #o#######oo#  ",
    "  #oooooooooo#  ",
    "  #o#####oooo#  ",
    "  #oooooooooo#  ",
    "  #o########o#  ",
    "  #oooooooooo#  ",
    "  #o######ooo#  ",
    "  #oooooooooo#  ",
    "  ############  ",
    "                ",
  ],
  terminal: [
    "                ",
    " ############## ",
    " #oooooooooooo# ",
    " #o##########o# ",
    " #o#o########o# ",
    " #o##o#######o# ",
    " #o#o##ooo###o# ",
    " #o##########o# ",
    " #o##########o# ",
    " #oooooooooooo# ",
    " ############## ",
    "      ####      ",
    "    ########    ",
    "    #oooooo#    ",
    "    ########    ",
    "                ",
  ],
  lixeira: [
    "                ",
    "      ####      ",
    "  ############  ",
    "  #oooooooooo#  ",
    "  ############  ",
    "   #oo#oo#oo#   ",
    "   #oo#oo#oo#   ",
    "   #oo#oo#oo#   ",
    "   #oo#oo#oo#   ",
    "   #oo#oo#oo#   ",
    "   #oo#oo#oo#   ",
    "   #oo#oo#oo#   ",
    "   #oo#oo#oo#   ",
    "   ##########   ",
    "                ",
    "                ",
  ],
  predio: [
    "                ",
    "    ########    ",
    "    #oooooo#    ",
    "    #o#oo#o#    ",
    "    #oooooo#    ",
    "    #o#oo#o#    ",
    "    #oooooo#### ",
    "    #o#oo#o#oo# ",
    "    #oooooo#oo# ",
    "    #o#oo#o#oo# ",
    "    #oooooo#oo# ",
    "    #oo##oo#oo# ",
    "    #oo##oo#oo# ",
    "################",
    "                ",
    "                ",
  ],
  grafico: [
    "                ",
    "################",
    "#oooooooooooooo#",
    "#ooooooooooo#oo#",
    "#ooooooooooo#oo#",
    "#oooooooo#oo#oo#",
    "#oooooooo#oo#oo#",
    "#ooooo#oo#oo#oo#",
    "#ooooo#oo#oo#oo#",
    "#oo#oo#oo#oo#oo#",
    "#oo#oo#oo#oo#oo#",
    "#oooooooooooooo#",
    "################",
    "                ",
    "                ",
    "                ",
  ],
  casa: [
    "                ",
    "       ##       ",
    "      #oo#      ",
    "     #oooo#     ",
    "    #oooooo#    ",
    "   #oooooooo#   ",
    "  #oooooooooo#  ",
    " ############## ",
    "  #oooooooooo#  ",
    "  #o##ooo##oo#  ",
    "  #o##ooo##oo#  ",
    "  #oooooo##oo#  ",
    "  #oooooo##oo#  ",
    "  ############  ",
    "                ",
    "                ",
  ],
  carta: [
    "                ",
    "                ",
    "                ",
    "################",
    "##oooooooooooo##",
    "#o#oooooooooo#o#",
    "#oo#oooooooo#oo#",
    "#ooo#oooooo#ooo#",
    "#oooo##oo##oooo#",
    "#oooooo##oooooo#",
    "#oooooooooooooo#",
    "#oooooooooooooo#",
    "################",
    "                ",
    "                ",
    "                ",
  ],
  disquete: [
    "                ",
    " ############## ",
    " #oo######oo#o# ",
    " #oo####o#oo#o# ",
    " #oo####o#oo#o# ",
    " #oo######oo#o# ",
    " #oooooooooooo# ",
    " #o##########o# ",
    " #o#oooooooo#o# ",
    " #o#o#####oo#o# ",
    " #o#oooooooo#o# ",
    " #o#o####ooo#o# ",
    " #o#oooooooo#o# ",
    " ############## ",
    "                ",
    "                ",
  ],
  computador: [
    "  ############  ",
    "  #oooooooooo#  ",
    "  #o########o#  ",
    "  #o#oooooo#o#  ",
    "  #o#o#oo#o#o#  ",
    "  #o#oooooo#o#  ",
    "  #o##oooo##o#  ",
    "  #o#o####o#o#  ",
    "  #o########o#  ",
    "  #oooooooooo#  ",
    "  #oo####oooo#  ",
    "  #oooooooooo#  ",
    "  ############  ",
    "   ##########   ",
    "  ############  ",
    "                ",
  ],
  globo: [
    "                ",
    "     ######     ",
    "   ##o#oo#o##   ",
    "  #oo#oooo#oo#  ",
    " #############  ",
    " #oo#oooooo#oo# ",
    " #oo#oooooo#oo# ",
    " ############## ",
    " #oo#oooooo#oo# ",
    " #oo#oooooo#oo# ",
    " ############## ",
    "  #oo#oooo#oo#  ",
    "   ##o#oo#o##   ",
    "     ######     ",
    "                ",
    "                ",
  ],
  bomba: [
    "                ",
    "           # #  ",
    "          # #   ",
    "         #   #  ",
    "        ##      ",
    "      ######    ",
    "    ##########  ",
    "   #oo########  ",
    "  #oo#########  ",
    "  #o##########  ",
    "  ############  ",
    "  ############  ",
    "   ##########   ",
    "    ########    ",
    "      ####      ",
    "                ",
  ],
} as const;

export type NomeIcone = keyof typeof ICONES;

/** Junta as corridas de um caractere numa string de path SVG. */
function caminho(linhas: readonly string[], c: string): string {
  let d = "";
  linhas.forEach((linha, y) => {
    let x = 0;
    while (x < linha.length) {
      if (linha[x] !== c) {
        x++;
        continue;
      }
      const inicio = x;
      while (x < linha.length && linha[x] === c) x++;
      d += `M${inicio} ${y}h${x - inicio}v1h-${x - inicio}z`;
    }
  });
  return d;
}

// Os paths são calculados uma vez, no carregamento do módulo — o ícone é
// estático e a mesma string serve a todas as instâncias.
const PATHS = Object.fromEntries(
  Object.entries(ICONES).map(([nome, linhas]) => [
    nome,
    { tinta: caminho(linhas, "#"), miolo: caminho(linhas, "o") },
  ]),
) as Record<NomeIcone, { tinta: string; miolo: string }>;

/** Os dois paths de um ícone, para quem desenha fora do DOM (o cartão OG). */
export function pixelPaths(nome: NomeIcone) {
  return PATHS[nome];
}

export function PixelIcon({
  nome,
  tamanho = 32,
  className,
}: {
  nome: NomeIcone;
  tamanho?: number;
  className?: string;
}) {
  const p = PATHS[nome];
  return (
    <svg
      aria-hidden
      width={tamanho}
      height={tamanho}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={clsx("shrink-0", className)}
    >
      <path d={p.miolo} fill="var(--icon-fill, #F5F3EE)" />
      <path d={p.tinta} fill="currentColor" />
    </svg>
  );
}
