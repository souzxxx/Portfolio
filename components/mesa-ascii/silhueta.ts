import { COLUNAS, LINHAS } from "../pet/tela";

/**
 * A silhueta do Macintosh em 3/4, no espaço (u, v) do Mac.
 *
 * u e v são px divididos pela altura do Mac (o Hm do protótipo): u = 0 é o
 * eixo vertical do Mac, v cresce para baixo e v = 0.43 é onde o pé encosta na
 * mesa. Medir em alturas, e não em células, deixa a mesma silhueta servir em
 * qualquer tamanho de mesa; quem converte célula em (u, v) é a cena.
 *
 * Os números são os da função `classe` do protótipo aprovado (versão C,
 * "Mosaico vivo"). Mudar um deles muda o desenho que o Leonardo escolheu.
 */
export const REGIAO = {
  vazio: 0,
  frente: 1,
  lado: 2,
  tampo: 3,
  moldura: 4,
  tela: 5,
  fenda: 6,
  pe: 7,
  selo: 8,
} as const;

export type Regiao = (typeof REGIAO)[keyof typeof REGIAO];

/**
 * A região do Mac no ponto (u, v). `lado` é a largura da lateral direita em
 * alturas (0.1 em repouso): ela estreita e alarga com o mouse, e o tampo
 * acompanha, porque as duas faces sobem juntas na mesma diagonal de fuga.
 *
 * Dentro da frente, a tela fica dentro da moldura e por isso é testada antes
 * dela; o que não é tela, moldura, fenda nem selo é frente.
 */
export function regiaoEm(u: number, v: number, lado: number): Regiao {
  // quanto a lateral e o tampo sobem no fundo (a diagonal da perspectiva)
  const dv = lado * 0.6;
  if (u >= -0.36 && u <= 0.26 && v >= -0.46 && v <= 0.36) {
    if (u >= -0.25 && u <= 0.15 && v >= -0.355 && v <= -0.025) return REGIAO.tela;
    if (u >= -0.29 && u <= 0.19 && v >= -0.395 && v <= 0.015) return REGIAO.moldura;
    if (u >= -0.01 && u <= 0.18 && v >= 0.13 && v <= 0.16) return REGIAO.fenda;
    if (u >= -0.315 && u <= -0.28 && v >= 0.25 && v <= 0.28) return REGIAO.selo;
    return REGIAO.frente;
  }
  if (u > 0.26 && u <= 0.26 + lado) {
    const k = (u - 0.26) / lado;
    if (v >= -0.46 - dv * k && v <= 0.36 - dv * k) return REGIAO.lado;
  }
  if (v < -0.46 && v >= -0.46 - dv) {
    const k = (-0.46 - v) / dv;
    if (u >= -0.36 + lado * k && u <= 0.26 + lado * k) return REGIAO.tampo;
  }
  if (u >= -0.29 && u <= 0.19 && v > 0.36 && v <= 0.43) return REGIAO.pe;
  return REGIAO.vazio;
}

/**
 * A tela (a região `tela` acima) em largura e altura escritas à mão, como no
 * protótipo: `-0.025 - -0.355` dá 0.32999999999999996, e esse ulp a menos
 * pode trocar o pixel de um ponto que cai bem na divisa entre dois.
 */
const TELA_U0 = -0.25;
const TELA_V0 = -0.355;
const TELA_LARGURA = 0.4;
const TELA_ALTURA = 0.33;

/**
 * O pixel da grade 16×12 do rosto do pet (`desenharGrade` de `pet/tela`) que
 * mora no ponto (u, v) da tela. É a mesma grade do pet de propósito: o Mac da
 * mesa e o pet do canto são o mesmo personagem e fazem as mesmas caras.
 *
 * A região `tela` é fechada nas duas pontas, então a borda direita e a de
 * baixo dariam o pixel 16 / 12, que não existe; elas ficam no último.
 */
export function pixelDaTela(u: number, v: number): { px: number; py: number } {
  const px = Math.floor(((u - TELA_U0) / TELA_LARGURA) * COLUNAS);
  const py = Math.floor(((v - TELA_V0) / TELA_ALTURA) * LINHAS);
  return {
    px: Math.min(COLUNAS - 1, Math.max(0, px)),
    py: Math.min(LINHAS - 1, Math.max(0, py)),
  };
}

/**
 * Onde ficam os olhos `normal` olhando para a frente, em (u, v): colunas 4–5
 * e 10–11, linhas 3–4 da grade do pet (cada pixel tem 0.025 × 0.0275). É o
 * retângulo que a âncora precisa deixar sem janela por cima.
 */
export const OLHOS_UV = {
  esq: { u0: -0.15, u1: -0.1 },
  dir: { u0: 0.0, u1: 0.05 },
  v0: -0.2725,
  v1: -0.2175,
} as const;
