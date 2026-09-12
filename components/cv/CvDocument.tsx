import { pick, type I18n, type Lang } from "@/lib/i18n";

/**
 * CvDocument — o currículo de uma página, nos dois idiomas.
 *
 * O texto mora AQUI, e não em lib/dict.ts, de propósito. O currículo não divide
 * uma frase sequer com a home: é outro documento, com outra voz (telegráfica,
 * sem parágrafo de apresentação) e outro ciclo de revisão — mexer num bullet
 * daqui não pode obrigar a reabrir o dicionário do site inteiro. O que o site e
 * o currículo de fato compartilham é só o contrato de idioma, que vem de
 * lib/i18n.ts.
 *
 * O CSS abaixo é o mesmo de antes, byte a byte, e continua sendo o que faz o
 * documento caber em UMA página A4 (guard em scripts/build-cv.ts). As DUAS
 * rotas de currículo existem e renderizam este mesmo componente com o `lang`
 * trocado: app/(pt)/cv → /cv e app/(en)/en/cv → /en/cv. "npm run cv" gera os
 * dois PDFs numa passada e só então reprova, de modo que um idioma que estoura
 * não esconde o estado do outro.
 *
 * O ORÇAMENTO VERTICAL, MEDIDO. Na caixa útil do A4 com as margens de 14mm do
 * script (182×269 mm = 1016,7 px em mídia `print`), os dois documentos fecham
 * hoje em 1006,1 px — ou seja, **10,6 px de folga, que é 0,63 de uma linha de
 * corpo** (9pt × 1.4 = 16,8 px). Os dois idiomas empatam na altura porque
 * empatam linha a linha em todos os blocos; não é coincidência, é o que a
 * revisão abaixo garantiu.
 *
 * Como o CSS é um só, uma linha a mais em QUALQUER um dos dois idiomas passa
 * dos 1016,7 px e vira um currículo de duas páginas — não existe meia linha de
 * crédito. Ao mexer em texto aqui, rode "npm run cv".
 *
 * O inglês já estourou uma vez por este caminho, e vale registrar onde: os
 * blocos de cabeçalho, resumo, formação, stack e rodapé saem com a MESMA
 * altura nos dois idiomas (o inglês é mais curto no resumo, mas não a ponto de
 * ganhar linha), e a diferença inteira — 33,6 px, exatamente 2 linhas — estava
 * na seção de projetos: dois bullets do primeiro projeto ("loja própria" e
 * "rate limit por chave") viravam duas linhas em inglês e uma em português,
 * por serem traduções mais prolixas que o original, não por dizerem mais. Eles
 * foram reescritos telegraficamente, sem perder nenhum dado, para caber numa
 * linha como os equivalentes em português. A medida de uma linha aqui é de
 * ~116 caracteres; abaixo de ~113 há margem para a variação de glifo.
 */

/**
 * Campo que não muda de idioma: nome próprio, URL, lista de tecnologia. Ele
 * passa pelo mesmo `I18n` dos outros para o componente ler tudo por `pick()`,
 * mas escrito uma vez só — duplicar "github.com/souzxxx/sentinel" nas duas
 * línguas seria criar um lugar onde elas podem discordar do endereço.
 */
function igual<T>(valor: T): I18n<T> {
  return { pt: valor, en: valor };
}

interface Projeto {
  nome: I18n<string>;
  /** Ano e onde o código mora. */
  meta: I18n<string>;
  /** Linha de tecnologias: só nome próprio, nunca traduz. */
  stack: string;
  bullets: I18n<string[]>;
}

interface LinhaStack {
  rotulo: I18n<string>;
  itens: I18n<string>;
}

interface CvTexto {
  /** A linha sob o nome, em acento. */
  papel: I18n<string>;
  titulos: {
    resumo: I18n<string>;
    projetos: I18n<string>;
    formacao: I18n<string>;
    stack: I18n<string>;
  };
  resumo: I18n<string>;
  projetos: Projeto[];
  formacao: {
    /** Vem depois do <span> com "Insper", que é nome próprio e fica fora. */
    grau: I18n<string>;
    rotuloAtual: I18n<string>;
    atual: I18n<string>;
    rotuloAnteriores: I18n<string>;
    anteriores: I18n<string>;
  };
  stack: LinhaStack[];
  atualizado: I18n<string>;
}

const texto: CvTexto = {
  papel: { pt: "Backend, Web & IA", en: "Backend, Web & AI" },

  titulos: {
    resumo: { pt: "Resumo", en: "Summary" },
    projetos: { pt: "Projetos", en: "Projects" },
    formacao: { pt: "Formação", en: "Education" },
    stack: igual("Stack"),
  },

  resumo: {
    pt:
      "Estudante de Ciência da Computação no Insper (5º semestre). Trabalho " +
      "em backend, web e IA aplicada: assistente LLM sobre dados reais de " +
      "usuário, busca vetorial em Postgres com pgvector, fila outbox com " +
      "retry exponencial e idempotência, rate limit em Redis com circuit " +
      "breaker, e front-end Next.js/TypeScript em sistema com usuário real. " +
      "Escrevo teste de integração contra Postgres e Redis, não contra mock.",
    en:
      "Computer Science student at Insper (fifth semester). I work on " +
      "backend, web and applied AI: an LLM assistant over real user data, " +
      "vector search in Postgres with pgvector, an outbox queue with " +
      "exponential retry and idempotency, rate limiting in Redis with a " +
      "circuit breaker, and a Next.js/TypeScript front-end in a system with " +
      "real users. I write integration tests against Postgres and Redis, not " +
      "mocks.",
  },

  projetos: [
    {
      nome: {
        pt: "E-commerce transacional (sob NDA)",
        en: "Transactional e-commerce (under NDA)",
      },
      meta: {
        pt: "2026 · repositório privado",
        en: "2026 · private repository",
      },
      stack:
        "Java 21 · Spring Boot 4.1 · PostgreSQL · Redis · Next.js · " +
        "Testcontainers · Flyway",
      bullets: {
        pt: [
          "Loja própria de uma marca brasileira — nome sob contrato — monolito modular de 12 domínios com storefront Next.js.",
          "Outbox transacional para e-mails: claim em transação curta, envio fora de lock e backoff exponencial de 30s dobrando até 1h, com jitter.",
          "Idempotência ponta a ponta: webhook de pagamento validado por assinatura e deduplicado; Idempotency-Key no provedor de e-mail.",
          "Rate limit por chave em Redis via script Lua atômico, que falha aberto e tem circuit breaker com sonda em half-open.",
          "Migrações Flyway e 218 arquivos de teste — 139 no backend, com Testcontainers subindo Postgres e Redis reais, e 79 no frontend.",
        ],
        en: [
          "Own store for a Brazilian brand — name under contract — modular monolith of 12 domains with a Next.js storefront.",
          "Transactional outbox for email: claim in a short transaction, send outside the lock, and exponential backoff from 30s doubling to 1h, with jitter.",
          "End-to-end idempotency: payment webhook validated by signature and deduplicated; Idempotency-Key on the email provider.",
          "Per-key rate limit in Redis via an atomic Lua script that fails open, with a circuit breaker and half-open probe.",
          "Flyway migrations and 218 test files — 139 on the backend, with Testcontainers bringing up real Postgres and Redis, and 79 on the frontend.",
        ],
      },
    },
    {
      nome: igual("FinanceHub"),
      meta: igual("2026 · financehub-web-ecru.vercel.app"),
      stack:
        "Next.js · TypeScript · Python/FastAPI · Supabase · PostgreSQL · " +
        "Groq (Llama 3.3)",
      bullets: {
        pt: [
          "Plataforma financeira em produção com a assistente Luna: contexto montado das transações, categorias e orçamentos do próprio usuário autenticado, por consulta parametrizada filtrada por user_id.",
          "Custo por requisição contido: teto de 500 tokens de saída, histórico truncado em 10 mensagens e rate limit por rota com slowapi (30 req/h no chat, 10/h nos insights, 5/h no relatório).",
          "Row Level Security no Postgres, nas tabelas do digest; monorepo Turbo (FastAPI + Next.js) com deploy contínuo na Vercel.",
        ],
        en: [
          "Finance platform in production with the Luna assistant: context built from the authenticated user's own transactions, categories and budgets, through a parameterized query filtered by user_id.",
          "Cost per request kept in check: a 500-token output cap, history truncated to 10 messages, and per-route rate limiting with slowapi (30 req/h on chat, 10/h on insights, 5/h on the report).",
          "Row Level Security in Postgres, on the digest tables; Turbo monorepo (FastAPI + Next.js) with continuous deploys on Vercel.",
        ],
      },
    },
    {
      nome: igual("Project Wraeclast"),
      meta: igual("2026 · github.com/souzxxx/project-wraeclast"),
      stack:
        "Python · FastAPI · PostgreSQL · pgvector · Next.js · GitHub Actions",
      bullets: {
        pt: [
          "Assistente com RAG: busca vetorial em Postgres com pgvector, embeddings de 1024 dimensões e índice HNSW por distância de cosseno — sem fine-tuning, com a resposta do LLM restrita ao contexto recuperado.",
          "Coleta diária em GitHub Actions, separada da API serverless pelo teto de tempo de execução; 350 testes em pytest e CI de ruff + pytest a cada push.",
        ],
        en: [
          "RAG assistant: vector search in Postgres with pgvector, 1024-dimension embeddings and an HNSW index on cosine distance — no fine-tuning, with the LLM answer restricted to the retrieved context.",
          "Daily data collection in GitHub Actions, kept out of the serverless API by the execution time cap; 350 pytest tests and CI of ruff + pytest on every push.",
        ],
      },
    },
    {
      nome: igual("Sentinel"),
      meta: igual("2026 · github.com/souzxxx/sentinel"),
      stack:
        "Next.js 16 · React Three Fiber · GLSL · Python/FastAPI · WebSocket · " +
        "Docker",
      bullets: {
        pt: [
          "Dashboard 3D de monitoramento: backend FastAPI empurra métricas de CPU, RAM e disco por WebSocket, com reconexão automática, e shaders GLSL próprios dirigidos por elas.",
        ],
        en: [
          "3D monitoring dashboard: a FastAPI backend pushes CPU, RAM and disk metrics over WebSocket, with automatic reconnection, and custom GLSL shaders driven by them.",
        ],
      },
    },
  ],

  formacao: {
    grau: {
      pt: "— Bacharelado em Ciência da Computação, 5º semestre (em curso, 2026).",
      en: "— B.S. in Computer Science, fifth semester (in progress, 2026).",
    },
    rotuloAtual: { pt: "Semestre atual:", en: "Current semester:" },
    atual: {
      pt:
        "Plataformas, Microsserviços e APIs; Startup em Inteligência " +
        "Artificial; Megadados; Análise de Algoritmos e Entrevistas " +
        "Técnicas; Jogos e Interação.",
      en:
        "Platforms, Microservices and APIs; AI Startup; Big Data; Algorithm " +
        "Analysis and Technical Interviews; Games and Interaction.",
    },
    rotuloAnteriores: { pt: "Anteriores:", en: "Earlier:" },
    anteriores: {
      pt: "Projeto de Software; Machine Learning; Inteligência Artificial (Q-Learning, SARSA).",
      en: "Software Design; Machine Learning; Artificial Intelligence (Q-Learning, SARSA).",
    },
  },

  stack: [
    {
      rotulo: { pt: "Linguagens", en: "Languages" },
      itens: igual("TypeScript, Python, Java, JavaScript, C, Prolog"),
    },
    {
      rotulo: igual("Backend & web"),
      itens: igual("Node.js, Next.js, React, FastAPI, Spring Boot, REST"),
    },
    {
      rotulo: { pt: "Dados & IA", en: "Data & AI" },
      itens: {
        pt: "PostgreSQL, pgvector, Redis, Supabase, RAG e embeddings",
        en: "PostgreSQL, pgvector, Redis, Supabase, RAG and embeddings",
      },
    },
    {
      rotulo: { pt: "Infra & qualidade", en: "Infra & quality" },
      itens: igual("Docker, Vercel, GitHub Actions, Testcontainers, Flyway"),
    },
  ],

  atualizado: {
    pt: "Atualizado em setembro de 2026",
    en: "Updated September 2026",
  },
};

// Documento de impressão: fundo branco, texto escuro, tipografia do sistema.
// Deliberadamente fora da estética dark do site — isto é feito para sair em A4
// (e é a fonte dos dois PDFs em public/, gerados por scripts/build-cv.ts).
const css = `
:root { color-scheme: light; }

html, body {
  background: #ffffff !important;
  background-image: none !important;
  color: #18181b !important;
}

.cv {
  --ink: #18181b;
  --ink-soft: #3f3f46;
  --ink-faint: #71717a;
  --rule: #d4d4d8;
  --accent: #3730a3;

  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, "Helvetica Neue", sans-serif;
  font-size: 9pt;
  line-height: 1.4;
  color: var(--ink);
  max-width: 760px;
  margin: 0 auto;
  padding: 28px 24px 40px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.cv a { color: var(--accent); text-decoration: none; }

/* ─── cabeçalho ─────────────────────────────────────────── */
.cv-name {
  font-size: 20pt;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1.1;
  margin: 0;
}
.cv-role {
  font-size: 10.5pt;
  font-weight: 600;
  color: var(--accent);
  margin: 3px 0 0;
  letter-spacing: 0.005em;
}
.cv-contact {
  font-size: 8.5pt;
  color: var(--ink-soft);
  margin: 7px 0 0;
}
.cv-contact span { white-space: nowrap; }
.cv-sep { color: var(--ink-faint); padding: 0 5px; }

/* ─── seções ────────────────────────────────────────────── */
/* Ritmo vertical apertado de propósito: o CV tem que caber em UMA página A4
   (guard em scripts/build-cv.ts). Ao mexer nestes espaçamentos, rode
   "npm run cv" — ele reprova se o PDF sair com duas páginas. */
.cv-section { margin-top: 13px; }
.cv-h2 {
  font-size: 8.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: var(--ink);
  margin: 0 0 7px;
  padding-bottom: 3px;
  border-bottom: 1px solid var(--rule);
}

.cv-summary { margin: 0; color: var(--ink-soft); }

/* ─── projetos ──────────────────────────────────────────── */
.cv-item { margin-top: 9px; break-inside: avoid; page-break-inside: avoid; }
.cv-item:first-of-type { margin-top: 0; }
.cv-item-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.cv-item-name { font-size: 10pt; font-weight: 700; margin: 0; }
.cv-item-meta {
  font-size: 8pt;
  color: var(--ink-faint);
  white-space: nowrap;
  text-align: right;
}
.cv-item-stack {
  font-size: 8pt;
  color: var(--ink-faint);
  margin: 1px 0 3px;
}
.cv-bullets { margin: 0; padding: 0; list-style: none; }
.cv-bullets li {
  position: relative;
  padding-left: 11px;
  margin-top: 2px;
  color: var(--ink-soft);
}
.cv-bullets li::before {
  content: "";
  position: absolute;
  left: 2px;
  top: 0.52em;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--ink-faint);
}

/* ─── formação e stack ──────────────────────────────────── */
.cv-line { margin: 0; }
.cv-line + .cv-line { margin-top: 2px; }
.cv-label { font-weight: 600; color: var(--ink); }
.cv-soft { color: var(--ink-soft); }

.cv-foot {
  margin-top: 12px;
  padding-top: 6px;
  border-top: 1px solid var(--rule);
  font-size: 7.5pt;
  color: var(--ink-faint);
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

/* ─── impressão ─────────────────────────────────────────── */
@media print {
  @page { size: A4; margin: 14mm; }
  html, body { margin: 0; padding: 0; }
  .cv { max-width: none; margin: 0; padding: 0; }
  .cv a { color: var(--ink); }
  nav, header[role="banner"], footer[role="contentinfo"], .no-print {
    display: none !important;
  }
}
`;

const SITE = "portfolio-souzxxxs-projects.vercel.app";

export function CvDocument({ lang }: { lang: Lang }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <article className="cv">
        <header>
          <h1 className="cv-name">Leonardo Souza</h1>
          <p className="cv-role">{pick(texto.papel, lang)}</p>
          {/* Uma linha só: com o LinkedIn, os quatro itens mais o endereço do
              site quebravam para uma segunda linha, e a folga vertical do A4
              não paga essa linha (guard em scripts/build-cv.ts). O site saiu
              daqui porque já aparece, igual, no rodapé deste mesmo documento.
              A cidade fica como está nos dois idiomas: "São Paulo, BR" é
              endereço, e a sigla do país já é a que o leitor de fora espera. */}
          <p className="cv-contact">
            <span>São Paulo, BR</span>
            <span className="cv-sep">·</span>
            <a href="mailto:leonardosouzasilva9@gmail.com">
              leonardosouzasilva9@gmail.com
            </a>
            <span className="cv-sep">·</span>
            <a href="https://github.com/souzxxx">github.com/souzxxx</a>
            <span className="cv-sep">·</span>
            <a href="https://www.linkedin.com/in/leonardo-souzx">
              linkedin.com/in/leonardo-souzx
            </a>
          </p>
        </header>

        <section className="cv-section">
          <h2 className="cv-h2">{pick(texto.titulos.resumo, lang)}</h2>
          <p className="cv-summary">{pick(texto.resumo, lang)}</p>
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">{pick(texto.titulos.projetos, lang)}</h2>

          {texto.projetos.map((projeto) => {
            const nome = pick(projeto.nome, lang);
            return (
              <div className="cv-item" key={nome}>
                <div className="cv-item-head">
                  <h3 className="cv-item-name">{nome}</h3>
                  <span className="cv-item-meta">{pick(projeto.meta, lang)}</span>
                </div>
                <p className="cv-item-stack">{projeto.stack}</p>
                <ul className="cv-bullets">
                  {pick(projeto.bullets, lang).map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">{pick(texto.titulos.formacao, lang)}</h2>
          <p className="cv-line">
            <span className="cv-label">Insper</span>{" "}
            {pick(texto.formacao.grau, lang)}
          </p>
          {/* Nome de disciplina sai exato como consta em lib/academic.ts, NOS
              DOIS idiomas — inclusive "AI Startup" e "Software Design", que é
              como a linha do tempo do site já traduz "Startup em Inteligência
              Artificial" e "Projeto de Software". Título de matéria não é nome
              próprio (um recrutador de fora não tem como pesar "Megadados"),
              mas a mesma matéria não pode aparecer com dois nomes diferentes no
              mesmo site. Abreviar também não: cortar "Análise de Algoritmos e
              Entrevistas Técnicas" tira justamente a metade que interessa.
              Semestre atual e histórico em linhas separadas: coladas, liam como
              se tudo fosse o 5º semestre. */}
          <p className="cv-line cv-soft">
            <span className="cv-label">
              {pick(texto.formacao.rotuloAtual, lang)}
            </span>{" "}
            {pick(texto.formacao.atual, lang)}
          </p>
          <p className="cv-line cv-soft">
            <span className="cv-label">
              {pick(texto.formacao.rotuloAnteriores, lang)}
            </span>{" "}
            {pick(texto.formacao.anteriores, lang)}
          </p>
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">{pick(texto.titulos.stack, lang)}</h2>
          {texto.stack.map((linha) => {
            const rotulo = pick(linha.rotulo, lang);
            return (
              <p className="cv-line" key={rotulo}>
                <span className="cv-label">{rotulo}</span>{" "}
                <span className="cv-soft">{pick(linha.itens, lang)}</span>
              </p>
            );
          })}
        </section>

        <footer className="cv-foot">
          <span>{pick(texto.atualizado, lang)}</span>
          <span>{SITE}</span>
        </footer>
      </article>
    </>
  );
}
