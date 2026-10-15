/**
 * A matemática do "bicho": as curvas que a PetCena usa em cima das molas.
 *
 * Tudo aqui é puro e sem relógio, pelo mesmo motivo do mola.ts: o useFrame só
 * entrega um `delta`, e o comportamento precisa ser testável sem WebGL. Nada
 * aqui conhece o three; são números entrando e números saindo.
 *
 * O PULINHO é balístico, não mola. Uma mola com impulso devolve uma oscilação
 * amortecida — sobe, desce ABAIXO do chão, volta —, e isso lê como "elástico",
 * não como salto. Um salto é uma parábola: decola, desacelera, para no alto,
 * cai e PARA no chão. O "boing" do pouso fica com a mola da escala (o squash),
 * que é onde a elasticidade de desenho animado mora.
 */

/** Mesmo teto do mola.ts: depois de uma pausa o primeiro `delta` chega em segundos. */
export const DT_MAX = 0.1;

const VOLTA = Math.PI * 2;

/** `delta` do quadro limitado a [0, DT_MAX]. NaN e negativo viram 0 (nada anda). */
export function limitarDt(delta: number): number {
  return delta > 0 ? Math.min(delta, DT_MAX) : 0;
}

/**
 * Aproximação exponencial independente da taxa de quadros: em `tau` segundos
 * cobre 63% da distância, seja a 30 ou a 144 Hz. É o "atraso" do corpo atrás
 * dos olhos — um filtro na frente da mola, não uma mola mais mole, para o
 * corpo CHEGAR depois sem perder o quique do fim.
 */
export function aproximar(atual: number, alvo: number, dt: number, tau: number): number {
  if (!(tau > 0)) return alvo;
  return alvo + (atual - alvo) * Math.exp(-limitarDt(dt) / tau);
}

/**
 * Teto suave: `max · tanh(x / max)`. Inclinação 1 perto de zero (o pequeno
 * passa intacto) e assíntota em ±max (o grande nunca passa do teto). Um
 * `clamp` seco faria a escala bater num platô e parar de mexer — quina
 * visível justamente no auge do squash.
 */
export function limiteSuave(x: number, max: number): number {
  if (!(max > 0)) return 0;
  return max * Math.tanh(x / max);
}

/** Escala de x e z que conserva o volume quando y vale `sy`: sx·sy·sz = 1. */
export function compensarVolume(sy: number): number {
  return 1 / Math.sqrt(Math.max(sy, 1e-3));
}

/**
 * Avança uma fase de seno em `dt` para um período que pode MUDAR entre
 * quadros (acordado 2.6 s, dormindo 4.5 s). Integrar a fase, em vez de
 * calcular `sin(2π·t / período)`, é o que deixa trocar o período sem salto:
 * mudar o período com `t` grande pularia o seno para outro ponto da onda.
 * Volta para [0, 2π) para não perder precisão depois de horas aberto.
 */
export function avancarFase(fase: number, dt: number, periodo: number): number {
  if (!(periodo > 0)) return fase;
  const f = (fase + (VOLTA * limitarDt(dt)) / periodo) % VOLTA;
  return f < 0 ? f + VOLTA : f;
}

// ── Pulinho ─────────────────────────────────────────────────────────────────

/** Altura do pulinho em unidades de cena (~12 px CSS no canvas de 150 px). */
export const ALTURA_SALTO = 0.25;
/** "Gravidade" de desenho animado: com 0.25 de altura dá 0.35 s no ar — curto e alegre. */
export const GRAVIDADE = 16;
/** Antecipação: tempo agachado antes de decolar. Casa com o pico do squash da escala (~75 ms). */
export const AGACHA_S = 0.075;
/** v² = 2gh: a velocidade que leva exatamente a ALTURA_SALTO. */
export const VEL_DECOLAGEM = Math.sqrt(2 * GRAVIDADE * ALTURA_SALTO);

export interface Salto {
  /** Altura acima do chão (≥ 0). */
  y: number;
  /** Velocidade vertical; > 0 subindo. */
  v: number;
  /** Segundos que faltam agachado; 0 = não está se preparando. */
  agacha: number;
  /** Pedido que chegou com o pulo em andamento: sai assim que pousar. */
  pendente: boolean;
}

export type EventoSalto = "nada" | "decolou" | "pousou";

export function criarSalto(): Salto {
  return { y: 0, v: 0, agacha: 0, pendente: false };
}

/** Parado no chão, sem pulo armado nem pendente. */
export function emRepouso(s: Salto): boolean {
  return s.y === 0 && s.v === 0 && s.agacha === 0 && !s.pendente;
}

/**
 * Pede um pulinho. No chão, começa a agachar e devolve `true` (quem chama
 * aplica o squash da antecipação). Já no meio de um pulo, guarda UM pendente
 * — cliques seguidos viram pulos encadeados, "boing boing", e não um pulo
 * que dobra de altura no ar.
 */
export function pedirSalto(s: Salto): boolean {
  if (s.agacha > 0 || s.y > 0 || s.v !== 0) {
    s.pendente = true;
    return false;
  }
  s.agacha = AGACHA_S;
  return true;
}

/**
 * Avança o pulo em `dt` (MUTA `s`: roda a cada quadro e não deve alocar).
 * A parábola é integrada na forma fechada, então a altura máxima é exata em
 * qualquer taxa de quadros. Devolve o que aconteceu neste passo, para a
 * PetCena aplicar o squash do pouso.
 */
export function passoSalto(s: Salto, dt: number): EventoSalto {
  let h = limitarDt(dt);
  let evento: EventoSalto = "nada";

  if (s.agacha > 0) {
    if (h < s.agacha) {
      s.agacha -= h;
      return evento;
    }
    h -= s.agacha;
    s.agacha = 0;
    s.v = VEL_DECOLAGEM;
    evento = "decolou";
  }

  if (s.y > 0 || s.v > 0) {
    const y = s.y + s.v * h - 0.5 * GRAVIDADE * h * h;
    const v = s.v - GRAVIDADE * h;
    if (y <= 0 && v < 0) {
      s.y = 0;
      s.v = 0;
      // O squash do pouso já É a antecipação do próximo: emenda sem pausa.
      if (s.pendente) {
        s.pendente = false;
        s.agacha = AGACHA_S;
      }
      return "pousou";
    }
    s.y = y;
    s.v = v;
  }
  return evento;
}
