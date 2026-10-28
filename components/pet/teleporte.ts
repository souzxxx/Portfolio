/**
 * O teletransporte do pet na home (spec §5): quando ele aparece e como.
 *
 * Puro de propósito. Aqui moram o GATILHO (com histerese) e o ROTEIRO dos
 * quadros; quem mede o SOUZXXX, toca as animações (Web Animations API) e
 * esconde a cena é o componente. Assim a regra e o desenho do efeito são
 * testáveis sem DOM, sem relógio e sem scroll.
 *
 * A referência é o teletransporte do Goku: some num piscar e reaparece com um
 * tremido. Por isso o roteiro anda em DEGRAUS (`steps(1, end)` em todo
 * keyframe): cada valor vale até o próximo offset e troca de uma vez, como um
 * quadro de animação 1-bit. Um easing suave viraria um "fade", que é
 * justamente o que o efeito não é.
 */

/** Altura da MenuBar fixa (`h-7`). A borda de cima do SOUZXXX encostando nela é o gatilho. */
export const LIMIAR_PX = 28;
/** Quanto o SOUZXXX precisa descer abaixo do limiar para o pet sair. */
export const HISTERESE_PX = 32;
/** Duração da entrada. Os offsets de `QUADROS` são frações dela. */
export const TELEPORTE_ENTRA_MS = 400;
/** A saída é o mesmo roteiro ao contrário, mais curta (spec §5.2). */
export const TELEPORTE_SAI_MS = 300;

export type FaseTeleporte = "fora" | "entrando" | "dentro" | "saindo";

export type ParteTeleporte =
  | "corpo"
  | "risco"
  | "linha-esq"
  | "linha-dir"
  | "residuo-esq"
  | "residuo-dir";

/**
 * O pet deve estar dentro? `topoCortina` é a borda de cima do SOUZXXX gigante
 * em px da viewport (o `top` do getBoundingClientRect): ela sobe conforme o
 * visitante rola, e fica negativa quando o SOUZXXX já passou do topo.
 *
 * Entra com `topo <= limiar` e só sai com `topo > limiar + histerese`. Entre
 * os dois, mantém o que já é. Sem essa faixa, a página parada no limite (ou o
 * sub-pixel do scroll suave oscilando em volta dos 28 px) fazia o pet entrar
 * e sair sem parar.
 */
export function querDentro(
  topoCortina: number,
  dentroAgora: boolean,
  limiar = LIMIAR_PX,
  histerese = HISTERESE_PX,
): boolean {
  if (topoCortina <= limiar) return true;
  if (topoCortina > limiar + histerese) return false;
  return dentroAgora;
}

/**
 * A animação já está onde o rumo pedido termina? `tempoMs` é o currentTime
 * das animações (0 = fora, TELEPORTE_ENTRA_MS = dentro).
 *
 * É a pergunta que vem ANTES do `play()`, porque ele rebobina sozinho: tocar
 * ao contrário com o tempo em 0, ou para a frente com o tempo no fim, salta
 * para a ponta oposta e toca o roteiro inteiro. Uma inversão no quadro em que
 * a entrada ainda nem andou mostraria a saída completa de um pet que nunca
 * apareceu. Quando isto dá true, quem toca só assenta a fase.
 */
export function jaChegou(dentro: boolean, tempoMs: number, duracao = TELEPORTE_ENTRA_MS): boolean {
  return dentro ? tempoMs >= duracao : tempoMs <= 0;
}

const DEGRAU = "steps(1, end)";

/**
 * Um keyframe em degrau. Toda chamada repete as propriedades que não mudam
 * naquele offset: o valor fica explícito na tabela e o teste compara string
 * com string, sem depender de como o navegador preenche o que falta.
 */
function quadro(offset: number, opacity: string, transform?: string): Keyframe {
  return transform === undefined
    ? { offset, easing: DEGRAU, opacity }
    : { offset, easing: DEGRAU, opacity, transform };
}

/** `lado` -1 é a esquerda. */
const deslocar = (lado: -1 | 1, px: number) => `translateX(${lado * px}px)`;

/**
 * As linhas de velocidade: acendem com o risco, abrem 10 px para fora e somem
 * na metade, antes de o corpo terminar de abrir.
 */
function linha(lado: -1 | 1): Keyframe[] {
  return [
    quadro(0, "0", "translateX(0)"),
    quadro(0.05, "1", "translateX(0)"),
    quadro(0.3, "1", deslocar(lado, 10)),
    quadro(0.5, "0", deslocar(lado, 10)),
    quadro(1, "0", deslocar(lado, 10)),
  ];
}

/**
 * As imagens residuais: silhuetas chapadas do Mac que aparecem quando o corpo
 * passa do ponto (0.45), a meia opacidade e 8 px para o lado, e se afastam
 * apagando. Antes disso estão invisíveis, paradas atrás do corpo (no DOM
 * elas vêm antes dele, ver Pet.tsx): deslocadas, só a borda delas aparece.
 */
function residuo(lado: -1 | 1): Keyframe[] {
  return [
    quadro(0, "0", "translateX(0)"),
    quadro(0.45, "0.5", deslocar(lado, 8)),
    quadro(0.65, "0.25", deslocar(lado, 14)),
    quadro(0.8, "0", deslocar(lado, 14)),
    quadro(1, "0", deslocar(lado, 14)),
  ];
}

/**
 * O roteiro da ENTRADA (spec §5.2), offsets em fração de TELEPORTE_ENTRA_MS.
 *
 * - `risco`: o traço vertical creme pisca no lugar do pet (0–0.25).
 * - `corpo`: surge fininho e esticado na vertical, abre em quatro degraus
 *   passando do ponto (1.12 × 0.94), pisca (some, volta, meio apagado, volta)
 *   e termina em `none`, devolvendo o pet à mola que já existe.
 * - `linha-*` e `residuo-*`: ver acima. Toda parte que não é o corpo termina
 *   invisível, para nada sobrar em volta do pet depois do efeito.
 *
 * A saída toca as mesmas tabelas ao contrário: as linhas, que acendem
 * primeiro na entrada, são as últimas a sumir.
 */
export const QUADROS: Record<ParteTeleporte, Keyframe[]> = {
  corpo: [
    quadro(0, "0", "scale(0.08, 1.3)"),
    quadro(0.2, "0", "scale(0.08, 1.3)"),
    quadro(0.25, "1", "scale(0.15, 1.25)"),
    quadro(0.35, "1", "scale(0.5, 1.12)"),
    quadro(0.45, "1", "scale(1.12, 0.94)"),
    quadro(0.55, "0", "scale(1, 1)"),
    quadro(0.65, "1", "scale(1, 1)"),
    quadro(0.75, "0.4", "scale(1, 1)"),
    quadro(0.85, "1", "scale(1, 1)"),
    quadro(1, "1", "none"),
  ],
  risco: [
    quadro(0, "0"),
    quadro(0.05, "1"),
    quadro(0.25, "0"),
    quadro(1, "0"),
  ],
  "linha-esq": linha(-1),
  "linha-dir": linha(1),
  "residuo-esq": residuo(-1),
  "residuo-dir": residuo(1),
};
