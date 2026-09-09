import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leonardo Souza — Currículo",
  description:
    "Currículo de uma página: backend e sistemas de IA em produção. Ciência da Computação no Insper, São Paulo.",
  robots: { index: false, follow: false },
};

// Documento de impressão: fundo branco, texto escuro, tipografia do sistema.
// Deliberadamente fora da estética dark do site — isto é feito para sair em A4
// (e é a fonte do public/leonardo-souza-cv.pdf, gerado por scripts/build-cv.ts).
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
.cv-section { margin-top: 15px; }
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
.cv-line + .cv-line { margin-top: 3px; }
.cv-label { font-weight: 600; color: var(--ink); }
.cv-soft { color: var(--ink-soft); }

.cv-foot {
  margin-top: 16px;
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

export default function CvPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <article className="cv">
        <header>
          <h1 className="cv-name">Leonardo Souza</h1>
          <p className="cv-role">Backend &amp; AI Engineer</p>
          <p className="cv-contact">
            <span>São Paulo, BR</span>
            <span className="cv-sep">·</span>
            <a href="mailto:leonardosouzasilva9@gmail.com">
              leonardosouzasilva9@gmail.com
            </a>
            <span className="cv-sep">·</span>
            <a href="https://github.com/souzxxx">github.com/souzxxx</a>
            <span className="cv-sep">·</span>
            <a href={`https://${SITE}`}>{SITE}</a>
          </p>
        </header>

        <section className="cv-section">
          <h2 className="cv-h2">Resumo</h2>
          <p className="cv-summary">
            Estudante de Ciência da Computação no Insper (4º semestre). Construo
            backend e sistemas de IA em produção — assistente LLM sobre dados
            reais de usuário, fila outbox com retry exponencial e idempotência,
            rate limit em Redis com circuit breaker e streaming em tempo real.
            Escrevo teste de integração contra Postgres e Redis de verdade, não
            contra mock.
          </p>
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Projetos</h2>

          <div className="cv-item">
            <div className="cv-item-head">
              <h3 className="cv-item-name">
                E-commerce transacional (sob NDA)
              </h3>
              <span className="cv-item-meta">2026 · repositório privado</span>
            </div>
            <p className="cv-item-stack">
              Java 21 · Spring Boot 4.1 · PostgreSQL · Redis · Next.js ·
              Testcontainers · Flyway
            </p>
            <ul className="cv-bullets">
              <li>
                Loja própria de uma marca brasileira — nome sob contrato — em
                monolito modular de 12 domínios, com storefront Next.js.
              </li>
              <li>
                Outbox transacional para e-mails: claim em transação curta,
                envio fora de lock e backoff exponencial de 30s dobrando até 1h,
                com jitter.
              </li>
              <li>
                Idempotência ponta a ponta: webhook de pagamento validado por
                assinatura e deduplicado; Idempotency-Key no provedor de e-mail.
              </li>
              <li>
                Rate limit por chave em Redis via script Lua atômico, que falha
                aberto e tem circuit breaker com sonda em half-open.
              </li>
              <li>
                Migrações Flyway e 218 arquivos de teste — 139 no backend, com
                Testcontainers subindo Postgres e Redis reais, e 79 no frontend.
              </li>
            </ul>
          </div>

          <div className="cv-item">
            <div className="cv-item-head">
              <h3 className="cv-item-name">FinanceHub</h3>
              <span className="cv-item-meta">
                2026 · financehub-web-ecru.vercel.app
              </span>
            </div>
            <p className="cv-item-stack">
              Next.js · TypeScript · Python/FastAPI · Supabase · PostgreSQL ·
              Groq (Llama 3.3)
            </p>
            <ul className="cv-bullets">
              <li>
                Plataforma financeira em produção com a assistente Luna:
                contexto montado a partir das transações, categorias e
                orçamentos do próprio usuário autenticado, por consulta
                parametrizada filtrada por user_id.
              </li>
              <li>
                Teto de 500 tokens de saída e histórico truncado nas últimas 10
                mensagens, para segurar custo por request e qualidade da
                resposta.
              </li>
              <li>
                Rate limit por rota com slowapi: 30 req/h no chat, 10/h nos
                insights, 5/h no relatório mensal.
              </li>
              <li>
                Row Level Security no Postgres nas tabelas do digest; monorepo
                Turbo (FastAPI + Next.js) com deploy contínuo na Vercel.
              </li>
            </ul>
          </div>

          <div className="cv-item">
            <div className="cv-item-head">
              <h3 className="cv-item-name">Sentinel</h3>
              <span className="cv-item-meta">
                2026 · github.com/souzxxx/sentinel
              </span>
            </div>
            <p className="cv-item-stack">
              Next.js 16 · React Three Fiber · GLSL · Python/FastAPI · WebSocket
              · Docker
            </p>
            <ul className="cv-bullets">
              <li>
                Dashboard 3D de monitoramento: o backend FastAPI empurra
                métricas de CPU, RAM e disco por WebSocket, com reconexão
                automática e limite de tentativas.
              </li>
              <li>
                Shaders GLSL próprios (plasma, grid holográfico, glitch)
                dirigidos pelas métricas que chegam em tempo real.
              </li>
            </ul>
          </div>
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Formação</h2>
          <p className="cv-line">
            <span className="cv-label">Insper</span> — Bacharelado em Ciência da
            Computação, 4º semestre (em curso, 2026).
          </p>
          <p className="cv-line cv-soft">
            Destaques: Projeto de Software (microsserviços com Docker), Machine
            Learning, Inteligência Artificial (Q-Learning, SARSA), Sistemas
            Hardware/Software.
          </p>
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Stack</h2>
          <p className="cv-line">
            <span className="cv-label">Linguagens</span>{" "}
            <span className="cv-soft">
              TypeScript, Python, Java, JavaScript, C, Prolog
            </span>
          </p>
          <p className="cv-line">
            <span className="cv-label">Backend &amp; web</span>{" "}
            <span className="cv-soft">
              Next.js, React, FastAPI, Spring Boot
            </span>
          </p>
          <p className="cv-line">
            <span className="cv-label">Dados</span>{" "}
            <span className="cv-soft">PostgreSQL, Redis, Supabase</span>
          </p>
          <p className="cv-line">
            <span className="cv-label">Infra &amp; qualidade</span>{" "}
            <span className="cv-soft">
              Docker, Vercel, GitHub Actions, Testcontainers, Flyway
            </span>
          </p>
        </section>

        <footer className="cv-foot">
          <span>Atualizado em setembro de 2026</span>
          <span>{SITE}</span>
        </footer>
      </article>
    </>
  );
}
