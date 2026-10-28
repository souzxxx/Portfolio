import { CELULA_A, CELULA_L, pintarSeMaisForte, type Quadro } from "./grade";

/**
 * As ondas que o mouse abre na mesa: anéis em ASCII que crescem e somem.
 *
 * Cada onda são dois anéis concêntricos (o principal e um eco 18 px atrás,
 * mais fraco), achatados na vertical para parecerem deitados na mesa. O
 * caractere de cada célula do anel é a TANGENTE do anel naquele ponto
 * (`- \ | /`), o que dá o desenho de um círculo com quatro glifos só.
 *
 * São desenhadas ANTES do Mac, num quadro recém-limpo: o Mac pinta por cima
 * com `pintar` e os anéis passam por BAIXO dele, como no protótipo aprovado.
 * Só aparecem na mesa em volta. Pintam com `pintarSeMaisForte`, que aqui só
 * decide entre dois anéis que se cruzam: fica o mais forte.
 */
export interface Onda {
  /** Centro, em px da mesa. */
  x: number;
  y: number;
  /** Instante em que nasceu, em segundos. */
  t0: number;
  /** 0–1: o rastro do mouse é fraco, o clique é forte. */
  forca: number;
}

export const ONDA_VIDA_S = 2.3;
/** px/s do anel de uma onda de força 1. */
export const ONDA_VEL = 150;
/** Quanto a onda é achatada na vertical (perspectiva da mesa). */
export const ONDA_ACHATA = 0.8;
/** Mais que isso e o rastro de um mouse rápido vira ruído. */
export const MAX_ONDAS = 10;
/** Deslocamento do mouse entre uma onda de rastro e a próxima. */
export const ONDA_PASSO_PX = 50;

/** Meia espessura do anel, em px. */
const ESPESSURA = 6;
/** O eco vem esse tanto atrás do anel principal. */
const ATRASO_ECO = 18;
const R_INICIAL = 8;

/** Na ordem do ângulo da tangente, de 45° em 45°, começando na horizontal. */
const GLIFOS_ANEL = ["-", "\\", "|", "/"] as const;

/**
 * O glifo da tangente do anel no ponto (dx, dy) em relação ao centro, com y
 * para baixo como na tela. Somar 90° ao ângulo do raio dá a tangente, e o
 * resto por 180° junta os dois lados opostos do anel no mesmo glifo.
 */
export function glifoDoAnel(dx: number, dy: number): "-" | "\\" | "|" | "/" {
  let phi = (Math.atan2(dy, dx) + Math.PI / 2) % Math.PI;
  if (phi < 0) phi += Math.PI;
  return GLIFOS_ANEL[Math.round(phi / (Math.PI / 4)) % 4];
}

/**
 * Pinta as ondas vivas no instante `t` e devolve só elas, sem mexer no array
 * recebido: quem chama troca a lista dele pela devolvida.
 */
export function desenharOndas(q: Quadro, ondas: Onda[], t: number): Onda[] {
  const vivas = ondas.filter((o) => t - o.t0 < ONDA_VIDA_S);
  for (const o of vivas) {
    const idade = t - o.t0;
    const fade = 1 - idade / ONDA_VIDA_S;
    for (let anel = 0; anel < 2; anel++) {
      const R = idade * ONDA_VEL * (0.55 + 0.45 * o.forca) + R_INICIAL - anel * ATRASO_ECO;
      const alfa = o.forca * fade * (anel ? 0.4 : 0.75);
      if (R < ESPESSURA || alfa < 0.02) continue;
      // só a caixa do anel, com uma célula de folga, não a mesa inteira
      const i0 = Math.max(0, Math.floor((o.x - R) / CELULA_L) - 1);
      const i1 = Math.min(q.cols - 1, Math.ceil((o.x + R) / CELULA_L) + 1);
      const j0 = Math.max(0, Math.floor((o.y - R * ONDA_ACHATA) / CELULA_A) - 1);
      const j1 = Math.min(q.linhas - 1, Math.ceil((o.y + R * ONDA_ACHATA) / CELULA_A) + 1);
      for (let j = j0; j <= j1; j++) {
        // desfazer o achatamento em y faz o anel elíptico virar um círculo
        const dy = (j * CELULA_A + CELULA_A / 2 - o.y) / ONDA_ACHATA;
        for (let i = i0; i <= i1; i++) {
          const dx = i * CELULA_L + CELULA_L / 2 - o.x;
          if (Math.abs(Math.sqrt(dx * dx + dy * dy) - R) < ESPESSURA) {
            pintarSeMaisForte(q, i, j, glifoDoAnel(dx, dy), alfa);
          }
        }
      }
    }
  }
  return vivas;
}
