import type { Expressao } from "./maquina";

/**
 * O estado VIVO do pet: um objeto mutável, não estado do React.
 *
 * Quem escreve: usePetEventos (mouse, scroll, hover, timers).
 * Quem lê: o useFrame da PetCena. Depois de escrever, chama `invalidar()`,
 * que a PetCena liga ao `invalidate` do R3F — com `frameloop="demand"` é o
 * único jeito de um quadro novo existir. Mover o mouse nunca re-renderiza
 * componente nenhum.
 */
export interface EstadoPet {
  /** Direção do cursor a partir do centro do pet, cada eixo em [-1, 1]. y > 0 = abaixo. */
  olhar: { x: number; y: number };
  /** Velocidade do scroll normalizada em [-1, 1]; > 0 = descendo. 0 = parado. */
  rolagem: number;
  /** Direção do alvo de hover (mesma convenção de `olhar`), ou null. */
  alvoHover: { x: number; y: number } | null;
  expressao: Expressao;
  /** Fase do "z" do sono; sobe 1 a cada Z_PASSO_MS. */
  zFase: number;
  reduzido: boolean;
  /** Rotação aplicada no último quadro (radianos). Lida pelo teste de navegador. */
  rot: { x: number; y: number };
  /** Contador de pulinhos: cada incremento dispara um hop na PetCena. */
  pulo: number;
  invalidar: () => void;
}

export function criarEstado(): EstadoPet {
  return {
    olhar: { x: 0, y: 0 },
    rolagem: 0,
    alvoHover: null,
    expressao: "normal",
    zFase: 0,
    reduzido: false,
    rot: { x: 0, y: 0 },
    pulo: 0,
    invalidar: () => {},
  };
}
