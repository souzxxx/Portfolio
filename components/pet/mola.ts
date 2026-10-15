/**
 * Mola amortecida de passo fixo — o "balanço" do pet no scroll.
 *
 * Rigidez 170 e amortecimento 14 são o mesmo vocabulário de mola do site
 * (EspiaIndice.tsx usa stiffness 170): ζ ≈ 0.54, então ela passa um pouco do
 * alvo e volta — o quique pedido — e assenta em ~1 s.
 *
 * Por que integrar à mão e não usar o useSpring do framer: a PetCena roda em
 * `frameloop="demand"` e precisa saber, a cada quadro, se a mola JÁ PAROU para
 * decidir se pede outro quadro. Com a física aqui, isso é um `assentou()`.
 *
 * O `dt` tem teto de 0.1 s e é quebrado em subpassos de 1/120 s: depois de uma
 * pausa longa (o canvas não desenha quando nada muda), o primeiro quadro chega
 * com `delta` de segundos, e Euler com dt grande explode.
 */
export interface Mola {
  x: number;
  v: number;
}

export const RIGIDEZ = 170;
export const AMORTECIMENTO = 14;

const SUBPASSO = 1 / 120;
const DT_MAX = 0.1;

export function passoMola(
  m: Mola,
  alvo: number,
  dt: number,
  k = RIGIDEZ,
  c = AMORTECIMENTO,
): Mola {
  let { x, v } = m;
  let resta = Math.min(Math.max(dt, 0), DT_MAX);
  while (resta > 1e-9) {
    const h = Math.min(SUBPASSO, resta);
    const a = -k * (x - alvo) - c * v;
    v += a * h;
    x += v * h;
    resta -= h;
  }
  return { x, v };
}

export function assentou(m: Mola, alvo: number, eps = 1e-3): boolean {
  return Math.abs(m.x - alvo) < eps && Math.abs(m.v) < eps;
}
