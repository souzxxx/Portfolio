/**
 * A grade de células do Mac em ASCII: o "papel quadriculado" da mesa.
 *
 * A mesa inteira vira células de 9×11 px CSS, como no daoho.dev. Cada célula
 * guarda um glifo, o alfa desse glifo, o alfa de um preenchimento creme (o
 * retângulo que deixa a grade aparecer) e a cor. Tudo em arrays tipados
 * achatados (`j * cols + i`), não em objetos por célula: a cena reescreve
 * milhares de células a cada quadro, e quatro arrays reaproveitados não geram
 * lixo para o coletor no meio da animação.
 *
 * Quem desenha (a cena, as ondas) só escreve aqui; quem pinta o canvas só lê.
 * Assim a lógica de cada quadro é testável sem canvas.
 */
export const CELULA_L = 9;
export const CELULA_A = 11;

/** Cores possíveis de uma célula. O dourado é só para o selo. */
export const COR_CREME = 0;
export const COR_OURO = 1;

/** Glifos que contam como "célula vazia" para quem pinta por cima. */
const NADA = 0;
const ESPACO = 32;

export interface Quadro {
  cols: number;
  linhas: number;
  /** Código do caractere; 0 é célula nunca pintada. */
  glifo: Uint16Array;
  alfa: Float32Array;
  /** Alfa do preenchimento creme da célula. */
  fundo: Float32Array;
  cor: Uint8Array;
}

/** Arredonda para cima: a última coluna/linha parcial também é desenhada. */
export function criarQuadro(largura: number, altura: number): Quadro {
  const cols = Math.ceil(largura / CELULA_L);
  const linhas = Math.ceil(altura / CELULA_A);
  const n = cols * linhas;
  return {
    cols,
    linhas,
    glifo: new Uint16Array(n),
    alfa: new Float32Array(n),
    fundo: new Float32Array(n),
    cor: new Uint8Array(n),
  };
}

export function limparQuadro(q: Quadro): void {
  q.glifo.fill(0);
  q.alfa.fill(0);
  q.fundo.fill(0);
  q.cor.fill(0);
}

/**
 * Checa coluna e linha separadas: só o índice linear deixaria `i = cols`
 * escorregar para o começo da linha de baixo.
 */
function indice(q: Quadro, i: number, j: number): number {
  if (i < 0 || j < 0 || i >= q.cols || j >= q.linhas) return -1;
  return j * q.cols + i;
}

/** Escreve a célula inteira, sempre por cima. Fora da grade é ignorado. */
export function pintar(
  q: Quadro,
  i: number,
  j: number,
  glifo: string,
  alfa: number,
  fundo = 0,
  cor = COR_CREME,
): void {
  const id = indice(q, i, j);
  if (id < 0) return;
  q.glifo[id] = glifo.charCodeAt(0);
  q.alfa[id] = alfa;
  q.fundo[id] = fundo;
  q.cor[id] = cor;
}

/**
 * Escreve só glifo e alfa, e só se ganha da célula: ela está vazia (nunca
 * pintada ou espaço) ou tem um glifo mais fraco. É como as ondas passam por
 * cima do Mac sem apagar o contorno `#`, e o fundo e a cor da célula ficam,
 * então a onda atravessa um pixel aceso da tela sem apagá-lo.
 */
export function pintarSeMaisForte(
  q: Quadro,
  i: number,
  j: number,
  glifo: string,
  alfa: number,
): void {
  const id = indice(q, i, j);
  if (id < 0) return;
  const atual = q.glifo[id];
  if (q.alfa[id] >= alfa && atual !== NADA && atual !== ESPACO) return;
  q.glifo[id] = glifo.charCodeAt(0);
  q.alfa[id] = alfa;
}
