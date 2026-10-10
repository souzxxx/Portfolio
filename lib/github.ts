/**
 * As contribuições do GitHub de souzxxx nos últimos 12 meses — o dado vivo do
 * "Um ano em blocos".
 *
 * BUSCADO NO SERVIDOR, NUNCA NO NAVEGADOR. A busca roda no build e depois a
 * cada 24h por ISR (`revalidate: 86400`): o visitante recebe HTML pronto, sem
 * spinner, sem request a terceiro saindo do aparelho dele e sem limite de taxa
 * de API dividido entre todos os visitantes.
 *
 * DUAS FONTES, NA ORDEM:
 *   1. com `GITHUB_TOKEN` no ambiente, a GraphQL oficial (contributionCalendar);
 *   2. sem token, a API pública de jogruber, que raspa o mesmo calendário.
 *
 * FALHAR É PERMITIDO, QUEBRAR NÃO. Qualquer erro (rede, timeout, JSON com outro
 * formato, usuário sem dia nenhum) devolve `null`, e quem chama simplesmente
 * não renderiza a faixa. Um heatmap é ornamento: ele não pode derrubar o build
 * da página que existe para mostrar o resto.
 */

export const GITHUB_USER = "souzxxx";

export interface Dia {
  /** "AAAA-MM-DD", em UTC — o calendário do GitHub não tem hora. */
  data: string;
  n: number;
}

export interface Contribuicoes {
  total: number;
  dias: Dia[];
}

const UM_DIA = 86400;
const TIMEOUT_MS = 8000;

async function viaGraphQL(token: string): Promise<Contribuicoes | null> {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: GITHUB_USER } }),
    next: { revalidate: UM_DIA },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const cal =
    json?.data?.user?.contributionsCollection?.contributionCalendar ?? null;
  if (!cal || !Array.isArray(cal.weeks)) return null;
  const dias: Dia[] = [];
  for (const semana of cal.weeks) {
    for (const d of semana.contributionDays ?? []) {
      dias.push({ data: String(d.date), n: Number(d.contributionCount) || 0 });
    }
  }
  return { total: Number(cal.totalContributions) || 0, dias };
}

async function viaPublica(): Promise<Contribuicoes | null> {
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`,
    { next: { revalidate: UM_DIA }, signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  if (!res.ok) return null;
  const json = await res.json();
  if (!Array.isArray(json?.contributions)) return null;
  const dias: Dia[] = json.contributions.map(
    (d: { date: unknown; count: unknown }) => ({
      data: String(d.date),
      n: Number(d.count) || 0,
    }),
  );
  const total =
    Number(json?.total?.lastYear) || dias.reduce((s, d) => s + d.n, 0);
  return { total, dias };
}

export async function getContribuicoes(): Promise<Contribuicoes | null> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const dados = (token ? await viaGraphQL(token) : null) ?? (await viaPublica());
    if (!dados) return null;
    // Ordem garantida e formato validado: um dia fora do padrão AAAA-MM-DD
    // desalinharia a grade inteira (a coluna sai do dia da semana).
    const dias = dados.dias
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.data))
      .sort((a, b) => (a.data < b.data ? -1 : 1));
    if (dias.length < 28) return null;
    return { total: dados.total, dias };
  } catch {
    return null;
  }
}

/**
 * Nível 0–5 de cada dia. 0 = nada; 1–4 = creme em opacidade crescente; 5 = o
 * topo, em dourado.
 *
 * POR QUE NÃO USAR O `level` QUE A API JÁ DEVOLVE: ele é por quartil do MÁXIMO,
 * e um único dia de 214 commits jogava 357 dos 371 dias no nível 1 — a grade
 * saía chapada, um bloco só de um tom. Aqui a escala é logarítmica entre 1 e o
 * percentil 95 dos dias ativos, e o que passa do p95 vira dourado: o dourado
 * marca os ~5% de dias fora da curva, não um outlier solitário.
 */
export function niveis(dias: Dia[]): number[] {
  const ativos = dias
    .map((d) => d.n)
    .filter((n) => n > 0)
    .sort((a, b) => a - b);
  if (ativos.length === 0) return dias.map(() => 0);
  const p95 = Math.max(2, ativos[Math.floor(ativos.length * 0.95)] ?? 2);
  const teto = Math.log(p95);
  return dias.map(({ n }) => {
    if (n <= 0) return 0;
    if (n >= p95) return 5;
    return Math.min(4, 1 + Math.floor((Math.log(n) / teto) * 4));
  });
}

/** Maior sequência de dias seguidos com pelo menos uma contribuição. */
export function maiorSequencia(dias: Dia[]): number {
  let melhor = 0;
  let atual = 0;
  for (const d of dias) {
    atual = d.n > 0 ? atual + 1 : 0;
    if (atual > melhor) melhor = atual;
  }
  return melhor;
}
