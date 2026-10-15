/**
 * O desvio do pet: quanto ele sai do canto para não esconder um controle.
 *
 * Ruling do orquestrador: o pet mora no canto inferior direito, mas quando
 * algo clicável fica embaixo da área de clique dele, ele SOBE até sair de
 * cima. Medido nos tamanhos de notebook comuns (1366×768, 1280×720,
 * 1024×768), subir sozinho não basta: a coluna de ícones da mesa fica
 * exatamente em cima do pet, com vãos de 16 px entre os ícones, e o pet
 * precisa de 112 (104 + folga). Subir só empurrava o problema de ícone em
 * ícone até o teto, e lá ele cobria o QuintoAndar. Então:
 *
 *   1. sobe (o ruling), até TENTATIVAS vezes e no máximo `teto` px;
 *   2. se subindo não há lugar livre, vai para a ESQUERDA, mesma regra;
 *   3. se nem assim, fica no teto (o pedido original do brief).
 *
 * Um interativo só conta se o pet cobre pelo menos COBERTURA_MINIMA da área
 * DELE. As linhas da lista de projetos ocupam a largura toda e ficam coladas
 * umas nas outras: o pet cobre 3% de cada uma, o resto continua clicável, e
 * desviar delas o levaria ao teto durante a seção inteira.
 *
 * Pura, sem DOM: quem mede é o useDesvio.
 */
export interface Retangulo {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Px para a ESQUERDA (x) e para CIMA (y), ambos ≥ 0. */
export interface Desvio {
  x: number;
  y: number;
}

/** Distância entre o pet e o controle de que ele desviou. */
export const FOLGA_PX = 8;
/** Deslocamentos por eixo antes de desistir dele. */
export const TENTATIVAS = 4;
/** Fração da área do obstáculo que o pet precisa cobrir para ele contar. */
export const COBERTURA_MINIMA = 0.2;

/** Obstáculos fixos, ou um amostrador que diz o que está sob uma posição. */
export type Obstaculos =
  | readonly Retangulo[]
  | ((candidato: Retangulo) => readonly Retangulo[]);

/** O retângulo depois de andar `x` para a esquerda e `y` para cima. */
export function deslocar(r: Retangulo, x: number, y: number): Retangulo {
  return { left: r.left - x, top: r.top - y, right: r.right - x, bottom: r.bottom - y };
}

/** Quanto da área de `o` o retângulo `c` cobre, em [0, 1]. Sem área = 0. */
export function cobertura(o: Retangulo, c: Retangulo): number {
  const area = (o.right - o.left) * (o.bottom - o.top);
  if (!(area > 0)) return 0;
  const l = Math.max(0, Math.min(o.right, c.right) - Math.max(o.left, c.left));
  const a = Math.max(0, Math.min(o.bottom, c.bottom) - Math.max(o.top, c.top));
  return (l * a) / area;
}

export function calcularDesvio(
  repouso: Retangulo,
  obstaculos: Obstaculos,
  teto: number,
  folga = FOLGA_PX,
  tentativas = TENTATIVAS,
): Desvio {
  const sob = typeof obstaculos === "function" ? obstaculos : () => obstaculos;
  const bloqueiam = (c: Retangulo) =>
    sob(c).filter((o) => cobertura(o, c) >= COBERTURA_MINIMA);

  // Cada passo mede na posição CANDIDATA, não na atual: depois de subir, o
  // que importa é o que está embaixo do lugar novo. `precisa` é sempre maior
  // que o passo anterior (o obstáculo achado está sobre o candidato), então a
  // busca só anda para longe do canto.
  const procurar = (precisa: (o: Retangulo) => number, mover: (d: number) => Retangulo) => {
    let d = 0;
    for (let i = 0; ; i++) {
      const achados = bloqueiam(mover(d));
      if (achados.length === 0) return d;
      if (i === tentativas) return null;
      // Teto para cima, inteiro: a folga nunca fica aquém com borda fracionária.
      d = Math.ceil(Math.max(...achados.map(precisa)));
      if (d > teto) return null;
    }
  };

  const y = procurar(
    (o) => repouso.bottom - o.top + folga,
    (d) => deslocar(repouso, 0, d),
  );
  if (y !== null) return { x: 0, y };
  const x = procurar(
    (o) => repouso.right - o.left + folga,
    (d) => deslocar(repouso, d, 0),
  );
  if (x !== null) return { x, y: 0 };
  return { x: 0, y: teto };
}
