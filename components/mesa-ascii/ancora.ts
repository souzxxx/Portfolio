import { OLHOS_UV } from "./silhueta";

/**
 * Onde o Mac gigante fica na mesa, a partir dos retângulos medidos das janelas.
 *
 * Dois requisitos:
 *   - (spec 3.3) em repouso, os dois olhos ficam inteiros à vista, sem
 *     janela por cima, em todos os tamanhos de tela. "Em repouso" inclui o
 *     balanço e a respiração, que mexem o rosto mesmo sem mouse;
 *   - o Mac inteiro cabe na mesa: o topo do tampo, até no auge do pulo, fica
 *     abaixo da MenuBar fixa, e a sombra não passa do fim da mesa.
 *
 * O protótipo centrava o Mac em 62% da largura, o que põe o rosto no vão
 * entre o LEIA-ME e o RENDER nas telas largas; em 1024 px esse vão tem só uns
 * 12 px. Então a âncora MIRA O ROSTO: escolhe primeiro onde os olhos ficam
 * livres e só depois desloca o Mac para os olhos caírem ali.
 *
 *   1. No vão LEIA-ME | RENDER, se ele cabe os dois olhos com folga e
 *      balanço, entre o topo do RENDER e o topo do TERMINAL (que avança para
 *      a esquerda e entra no vão por baixo).
 *   2. Senão, na faixa livre entre o RENDER e o TERMINAL (a escadinha da
 *      Task 1 deixa essa faixa de propósito).
 *   Em cada lugar, o Mac tenta do tamanho cheio (ALTURA_MAC) para baixo, 5%
 *   por vez, até ALTURA_MIN exata, e fica com o primeiro tamanho em que o
 *   rosto cabe E o Mac inteiro cabe na mesa.
 *   3. Se nada disso cabe, é o melhor possível: a faixa, em ALTURA_MIN, com
 *      o Mac inteiro na mesa, mas os olhos podem encostar nas janelas.
 *
 * A altura nunca fica abaixo de ALTURA_MIN. Pura, sem DOM: quem mede as
 * janelas é o componente.
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
/** Respiro, em px, entre os olhos e a janela mais próxima, além do balanço. */
export const FOLGA_OLHOS = 8;

/**
 * Altura do pulo, em alturas do Mac. O protótipo pulava H·0.07 (da mesa);
 * medir no Mac mantém o pulo proporcional quando a âncora o encolhe.
 */
export const SALTO_MAC = 0.09;
/**
 * Amplitude do balanço parado (a inclinação). Cada ponto anda (v − 0.43)·0.035
 * alturas na horizontal: quanto mais alto no Mac, mais ele balança. O mouse
 * soma uma inclinação própria, que não conta em repouso.
 */
export const INCLINA_MAC = 0.035;
/**
 * Amplitude da respiração na escala vertical: o Mac estica e encolhe 1,8% a
 * partir da base, então o rosto sobe e desce.
 */
export const RESPIRA_MAC = 0.018;
/** A MenuBar fixa cobre os 28 px de cima da mesa. */
export const MARGEM_TOPO = 28;

/** O v da base do pé (a última linha da região `pe` de `regiaoEm`). */
const V_BASE = 0.43;
/**
 * Do topo do tampo até a base, em alturas. O tampo sobe até
 * v = −0.46 − 0.6·lado e o lado chega a 0.15, então o topo fica em v = −0.55,
 * 0.98 acima da base; com a respiração (×1.018), um fio abaixo de 1.
 */
const TOPO_ACIMA_DA_BASE = 1;
/** A sombra: centro 0.01 abaixo da base e raio vertical 0.03. */
const SOMBRA_ABAIXO_DA_BASE = 0.04;
/** Cada tentativa encolhe 5%. */
const PASSO_ENCOLHE = 0.95;

/** Centro dos dois olhos juntos, em (u, v): o ponto que a âncora mira. */
const U_OLHOS = (OLHOS_UV.esq.u0 + OLHOS_UV.dir.u1) / 2;
const V_OLHOS = (OLHOS_UV.v0 + OLHOS_UV.v1) / 2;
/** Do centro dos olhos até a base, em alturas (0.675): o braço do balanço. */
const OLHOS_ACIMA_DA_BASE = V_BASE - V_OLHOS;
/** Os dois olhos juntos, do canto do esquerdo ao canto do direito. */
const OLHOS_L = OLHOS_UV.dir.u1 - OLHOS_UV.esq.u0;
const OLHOS_A = OLHOS_UV.v1 - OLHOS_UV.v0;

interface Intervalo {
  de: number;
  ate: number;
}

const cruzar = (a: Intervalo, b: Intervalo): Intervalo => ({
  de: Math.max(a.de, b.de),
  ate: Math.min(a.ate, b.ate),
});

/** Com intervalo vazio (de > ate), vale o `ate`: a sombra na mesa vence. */
const prender = (x: number, i: Intervalo) => Math.min(i.ate, Math.max(i.de, x));

/** Os retângulos dos olhos `normal`, olhando para a frente, em px da mesa. */
export function olhosEmRepouso(a: Ancora): { esq: Ret; dir: Ret } {
  const y = a.baseY + (OLHOS_UV.v0 - V_BASE) * a.altura;
  const h = OLHOS_A * a.altura;
  const olho = ({ u0, u1 }: { u0: number; u1: number }): Ret => ({
    x: a.cx + u0 * a.altura,
    y,
    w: (u1 - u0) * a.altura,
    h,
  });
  return { esq: olho(OLHOS_UV.esq), dir: olho(OLHOS_UV.dir) };
}

/** Do tamanho cheio para baixo, 5% por vez; a última é ALTURA_MIN exata. */
function alturasPossiveis(mesaH: number): number[] {
  const min = ALTURA_MIN * mesaH;
  const lista: number[] = [];
  for (let a = ALTURA_MAC * mesaH; a > min; a *= PASSO_ENCOLHE) lista.push(a);
  lista.push(min);
  return lista;
}

/**
 * Os y do centro dos olhos em que o Mac inteiro cabe na mesa: o topo no auge
 * do pulo abaixo da MenuBar, e a borda de baixo da sombra dentro da mesa.
 */
function eyNaMesa(mesaH: number, altura: number): Intervalo {
  return {
    de: MARGEM_TOPO + (TOPO_ACIMA_DA_BASE + SALTO_MAC - OLHOS_ACIMA_DA_BASE) * altura,
    ate: mesaH - (SOMBRA_ABAIXO_DA_BASE + OLHOS_ACIMA_DA_BASE) * altura,
  };
}

/** Folga de cada lado dos olhos: o respiro fixo mais o quanto eles balançam. */
function margens(altura: number) {
  return {
    x: FOLGA_OLHOS + INCLINA_MAC * OLHOS_ACIMA_DA_BASE * altura,
    y: FOLGA_OLHOS + RESPIRA_MAC * OLHOS_ACIMA_DA_BASE * altura,
  };
}

/**
 * Os y do centro dos olhos que cabem entre `topo` e `fundo` com as margens,
 * já cortados pelo que mantém o Mac inteiro na mesa.
 */
function eyLivre(topo: number, fundo: number, mesaH: number, altura: number): Intervalo {
  const meia = (OLHOS_A * altura) / 2 + margens(altura).y;
  return cruzar({ de: topo + meia, ate: fundo - meia }, eyNaMesa(mesaH, altura));
}

/** Desloca o Mac para o centro dos olhos cair em (ex, ey). */
function mirar(ex: number, ey: number, altura: number): Ancora {
  return {
    cx: ex - U_OLHOS * altura,
    baseY: ey + OLHOS_ACIMA_DA_BASE * altura,
    altura,
  };
}

export function ancorarMac(
  mesa: { w: number; h: number },
  j: { leiame: Ret; render: Ret; terminal: Ret },
): Ancora {
  const { leiame, render, terminal } = j;
  const alturas = alturasPossiveis(mesa.h);

  // 1. rosto no vão LEIA-ME | RENDER, mirando um pouco acima do meio do RENDER
  const vaoX0 = leiame.x + leiame.w;
  const vaoX1 = render.x;
  for (const altura of alturas) {
    if (vaoX1 - vaoX0 < OLHOS_L * altura + 2 * margens(altura).x) continue;
    const ey = eyLivre(render.y, terminal.y, mesa.h, altura);
    if (ey.de > ey.ate) continue;
    return mirar((vaoX0 + vaoX1) / 2, prender(render.y + 0.45 * render.h, ey), altura);
  }

  // 2. rosto na faixa RENDER / TERMINAL. Aqui quem aperta é a altura: a faixa
  // vai do LEIA-ME à borda direita da coluna, bem mais larga que os olhos
  const fy0 = render.y + render.h;
  const fy1 = terminal.y;
  const exFaixa = (vaoX0 + Math.max(render.x + render.w, terminal.x + terminal.w)) / 2;
  for (const altura of alturas) {
    const ey = eyLivre(fy0, fy1, mesa.h, altura);
    if (ey.de > ey.ate) continue;
    return mirar(exFaixa, prender((fy0 + fy1) / 2, ey), altura);
  }

  // 3. nada cabe: o melhor possível, com o Mac inteiro na mesa
  const altura = ALTURA_MIN * mesa.h;
  return mirar(exFaixa, prender((fy0 + fy1) / 2, eyNaMesa(mesa.h, altura)), altura);
}
