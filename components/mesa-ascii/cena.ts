import type { Expressao } from "../pet/maquina";
import { desenharGrade } from "../pet/tela";
import { INCLINA_MAC, RESPIRA_MAC, SALTO_MAC, type Ancora } from "./ancora";
import { CELULA_A, CELULA_L, COR_OURO, pintar, type Quadro } from "./grade";
import { REGIAO, pixelDaTela, regiaoEm } from "./silhueta";

/**
 * A cena do Mac gigante: o que cada célula da mesa mostra num instante.
 *
 * É a `cenaMosaico` do protótipo aprovado (versão C), portada sem canvas: a
 * cada quadro a cena converte cada célula em (u, v) do Mac, pergunta a região
 * à silhueta e escreve glifo, alfa e fundo no Quadro. Quem pinta é o
 * componente. Os números de respiração, inclinação, textura, contorno e sombra
 * são os do protótipo; mudar um deles muda o desenho que o Leonardo escolheu.
 *
 * Três diferenças de propósito:
 *   - o lugar e o tamanho vêm da âncora (que tira os olhos de trás das
 *     janelas), e o pulo, o balanço e a respiração usam as constantes que a
 *     âncora reservou: o Mac nunca mexe mais do que ela deixou espaço;
 *   - o rosto é a grade do pet (`desenharGrade`): o Mac da mesa e o pet do
 *     canto são o mesmo personagem e fazem as mesmas caras;
 *   - o pulo guarda o instante em que começou e a fase sai de `e.t`, em vez de
 *     somar `dt` a cada quadro: o mesmo `t` dá o mesmo quadro, e os testes
 *     conseguem pedir "o pulo em 0.25 s".
 *
 * Com `reduzido` (prefers-reduced-motion), o tempo não anima nada: um quadro
 * parado, o Mac de pé, olhando para a frente, igual em qualquer `t`.
 */
export interface EntradaMac {
  /** Segundos no relógio da cena, que começa em 0, como no protótipo. */
  t: number;
  /** Segundos desde o quadro anterior. */
  dt: number;
  mesa: { w: number; h: number };
  ancora: Ancora;
  /** Em px da mesa; null com o cursor fora dela (ou só toque). */
  mouse: { x: number; y: number } | null;
  reduzido: boolean;
}

export interface Mac {
  /** Instante em que o último pulo começou; −Infinity se nunca pulou. */
  pulo: number;
  /** Cai de 1 a 0 em 1 s depois de um clique perto; enquanto > 0, surpreso. */
  susto: number;
  /** Até quando os olhos ficam fechados na piscada atual. */
  piscaFim: number;
  /** Quando começa a próxima piscada. */
  proxPisca: number;
  /** Largura da lateral em alturas: segue o mouse devagar (a paralaxe). */
  lado: number;
  /** Região de cada célula no quadro atual e o (u, v) do centro dela. */
  regioes: Int8Array;
  U: Float32Array;
  V: Float32Array;
  /** 0–1: `Math.random` na página, fixo nos testes. */
  sorteio: () => number;
}

/** O v onde o pé encosta na mesa. */
const V_BASE = 0.43;
/** A lateral em repouso, e quanto ela estreita com o mouse todo à direita. */
const LADO = 0.1;
const LADO_MOUSE = 0.05;
/** O pulo anda 1.8 fases por segundo (dura 0.56 s); amassa a partir de 0.86. */
const PULO_VEL = 1.8;
const POUSO = 0.86;
/** No voo o Mac estica 3%; no pouso amassa 6% e alarga 4.5%. */
const ESTICA_VOO = 0.03;
const AMASSA_POUSO = 0.06;
const ALARGA_POUSO = 0.045;
/** Ao respirar ele afina um pouco enquanto estica: o volume parece o mesmo. */
const RESPIRA_LARGURA = 0.01;
/** Inclinação extra na direção do mouse, que não conta em repouso. */
const INCLINA_MOUSE = 0.03;
/** A primeira piscada é fixa; as seguintes, a cada 2.2 a 5.2 s. */
const PRIMEIRA_PISCA = 1.8;
const PISCA_MIN = 2.2;
const PISCA_SORTEIO = 3;
const PISCA_DURA = 0.13;
/** Do mais ralo ao mais denso: a "escama" da frente. */
const TEXTURA = " .:+xX%";
/**
 * Até onde a cena procura células, em alturas a partir de (cx, baseY). O
 * protótipo ia a 1.02 para cima, mas com o esticão do voo, a respiração no
 * alto e a lateral larga, o topo do tampo chega a 1.027 e a linha de cima
 * podia ficar de fora; 1.05 sobra. Para os lados, 0.5 já cobre o balanço.
 */
const BUSCA_X = 0.5;
const BUSCA_CIMA = 1.05;
const BUSCA_BAIXO = 0.03;

const limitar = (x: number, a = -1, b = 1) => (x < a ? a : x > b ? b : x);

/** Hash inteiro → 0–1 do protótipo: o mesmo (i, j) dá sempre o mesmo valor. */
function hash(x: number, y: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/** Ruído de valor suavizado: interpola os hashes dos quatro cantos. */
function ruido(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function criarMac(q: Quadro, sorteio: () => number = Math.random): Mac {
  const n = q.cols * q.linhas;
  return {
    pulo: -Infinity,
    susto: 0,
    piscaFim: 0,
    proxPisca: PRIMEIRA_PISCA,
    lado: LADO,
    regioes: new Int8Array(n),
    U: new Float32Array(n),
    V: new Float32Array(n),
    sorteio,
  };
}

export function redimensionarMac(m: Mac, q: Quadro): void {
  const n = q.cols * q.linhas;
  m.regioes = new Int8Array(n);
  m.U = new Float32Array(n);
  m.V = new Float32Array(n);
}

/** O mouse está em cima do Mac (medido no Mac parado, sem o pulo). */
export function pertoDoMac(e: EntradaMac): boolean {
  if (!e.mouse) return false;
  const { cx, baseY, altura } = e.ancora;
  return (
    Math.abs(e.mouse.x - cx) < 0.4 * altura &&
    Math.abs(e.mouse.y - (baseY - V_BASE * altura)) < 0.5 * altura
  );
}

/** Um clique na mesa: o Mac pula, e se foi perto dele, leva um susto. */
export function pularMac(m: Mac, perto: boolean, t: number): void {
  m.pulo = t;
  if (perto) m.susto = 1;
}

export function modoDoRosto(m: Mac, t: number, perto: boolean): Expressao {
  if (m.susto > 0) return "surpreso";
  if (t < m.piscaFim) return "piscando";
  return perto ? "atento" : "normal";
}

export function desenharMac(q: Quadro, m: Mac, e: EntradaMac): void {
  // quem esqueceu de redimensionar depois de um resize não escreve fora
  if (m.regioes.length !== q.cols * q.linhas) redimensionarMac(m, q);
  const { cols, linhas } = q;
  const { cx, altura: hm } = e.ancora;
  const vivo = !e.reduzido;
  // o relógio da textura e da varredura: parado em 0 no quadro reduzido
  const t = vivo ? e.t : 0;

  const fase = vivo ? (e.t - m.pulo) * PULO_VEL : Infinity;
  const pulando = fase >= 0 && fase < 1;
  const salto = pulando ? Math.sin(fase * Math.PI) * SALTO_MAC * hm : 0;
  const pouso = pulando && fase > POUSO;
  const resp = Math.sin(t * 1.7);
  const sy =
    1 + resp * RESPIRA_MAC - (pouso ? AMASSA_POUSO : 0) + (pulando && !pouso ? ESTICA_VOO : 0);
  const sx = 1 - resp * RESPIRA_LARGURA + (pouso ? ALARGA_POUSO : 0);
  const baseY = e.ancora.baseY - salto;

  // o olhar mede do rosto onde ele está agora, com o pulo
  const mouse = vivo ? e.mouse : null;
  const mx = mouse ? limitar((mouse.x - cx) / (e.mesa.w * 0.3)) : 0;
  const my = mouse ? limitar((mouse.y - (baseY - 0.62 * hm)) / (e.mesa.h * 0.4)) : 0;
  if (vivo) m.lado += (LADO - mx * LADO_MOUSE - m.lado) * Math.min(1, e.dt * 3);
  else m.lado = LADO;
  const inclina = Math.sin(t * 0.8) * INCLINA_MAC + mx * INCLINA_MOUSE;

  if (vivo) {
    m.susto = Math.max(0, m.susto - e.dt);
    if (e.t > m.proxPisca) {
      m.piscaFim = e.t + PISCA_DURA;
      m.proxPisca = e.t + PISCA_MIN + m.sorteio() * PISCA_SORTEIO;
    }
  }
  const perto = vivo && pertoDoMac(e);
  const modo = vivo ? modoDoRosto(m, e.t, perto) : "normal";
  const rosto = desenharGrade(modo, { x: mx, y: my }, 0);

  // a sombra fica no chão: não sobe com o pulo, só encolhe
  const rx = 0.36 * hm * (1 - (salto / (SALTO_MAC * hm)) * 0.35);
  const ry = 0.03 * hm;
  const sx0 = cx - 0.05 * hm;
  const sy0 = e.ancora.baseY + 0.01 * hm;
  for (let j = Math.floor((sy0 - ry) / CELULA_A); j <= Math.ceil((sy0 + ry) / CELULA_A); j++)
    for (let i = Math.floor((sx0 - rx) / CELULA_L); i <= Math.ceil((sx0 + rx) / CELULA_L); i++) {
      const ex = (i * CELULA_L + CELULA_L / 2 - sx0) / rx;
      const ey = (j * CELULA_A + CELULA_A / 2 - sy0) / ry;
      if (ex * ex + ey * ey < 1) pintar(q, i, j, ".", 0.2);
    }

  // 1ª passada: a região de cada célula, para a 2ª olhar as vizinhas
  const i0 = Math.max(0, Math.floor((cx - BUSCA_X * hm) / CELULA_L));
  const i1 = Math.min(cols - 1, Math.ceil((cx + BUSCA_X * hm) / CELULA_L));
  const j0 = Math.max(0, Math.floor((baseY - BUSCA_CIMA * hm) / CELULA_A));
  const j1 = Math.min(linhas - 1, Math.ceil((baseY + BUSCA_BAIXO * hm) / CELULA_A));
  for (let j = j0; j <= j1; j++) {
    const v = V_BASE + (j * CELULA_A + CELULA_A / 2 - baseY) / (hm * sy);
    for (let i = i0; i <= i1; i++) {
      // quanto mais alto no Mac, mais o balanço o leva para o lado
      const u = (i * CELULA_L + CELULA_L / 2 - cx) / (hm * sx) + (v - V_BASE) * inclina;
      const id = j * cols + i;
      m.regioes[id] = regiaoEm(u, v, m.lado);
      m.U[id] = u;
      m.V[id] = v;
    }
  }
  const viz = (i: number, j: number) =>
    i < i0 || i > i1 || j < j0 || j > j1 ? REGIAO.vazio : m.regioes[j * cols + i];

  // 2ª passada: o que cada região desenha
  for (let j = j0; j <= j1; j++)
    for (let i = i0; i <= i1; i++) {
      const id = j * cols + i;
      const c = m.regioes[id];
      if (c === REGIAO.vazio) continue;
      // contorno: onde a silhueta encontra o vazio
      if (!viz(i - 1, j) || !viz(i + 1, j) || !viz(i, j - 1) || !viz(i, j + 1)) {
        pintar(q, i, j, "#", 0.7, 0.13);
        continue;
      }
      switch (c) {
        case REGIAO.frente: {
          // a textura mora nas células, não no Mac: o ruído escorre por ela
          const n =
            ruido(i * 0.21 + t * 0.55, j * 0.21 - t * 0.25) * 0.65 +
            ruido(i * 0.53 - t * 0.8, j * 0.53 + t * 0.3) * 0.35;
          const luz = 1 - limitar((m.U[id] + 0.36) / 0.62, 0, 1) * 0.6;
          const glifo = TEXTURA[1 + Math.min(5, Math.floor(n * 6))];
          pintar(q, i, j, glifo, (0.2 + 0.42 * n) * (perto ? 1.2 : 1), 0.05 + 0.08 * luz);
          break;
        }
        case REGIAO.lado:
          // a aresta frente/lateral é contorno; o resto, hachura em xadrez
          if (viz(i - 1, j) === REGIAO.frente) pintar(q, i, j, "#", 0.85, 0.14);
          else pintar(q, i, j, (i + j) % 2 ? " " : "/", 0.55, 0.02);
          break;
        case REGIAO.tampo:
          if (viz(i, j + 1) === REGIAO.frente) pintar(q, i, j, "#", 0.85, 0.14);
          else pintar(q, i, j, i % 2 ? "-" : "=", 0.38, 0.1);
          break;
        case REGIAO.moldura: {
          const borda =
            viz(i - 1, j) === REGIAO.tela ||
            viz(i + 1, j) === REGIAO.tela ||
            viz(i, j - 1) === REGIAO.tela ||
            viz(i, j + 1) === REGIAO.tela;
          if (borda) pintar(q, i, j, "+", 0.75, 0.2);
          else pintar(q, i, j, ".", 0.22, 0.17);
          break;
        }
        case REGIAO.tela: {
          const { px, py } = pixelDaTela(m.U[id], m.V[id]);
          if (rosto[py][px]) pintar(q, i, j, " ", 0, 0.95);
          else if (py === Math.floor(t * 7) % 12) pintar(q, i, j, "-", 0.25);
          else pintar(q, i, j, (i + j) % 3 ? " " : ".", 0.1);
          break;
        }
        case REGIAO.fenda:
          pintar(q, i, j, "_", 0.9);
          break;
        case REGIAO.pe:
          pintar(q, i, j, "=", 0.4, 0.07);
          break;
        case REGIAO.selo:
          // o único dourado do Mac, como no protótipo: fundo e glifo ouro
          pintar(q, i, j, "*", 1, 0.25, COR_OURO);
          break;
      }
    }
}
