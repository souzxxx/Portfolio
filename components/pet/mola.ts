/**
 * Mola amortecida de passo fixo — o "balanço" do pet no scroll.
 *
 * Rigidez 170 e amortecimento 14 são o mesmo vocabulário de mola do site
 * (EspiaIndice.tsx usa stiffness 170): ζ ≈ 0.54, então ela passa um pouco do
 * alvo e volta — o quique pedido — e assenta em ~1 s.
 *
 * Por que integrar à mão e não usar o useSpring do framer: a PetCena avança
 * sete molas por quadro dentro de um único useFrame, cada uma com a própria
 * rigidez, e LÊ a velocidade delas (o squash usa a velocidade vertical; o
 * "deitar na curva", a do giro). O useSpring vive fora do laço do R3F e não
 * entrega isso quadro a quadro. `assentou()` é do tempo em que a cena só
 * desenhava sob demanda e precisava saber se a mola parou; hoje só os testes
 * o usam.
 *
 * O `dt` tem teto de 0.1 s e é quebrado em subpassos de 1/120 s. A PetCena
 * desenha sem parar enquanto a aba está visível (ruling do Leonardo: animação
 * viva), mas o navegador suspende o rAF com a aba escondida, e o primeiro
 * quadro na volta chega com `delta` de segundos. Euler com dt grande explode.
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
